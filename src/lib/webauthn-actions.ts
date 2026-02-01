'use server'

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'

// Configuration - update these for your deployment
const RP_NAME = 'TCN Members Portal'
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost'
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000'

// Challenge store (in production, use Redis or database)
// For now, we use cookies with a short expiry
const CHALLENGE_COOKIE_NAME = 'webauthn_challenge'
const CHALLENGE_EXPIRY_MS = 60000 // 1 minute

// ============================================
// REGISTRATION FLOW
// ============================================

export type RegistrationOptionsResult = {
  success: boolean
  options?: Awaited<ReturnType<typeof generateRegistrationOptions>>
  error?: string
}

export async function getRegistrationOptions(): Promise<RegistrationOptionsResult> {
  try {
    // User must be logged in to register a credential
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'You must be logged in to register a fingerprint' }
    }

    const memberId = session.user.id

    // Get the auth record for this member
    const authRecord = await prisma.fnauth.findUnique({
      where: { fnmemberId: memberId },
      include: { 
        webauthnCredentials: true,
        fnmember: true 
      },
    })

    if (!authRecord) {
      return { success: false, error: 'Auth record not found' }
    }

    // Get existing credentials to exclude them
    const existingCredentials = authRecord.webauthnCredentials.map((cred) => ({
      id: cred.credentialId,
      transports: cred.transports 
        ? (JSON.parse(cred.transports) as AuthenticatorTransportFuture[])
        : undefined,
    }))

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: authRecord.username,
      userDisplayName: `${authRecord.fnmember.first_name} ${authRecord.fnmember.last_name}`,
      // Use the auth record ID as the user ID for WebAuthn
      userID: new TextEncoder().encode(authRecord.id),
      attestationType: 'none',
      excludeCredentials: existingCredentials,
      authenticatorSelection: {
        // Prefer platform authenticators (fingerprint, Face ID, Windows Hello)
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    })

    // Store challenge in a cookie for verification
    const cookieStore = await cookies()
    cookieStore.set(CHALLENGE_COOKIE_NAME, options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CHALLENGE_EXPIRY_MS / 1000,
      path: '/',
    })

    return { success: true, options }
  } catch (error) {
    console.error('Error generating registration options:', error)
    return { success: false, error: 'Failed to generate registration options' }
  }
}

export type VerifyRegistrationResult = {
  success: boolean
  error?: string
  credentialId?: string
}

export async function verifyRegistration(
  response: RegistrationResponseJSON,
  deviceName?: string
): Promise<VerifyRegistrationResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'You must be logged in' }
    }

    const memberId = session.user.id

    // Get challenge from cookie
    const cookieStore = await cookies()
    const challenge = cookieStore.get(CHALLENGE_COOKIE_NAME)?.value

    if (!challenge) {
      return { success: false, error: 'Challenge expired or not found. Please try again.' }
    }

    // Clear the challenge cookie
    cookieStore.delete(CHALLENGE_COOKIE_NAME)

    // Get auth record
    const authRecord = await prisma.fnauth.findUnique({
      where: { fnmemberId: memberId },
    })

    if (!authRecord) {
      return { success: false, error: 'Auth record not found' }
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return { success: false, error: 'Verification failed' }
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

    // Store the credential in the database
    await prisma.webAuthnCredential.create({
      data: {
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: BigInt(credential.counter),
        transports: response.response.transports 
          ? JSON.stringify(response.response.transports) 
          : null,
        deviceName: deviceName || `${credentialDeviceType}${credentialBackedUp ? ' (synced)' : ''}`,
        fnauthId: authRecord.id,
      },
    })

    return { success: true, credentialId: credential.id }
  } catch (error) {
    console.error('Error verifying registration:', error)
    return { success: false, error: 'Failed to verify registration' }
  }
}

// ============================================
// AUTHENTICATION FLOW
// ============================================

export type AuthenticationOptionsResult = {
  success: boolean
  options?: Awaited<ReturnType<typeof generateAuthenticationOptions>>
  error?: string
  hasCredentials?: boolean
}

export async function getAuthenticationOptions(
  username?: string
): Promise<AuthenticationOptionsResult> {
  try {
    let allowCredentials: { id: string; transports?: AuthenticatorTransportFuture[] }[] = []

    if (username) {
      // Find auth record by username
      const authRecord = await prisma.fnauth.findUnique({
        where: { username },
        include: { webauthnCredentials: true },
      })

      if (!authRecord || authRecord.webauthnCredentials.length === 0) {
        return { 
          success: false, 
          error: 'No fingerprint registered for this account',
          hasCredentials: false 
        }
      }

      allowCredentials = authRecord.webauthnCredentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports 
          ? (JSON.parse(cred.transports) as AuthenticatorTransportFuture[])
          : undefined,
      }))
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
    })

    // Store challenge in cookie
    const cookieStore = await cookies()
    cookieStore.set(CHALLENGE_COOKIE_NAME, options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CHALLENGE_EXPIRY_MS / 1000,
      path: '/',
    })

    // Also store the username if provided (for verification step)
    if (username) {
      cookieStore.set('webauthn_username', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CHALLENGE_EXPIRY_MS / 1000,
        path: '/',
      })
    }

    return { success: true, options, hasCredentials: allowCredentials.length > 0 }
  } catch (error) {
    console.error('Error generating authentication options:', error)
    return { success: false, error: 'Failed to generate authentication options' }
  }
}

