"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { sendPasswordResetEmail } from "./email"

// Validation schemas
const registerSchema = z.object({
  t_number: z.string().min(1, "Treaty number is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function registerMember(formData: {
  t_number: string
  username: string
  email: string
  password: string
}): Promise<ActionResult<{ username: string; email: string }>> {
  try {
    // Validate input
    const validatedData = registerSchema.parse(formData)

    // Check if treaty number exists in fnmember table
    // Include auth and profile to check activation status
    const member = await prisma.fnmember.findUnique({
      where: { t_number: validatedData.t_number },
      include: { 
        auth: true,
        profile: true
      }
    })

    if (!member) {
      return {
        success: false,
        error: "Treaty number not found in our records. Please contact the band office."
      }
    }

    // Check if member already has credentials (auth record exists)
    if (member.auth) {
      return {
        success: false,
        error: "This treaty number already has an account. Please use the login page."
      }
    }

    // Check if member has profile record (means they completed activation before)
    if (member.profile.length > 0) {
      return {
        success: false,
        error: "This treaty number is already registered. Please use the login page to sign in."
      }
    }

    // Check if username or email already exists
    const existingAuth = await prisma.fnauth.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email }
        ]
      }
    })

    if (existingAuth) {
      if (existingAuth.username === validatedData.username) {
        return {
          success: false,
          error: "Username already taken. Please choose another."
        }
      }
      if (existingAuth.email === validatedData.email) {
        return {
          success: false,
          error: "Email already registered. Please use a different email."
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create auth record
    const authRecord = await prisma.fnauth.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        fnmemberId: member.id,
        verified: false,
      },
      include: {
        fnmember: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            t_number: true,
          }
        }
      }
    })

    // Update member activation status
    await prisma.fnmember.update({
      where: { id: member.id },
      data: { activated: "PENDING" }
    })

    return {
      success: true,
      message: "Account created successfully! You can now login.",
      data: {
        username: authRecord.username,
        email: authRecord.email,
      }
    }
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed"
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred during registration"
    }
  }
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  try {
    const validatedData = forgotPasswordSchema.parse({ email })

    // Find user by email
    const authRecord = await prisma.fnauth.findUnique({
      where: { email: validatedData.email },
      include: {
        fnmember: true
      }
    })

    // Always return success to prevent email enumeration
    if (!authRecord) {
      return {
        success: true,
        message: "If the email exists in our system, a password reset code has been sent."
      }
    }

    // Generate cryptographically secure 6-digit code
    const resetCode = crypto.randomInt(100000, 999999).toString()
    // Hash the code before storing (so it's not stored in plaintext)
    const hashedCode = await bcrypt.hash(resetCode, 10)
    const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save hashed code to database
    await prisma.fnauth.update({
      where: { id: authRecord.id },
      data: {
        pin: hashedCode,
        pinExpiresAt: codeExpiresAt,
      },
    })

    // Send code via email
    console.log('[Password Reset] Sending reset code to user:', authRecord.email);
    const emailResult = await sendPasswordResetEmail(authRecord.email, resetCode);
    
    if (!emailResult.success) {
      console.error('[Password Reset] Failed to send password reset email:', emailResult.error);
      // Still return success to not reveal if user exists, but log the error
    } else {
      console.log('[Password Reset] Reset code email sent successfully to:', authRecord.email);
    }

    return {
      success: true,
      message: "If the email exists in our system, a password reset code has been sent."
    }
  } catch (error) {
    console.error("Forgot password error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed"
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred"
    }
  }
}

export async function resetPassword(token: string, password: string): Promise<ActionResult> {
  try {
    const validatedData = resetPasswordSchema.parse({ token, password })

    // Find user by reset token
    const authRecord = await prisma.fnauth.findUnique({
      where: { resetToken: validatedData.token },
    })

    if (!authRecord) {
      return {
        success: false,
        error: "Invalid or expired reset token"
      }
    }

    // Check if token is expired
    if (!authRecord.resetTokenExpiry || authRecord.resetTokenExpiry < new Date()) {
      return {
        success: false,
        error: "Reset token has expired. Please request a new one."
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Update password and clear reset token
    await prisma.fnauth.update({
      where: { id: authRecord.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0,
        lockedUntil: null,
      },
    })

    return {
      success: true,
      message: "Password has been reset successfully. You can now login with your new password."
    }
  } catch (error) {
    console.error("Reset password error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed"
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred"
    }
  }
}

export async function getMemberData(userId: string) {
  try {
    const member = await prisma.fnmember.findUnique({
      where: { id: userId },
      include: {
        auth: {
          select: {
            username: true,
            email: true,
            verified: true,
            lastLogin: true,
          }
        },
        profile: true,
        barcode: true,
        family: true,
      },
    })

    if (!member) {
      return {
        success: false,
        error: "Member not found"
      }
    }

    return {
      success: true,
      data: member
    }
  } catch (error) {
    console.error("Get member error:", error)

    return {
      success: false,
      error: "An unexpected error occurred"
    }
  }
}

export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    
    const memberCount = await prisma.fnmember.count()
    const authCount = await prisma.fnauth.count()
    
    return {
      success: true,
      message: "Database connection successful",
      data: {
        totalMembers: memberCount,
        activatedAccounts: authCount,
        databaseConnected: true,
      }
    }
  } catch (error) {
    console.error("Database test error:", error)
    
    return {
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }
  } finally {
    await prisma.$disconnect()
  }
}
