import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Ensure user can only access their own data
    if (session.user.id !== id) {
      console.log('Session user ID:', session.user.id, 'Requested ID:', id);
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const member = await prisma.fnmember.findUnique({
      where: { id },
      include: {
        profile: true,
        barcode: {
          where: { activated: 2 } // Only get assigned barcodes
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        firstName: member.first_name,
        lastName: member.last_name,
        tNumber: member.t_number,
        birthdate: member.birthdate,
        profile: member.profile[0] || null,
        barcode: member.barcode[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching member data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
