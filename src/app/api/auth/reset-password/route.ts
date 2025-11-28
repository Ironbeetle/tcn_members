import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Find user by email
    const authRecord = await prisma.fnauth.findUnique({
      where: { email: validatedData.email },
    });

    if (!authRecord || !authRecord.pin || !authRecord.pinExpiresAt) {
      return NextResponse.json(
        { error: "Invalid reset request" },
        { status: 400 }
      );
    }

    // Check if PIN has expired
    if (authRecord.pinExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "PIN has expired. Please request a new password reset." },
        { status: 400 }
      );
    }

    // Verify PIN
    if (authRecord.pin !== validatedData.pin) {
      return NextResponse.json(
        { error: "Invalid PIN" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password and clear PIN
    await prisma.fnauth.update({
      where: { id: authRecord.id },
      data: {
        password: hashedPassword,
        pin: null,
        pinExpiresAt: null,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    console.log('[Password Reset API] Password successfully reset for:', validatedData.email);

    return NextResponse.json(
      { 
        success: true, 
        message: "Password has been reset successfully. You can now login with your new password." 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

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
