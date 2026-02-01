'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser'
import { signIn } from 'next-auth/react'
import {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  getUserCredentials,
  deleteCredential,
  checkHasWebAuthnCredentials,
} from '@/lib/webauthn-actions'

// ============================================
// TYPES
// ============================================

export type WebAuthnCredential = {
  id: string
  deviceName: string | null
  created: Date
  lastUsed: Date | null
}

// ============================================
// FEATURE DETECTION
// ============================================

export function useWebAuthnSupport() {
  return {
    isSupported: typeof window !== 'undefined' && browserSupportsWebAuthn(),
  }
}

// ============================================
// REGISTRATION HOOK
// ============================================

export function useRegisterFingerprint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deviceName?: string) => {
      // Step 1: Get registration options from server
      const optionsResult = await getRegistrationOptions()
      
      if (!optionsResult.success || !optionsResult.options) {
        throw new Error(optionsResult.error || 'Failed to get registration options')
      }

      // Step 2: Start registration with browser (prompts for fingerprint)
      let attestation
      try {
        attestation = await startRegistration({ optionsJSON: optionsResult.options })
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            throw new Error('Registration was cancelled or timed out')
          }
          if (error.name === 'InvalidStateError') {
            throw new Error('This device is already registered')
          }
          throw new Error(`Browser error: ${error.message}`)
        }
        throw error
      }

      // Step 3: Verify registration on server
      const verifyResult = await verifyRegistration(attestation, deviceName)
      
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Failed to verify registration')
      }

      return { credentialId: verifyResult.credentialId }
    },
    onSuccess: () => {
      // Invalidate credentials query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['webauthn-credentials'] })
    },
  })
}

// ============================================
// AUTHENTICATION HOOK
// ============================================

export function useAuthenticateWithFingerprint() {
  return useMutation({
    mutationFn: async (username?: string) => {
      // Step 1: Get authentication options from server
      const optionsResult = await getAuthenticationOptions(username)
      
      if (!optionsResult.success || !optionsResult.options) {
        throw new Error(optionsResult.error || 'Failed to get authentication options')
      }

      // Step 2: Start authentication with browser (prompts for fingerprint)
      let assertion
      try {
        assertion = await startAuthentication({ optionsJSON: optionsResult.options })
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            throw new Error('Authentication was cancelled or timed out')
          }
          throw new Error(`Browser error: ${error.message}`)
        }
        throw error
      }

      // Step 3: Verify authentication on server
      const verifyResult = await verifyAuthentication(assertion)
      
      if (!verifyResult.success || !verifyResult.user) {
        throw new Error(verifyResult.error || 'Failed to verify authentication')
      }

      // Step 4: Create NextAuth session using the webauthn provider
      const signInResult = await signIn('webauthn', {
        memberId: verifyResult.user.id,
        redirect: false,
      })

      if (signInResult?.error) {
        throw new Error('Failed to create session')
      }

      return verifyResult.user
    },
  })
}

// ============================================
// CREDENTIALS MANAGEMENT HOOKS
// ============================================

export function useWebAuthnCredentials() {
  return useQuery({
    queryKey: ['webauthn-credentials'],
    queryFn: async () => {
      const result = await getUserCredentials()
      if (!result.success) {
        throw new Error(result.error || 'Failed to get credentials')
      }
      return result.credentials || []
    },
  })
}

export function useDeleteCredential() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentialId: string) => {
      const result = await deleteCredential(credentialId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete credential')
      }
      return { credentialId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webauthn-credentials'] })
    },
  })
}

// ============================================
// CHECK IF USER HAS CREDENTIALS
// ============================================

export function useCheckHasCredentials(username: string | undefined) {
  return useQuery({
    queryKey: ['webauthn-has-credentials', username],
    queryFn: async () => {
      if (!username) return false
      return checkHasWebAuthnCredentials(username)
    },
    enabled: !!username,
  })
}
