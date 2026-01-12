import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Barcode Scanner API for Expo React Native Demo App
 * 
 * POST /api/barcode/scan
 * Body: { 
 *   barcode: string,           // The scanned barcode value
 *   sessionId?: string,        // Optional scan session ID
 *   symbology?: string,        // Barcode type (CODE128, QR, etc.)
 *   deviceId?: string,         // Scanner device identifier
 * }
 * 
 * Returns member information if barcode is valid and active
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { barcode, sessionId, symbology = 'CODE128', deviceId } = body;

    if (!barcode || typeof barcode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Barcode value is required' },
        { status: 400 }
      );
    }

    const normalizedBarcode = barcode.trim();

    // Create or get scan session
    let session = null;
    if (sessionId) {
      session = await prisma.scanSession.findUnique({
        where: { id: sessionId }
      });
    }

    // If no session provided or not found, create a new one
    if (!session) {
      session = await prisma.scanSession.create({
        data: {
          name: 'Quick Scan',
          deviceId: deviceId || null,
          status: 'OPEN',
        }
      });
    }

    // Create the scan read record
    const scanRead = await prisma.scanRead.create({
      data: {
        sessionId: session.id,
        rawValue: barcode,
        normalizedValue: normalizedBarcode,
        symbology: (symbology as 'CODE128' | 'QR' | 'EAN13' | 'UPC' | 'OTHER') || 'CODE128',
        outcome: 'ACCEPTED',
      }
    });

    // Look up the barcode in fnmemberlist.Barcode
    const barcodeRecord = await prisma.barcode.findUnique({
      where: { barcode: normalizedBarcode },
      include: {
        fnmember: {
          include: {
            profile: true,
          }
        }
      }
    });

    // Determine lookup status
    let lookupStatus: 'FOUND_ACTIVE' | 'FOUND_INACTIVE' | 'NOT_FOUND' | 'ERROR';
    let memberData = null;
    let profileData = null;

    if (!barcodeRecord) {
      lookupStatus = 'NOT_FOUND';
    } else if (barcodeRecord.activated !== 2) {
      lookupStatus = 'FOUND_INACTIVE';
    } else if (!barcodeRecord.fnmember) {
      lookupStatus = 'NOT_FOUND';
    } else {
      lookupStatus = 'FOUND_ACTIVE';
      const member = barcodeRecord.fnmember;
      const profile = member.profile?.[0] || null;

      memberData = {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        tNumber: member.t_number,
        activated: member.activated,
        email: profile?.email || null,
        phoneNumber: profile?.phone_number || null,
      };

      profileData = profile ? {
        community: profile.community,
      } : null;
    }

    const durationMs = Date.now() - startTime;

    // Create the lookup record
    const scanLookup = await prisma.scanLookup.create({
      data: {
        readId: scanRead.id,
        status: lookupStatus,
        memberId: memberData?.id || null,
        barcodeValue: normalizedBarcode,
        result: memberData ? { member: memberData, profile: profileData } : Prisma.JsonNull,
        durationMs,
      }
    });

    // Create the display record (what we're showing to the operator)
    const displayData = memberData ? {
      fullName: `${memberData.firstName} ${memberData.lastName}`,
      tNumber: memberData.tNumber,
      community: profileData?.community || 'N/A',
      status: memberData.activated,
    } : null;

    await prisma.scanDisplay.create({
      data: {
        readId: scanRead.id,
        shown: displayData ?? Prisma.JsonNull,
      }
    });

    // Return response based on lookup status
    if (lookupStatus === 'NOT_FOUND') {
      return NextResponse.json({
        success: false,
        error: 'Barcode not found or not linked to a member',
        scanId: scanRead.id,
        sessionId: session.id,
      }, { status: 404 });
    }

    if (lookupStatus === 'FOUND_INACTIVE') {
      return NextResponse.json({
        success: false,
        error: 'Barcode is not active',
        status: barcodeRecord?.activated === 1 ? 'unassigned' : 'deactivated',
        scanId: scanRead.id,
        sessionId: session.id,
      }, { status: 403 });
    }

    // Success - return member data
    return NextResponse.json({
      success: true,
      data: {
        member: memberData,
        scan: {
          id: scanRead.id,
          sessionId: session.id,
          scannedAt: scanRead.readAt,
          durationMs,
        }
      }
    });

  } catch (error) {
    console.error('Barcode scan error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/barcode/scan?barcode=123456789
 * Simple lookup without logging to scan session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const barcode = searchParams.get('barcode');

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: 'Barcode query parameter is required' },
        { status: 400 }
      );
    }

    const normalizedBarcode = barcode.trim();

    // Look up the barcode
    const barcodeRecord = await prisma.barcode.findUnique({
      where: { barcode: normalizedBarcode },
      include: {
        fnmember: {
          include: {
            profile: true,
          }
        }
      }
    });

    if (!barcodeRecord) {
      return NextResponse.json(
        { success: false, error: 'Barcode not found' },
        { status: 404 }
      );
    }

    if (barcodeRecord.activated !== 2) {
      return NextResponse.json({
        success: false,
        error: 'Barcode is not active',
        status: barcodeRecord.activated === 1 ? 'unassigned' : 'deactivated',
      }, { status: 403 });
    }

    if (!barcodeRecord.fnmember) {
      return NextResponse.json(
        { success: false, error: 'Barcode is not linked to a member' },
        { status: 404 }
      );
    }

    const member = barcodeRecord.fnmember;
    const profile = member.profile?.[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        member: {
          id: member.id,
          firstName: member.first_name,
          lastName: member.last_name,
          email: profile?.email || null,
          phoneNumber: profile?.phone_number || null,
        },
        scannedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
