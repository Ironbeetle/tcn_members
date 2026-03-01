import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateAddressSchema = z.object({
  memberId: z.string(),
  address: z.string().min(5, 'Address is required'),
  community: z.string().min(1, 'Community is required'),
  province: z.enum(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']),
  o_r_status: z.enum(['ON_RESERVE', 'OFF_RESERVE']),
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
    const validatedData = updateAddressSchema.parse(body);

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

    // Update the profile address information
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        address: validatedData.address,
        community: validatedData.community,
        province: validatedData.province,
        o_r_status: validatedData.o_r_status,
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

    console.error('Error updating address:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
