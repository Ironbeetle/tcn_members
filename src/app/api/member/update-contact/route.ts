import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateContactSchema = z.object({
  memberId: z.string(),
  email: z.string().email(),
  phone_number: z.string().min(10),
  address: z.string().min(5),
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
    const validatedData = updateContactSchema.parse(body);

    // Ensure user can only update their own data
    if (session.user.id !== validatedData.memberId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Find the profile associated with this member
    const profile = await prisma.profile.findFirst({
      where: { fnmemberId: validatedData.memberId }
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        email: validatedData.email,
        phone_number: validatedData.phone_number,
        address: validatedData.address,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', errors: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating contact info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
