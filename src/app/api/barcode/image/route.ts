import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const barcodeNumber = searchParams.get('barcode');

    if (!barcodeNumber) {
      return NextResponse.json(
        { success: false, error: 'Barcode number required' },
        { status: 400 }
      );
    }

    // Verify this barcode belongs to the authenticated user
    const barcode = await prisma.barcode.findFirst({
      where: {
        barcode: barcodeNumber,
        fnmemberId: session.user.id,
        activated: 2 // Only assigned barcodes
      }
    });

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'Barcode not found or not authorized' },
        { status: 404 }
      );
    }

    // Read the JPG file from barcodes/jpg directory (not in public folder)
    const barcodePath = join(process.cwd(), 'barcodes', 'jpg', `${barcodeNumber}.jpg`);
    
    try {
      const fileBuffer = await readFile(barcodePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (fileError) {
      console.error('Error reading barcode JPG:', fileError);
      return NextResponse.json(
        { success: false, error: 'Barcode image not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching barcode image:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
