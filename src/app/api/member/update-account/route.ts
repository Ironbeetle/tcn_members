import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateAccountSchema = z.object({
  memberId: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateAccountSchema.parse(body);

    // Ensure user can only update their own data
    if (session.user.id !== validatedData.memberId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Find the auth record for this member
    const fnauth = await prisma.fnauth.findUnique({
      where: { fnmemberId: validatedData.memberId }
    });

    if (!fnauth) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if username is already taken by another user
    if (validatedData.username !== fnauth.username) {
      const existingUsername = await prisma.fnauth.findUnique({
        where: { username: validatedData.username }
      });
      if (existingUsername) {
        return NextResponse.json(
          { success: false, error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Check if email is already taken by another user
    if (validatedData.email !== fnauth.email) {
      const existingEmail = await prisma.fnauth.findUnique({
        where: { email: validatedData.email }
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }

    // Update the auth record
    const updatedAuth = await prisma.fnauth.update({
      where: { id: fnauth.id },
      data: {
        username: validatedData.username,
        email: validatedData.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        updated: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedAuth
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', errors: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating account:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
