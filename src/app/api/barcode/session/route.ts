import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Scan Session Management API for Expo React Native Demo App
 * 
 * POST /api/barcode/session - Create a new scan session
 * GET /api/barcode/session?id=xxx - Get session details with all scans
 */

// Create a new scan session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, operatorId, deviceId, location, metadata } = body;

    const session = await prisma.scanSession.create({
      data: {
        name: name || 'Scan Session',
        operatorId: operatorId || null,
        deviceId: deviceId || null,
        location: location || null,
        metadata: metadata || null,
        status: 'OPEN',
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        name: session.name,
        status: session.status,
        createdAt: session.createdAt,
        operatorId: session.operatorId,
        deviceId: session.deviceId,
        location: session.location,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get session details with all scans
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      // Return list of recent sessions
      const sessions = await prisma.scanSession.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          _count: {
            select: { reads: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: sessions.map(s => ({
          id: s.id,
          name: s.name,
          status: s.status,
          createdAt: s.createdAt,
          closedAt: s.closedAt,
          operatorId: s.operatorId,
          deviceId: s.deviceId,
          location: s.location,
          totalScans: s._count.reads,
        }))
      });
    }

    // Get specific session with all reads
    const session = await prisma.scanSession.findUnique({
      where: { id: sessionId },
      include: {
        reads: {
          orderBy: { readAt: 'desc' },
          include: {
            lookup: true,
            display: true,
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        name: session.name,
        status: session.status,
        createdAt: session.createdAt,
        closedAt: session.closedAt,
        operatorId: session.operatorId,
        deviceId: session.deviceId,
        location: session.location,
        metadata: session.metadata,
        reads: session.reads.map(r => ({
          id: r.id,
          readAt: r.readAt,
          rawValue: r.rawValue,
          normalizedValue: r.normalizedValue,
          symbology: r.symbology,
          outcome: r.outcome,
          lookup: r.lookup ? {
            status: r.lookup.status,
            memberId: r.lookup.memberId,
            barcodeValue: r.lookup.barcodeValue,
            result: r.lookup.result,
            durationMs: r.lookup.durationMs,
          } : null,
          display: r.display ? {
            shown: r.display.shown,
            displayedAt: r.display.displayedAt,
          } : null,
        })),
        totalScans: session.reads.length,
      }
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Close a scan session
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['OPEN', 'CLOSED', 'ABORTED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be OPEN, CLOSED, or ABORTED' },
        { status: 400 }
      );
    }

    const session = await prisma.scanSession.update({
      where: { id: sessionId },
      data: {
        status: status || 'CLOSED',
        closedAt: status === 'OPEN' ? null : new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        name: session.name,
        status: session.status,
        closedAt: session.closedAt,
      }
    });

  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
