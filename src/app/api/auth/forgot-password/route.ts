import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Find user by email
    const authRecord = await prisma.fnauth.findUnique({
      where: { email: validatedData.email },
      include: {
        fnmember: true
      }
    });

    // Always return success to prevent email enumeration
    if (!authRecord) {
      return NextResponse.json(
        { 
          success: true, 
          message: "If the email exists in our system, a password reset link has been sent." 
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.fnauth.update({
      where: { id: authRecord.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Send email with reset link
    // For now, we'll return the token in development (remove in production)
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    console.log(`Password reset link for ${authRecord.email}: ${resetLink}`);

    return NextResponse.json(
      { 
        success: true, 
        message: "If the email exists in our system, a password reset link has been sent.",
        // Remove this in production:
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
