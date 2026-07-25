import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Schema for email lookup
const emailLookupSchema = z.object({
  email: z.string().email("Invalid email format"),
})

// Schema for credential recovery
const recoverySchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

// GET - Check if email exists in Profile table (for members who lost credentials)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const result = emailLookupSchema.safeParse({ email })
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Find profile with this email
    const profile = await prisma.profile.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        fnmember: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            t_number: true,
            activated: true,
            auth: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (!profile || !profile.fnmember) {
      return NextResponse.json(
        { 
          found: false,
          error: "No activated account found with this email. If you haven't activated your account yet, please use the 'Activate Account' tab." 
        },
        { status: 404 }
      )
    }

    // Check if member already has auth credentials
    if (profile.fnmember.auth) {
      return NextResponse.json(
        { 
          found: false,
          error: "This account already has login credentials. If you forgot your password, please use the 'Forgot Password' link." 
        },
        { status: 400 }
      )
    }

    // Member found without auth - eligible for credential recovery
    return NextResponse.json({
      found: true,
      member: {
        firstName: profile.fnmember.first_name,
        lastName: profile.fnmember.last_name,
        tNumber: profile.fnmember.t_number,
        email: profile.email,
      }
    })

  } catch (error) {
    console.error("Email lookup error:", error)
    return NextResponse.json(
      { error: "Failed to lookup email" },
      { status: 500 }
    )
  }
}

// POST - Create new credentials for member who lost them
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = recoverySchema.safeParse(body)
    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message).join(", ")
      return NextResponse.json(
        { error: errorMessages },
        { status: 400 }
      )
    }

    const { email, username, password } = result.data

    // Find profile with this email
    const profile = await prisma.profile.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        fnmember: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            t_number: true,
            activated: true,
            auth: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (!profile || !profile.fnmember) {
      return NextResponse.json(
        { error: "No activated account found with this email." },
        { status: 404 }
      )
    }

    // Double-check member doesn't already have auth
    if (profile.fnmember.auth) {
      return NextResponse.json(
        { error: "This account already has login credentials." },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.fnauth.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken. Please choose another." },
        { status: 400 }
      )
    }

    // Check if email already exists in auth table
    const existingEmail = await prisma.fnauth.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: "This email is already associated with another account." },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create auth record
    const authRecord = await prisma.fnauth.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        fnmemberId: profile.fnmember.id,
        verified: true, // They already verified their account before
      }
    })

    // Ensure member stays activated
    await prisma.fnmember.update({
      where: { id: profile.fnmember.id },
      data: { activated: "ACTIVATED" }
    })

    return NextResponse.json({
      success: true,
      message: "Credentials recovered successfully! You can now login.",
      data: {
        username: authRecord.username,
        email: authRecord.email,
      }
    })

  } catch (error) {
    console.error("Credential recovery error:", error)
    return NextResponse.json(
      { error: "Failed to recover credentials" },
      { status: 500 }
    )
  }
}
