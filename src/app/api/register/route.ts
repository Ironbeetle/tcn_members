import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for registration
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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if treaty number exists in fnmember table
    const member = await prisma.fnmember.findUnique({
      where: { t_number: validatedData.t_number },
      include: { auth: true }
    });

    if (!member) {
      return NextResponse.json(
        { error: "Treaty number not found in our records. Please contact the band office." },
        { status: 404 }
      );
    }

    // Check if member already has credentials
    if (member.auth) {
      return NextResponse.json(
        { error: "This treaty number already has an active account. Please use the login page." },
        { status: 409 }
      );
    }

    // Check if username or email already exists
    const existingAuth = await prisma.fnauth.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email }
        ]
      }
    });

    if (existingAuth) {
      if (existingAuth.username === validatedData.username) {
        return NextResponse.json(
          { error: "Username already taken. Please choose another." },
          { status: 409 }
        );
      }
      if (existingAuth.email === validatedData.email) {
        return NextResponse.json(
          { error: "Email already registered. Please use a different email." },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create auth record
    const authRecord = await prisma.fnauth.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        fnmemberId: member.id,
        verified: false, // Can be set to true after email verification
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
    });

    // Update member activation status
    await prisma.fnmember.update({
      where: { id: member.id },
      data: { activated: "PENDING" }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully! You can now login.",
        user: {
          id: authRecord.fnmember.id,
          firstName: authRecord.fnmember.first_name,
          lastName: authRecord.fnmember.last_name,
          username: authRecord.username,
          email: authRecord.email,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