export type VerifyAuthenticationResult = {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    tNumber: string
    verified: boolean
  }
}

export async function verifyAuthentication(
  response: AuthenticationResponseJSON
): Promise<VerifyAuthenticationResult> {
  try {
    const cookieStore = await cookies()
    const challenge = cookieStore.get(CHALLENGE_COOKIE_NAME)?.value
    const username = cookieStore.get('webauthn_username')?.value

    if (!challenge) {
      return { success: false, error: 'Challenge expired. Please try again.' }
    }

    // Clear cookies
    cookieStore.delete(CHALLENGE_COOKIE_NAME)
    cookieStore.delete('webauthn_username')

    // Find the credential by its ID
    const credential = await prisma.webAuthnCredential.findUnique({
      where: { credentialId: response.id },
      include: {
        fnauth: {
          include: { fnmember: true },
        },
      },
    })

    if (!credential) {
      return { success: false, error: 'Credential not found' }
    }

    // If username was provided, verify it matches
    if (username && credential.fnauth.username !== username) {
      return { success: false, error: 'Credential does not match the provided username' }
    }

    // Check account lockout
    if (credential.fnauth.lockedUntil && credential.fnauth.lockedUntil > new Date()) {
      return { success: false, error: 'Account is temporarily locked' }
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: Number(credential.counter),
        transports: credential.transports 
          ? (JSON.parse(credential.transports) as AuthenticatorTransportFuture[])
          : undefined,
      },
    })

    if (!verification.verified) {
      return { success: false, error: 'Authentication failed' }
    }

    // Update the credential counter and last used time
    await prisma.webAuthnCredential.update({
      where: { id: credential.id },
      data: {
        counter: BigInt(verification.authenticationInfo.newCounter),
        lastUsed: new Date(),
      },
    })

    // Update auth record - reset login attempts, update last login
    await prisma.fnauth.update({
      where: { id: credential.fnauth.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    })

    // Return user data for session creation
    return {
      success: true,
      user: {
        id: credential.fnauth.fnmemberId,
        email: credential.fnauth.email,
        firstName: credential.fnauth.fnmember.first_name,
        lastName: credential.fnauth.fnmember.last_name,
        tNumber: credential.fnauth.fnmember.t_number,
        verified: credential.fnauth.verified,
      },
    }
  } catch (error) {
    console.error('Error verifying authentication:', error)
    return { success: false, error: 'Failed to verify authentication' }
  }
}

// ============================================
// CREDENTIAL MANAGEMENT
// ============================================

export type GetCredentialsResult = {
  success: boolean
  credentials?: {
    id: string
    deviceName: string | null
    created: Date
    lastUsed: Date | null
  }[]
  error?: string
}

export async function getUserCredentials(): Promise<GetCredentialsResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' }
    }

    const authRecord = await prisma.fnauth.findUnique({
      where: { fnmemberId: session.user.id },
      include: { webauthnCredentials: true },
    })

    if (!authRecord) {
      return { success: false, error: 'Auth record not found' }
    }

    const credentials = authRecord.webauthnCredentials.map((cred) => ({
      id: cred.id,
      deviceName: cred.deviceName,
      created: cred.created,
      lastUsed: cred.lastUsed,
    }))

    return { success: true, credentials }
  } catch (error) {
    console.error('Error getting credentials:', error)
    return { success: false, error: 'Failed to get credentials' }
  }
}

export type DeleteCredentialResult = {
  success: boolean
  error?: string
}

export async function deleteCredential(credentialId: string): Promise<DeleteCredentialResult> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify the credential belongs to this user
    const credential = await prisma.webAuthnCredential.findFirst({
      where: {
        id: credentialId,
        fnauth: { fnmemberId: session.user.id },
      },
    })

    if (!credential) {
      return { success: false, error: 'Credential not found or not authorized' }
    }

    await prisma.webAuthnCredential.delete({
      where: { id: credentialId },
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting credential:', error)
    return { success: false, error: 'Failed to delete credential' }
  }
}

// ============================================
// HELPER: Check if user has WebAuthn credentials
// ============================================

export async function checkHasWebAuthnCredentials(username: string): Promise<boolean> {
  try {
    const authRecord = await prisma.fnauth.findUnique({
      where: { username },
      include: { webauthnCredentials: true },
    })

    return (authRecord?.webauthnCredentials.length ?? 0) > 0
  } catch {
    return false
  }
}
