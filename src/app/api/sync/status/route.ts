/**
 * Sync API - Health & Status Endpoint
 * For monitoring sync API health and getting sync status
 * 
 * GET /api/sync/status - Get sync status and stats
 */

import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  validateApiKey,
  apiSuccess,
  apiError,
  logApiAccess,
} from '@/lib/api-auth';

const prisma = new PrismaClient();

// GET - Get sync status and database stats
export async function GET(request: NextRequest) {
  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'sync/status:GET', false, { error: authResult.error });
    return apiError(authResult.error!, 401);
  }

  try {
    // Get counts and latest updates
    const [
      totalMembers,
      activatedMembers,
      pendingMembers,
      deceasedMembers,
      totalProfiles,
      totalBarcodes,
      totalFamilies,
      latestMemberUpdate,
      latestProfileUpdate,
    ] = await Promise.all([
      prisma.fnmember.count(),
      prisma.fnmember.count({ where: { activated: 'ACTIVATED' } }),
      prisma.fnmember.count({ where: { activated: 'PENDING' } }),
      prisma.fnmember.count({ where: { deceased: { not: null } } }),
      prisma.profile.count(),
      prisma.barcode.count(),
      prisma.family.count(),
      prisma.fnmember.findFirst({ orderBy: { updated: 'desc' }, select: { updated: true } }),
      prisma.profile.findFirst({ orderBy: { updated: 'desc' }, select: { updated: true } }),
    ]);

    const status = {
      healthy: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        schema: 'fnmemberlist',
      },
      stats: {
        members: {
          total: totalMembers,
          activated: activatedMembers,
          pending: pendingMembers,
          notActivated: totalMembers - activatedMembers - pendingMembers,
          deceased: deceasedMembers,
        },
        profiles: totalProfiles,
        barcodes: totalBarcodes,
        families: totalFamilies,
      },
      lastUpdated: {
        member: latestMemberUpdate?.updated || null,
        profile: latestProfileUpdate?.updated || null,
      },
      api: {
        version: '1.0.0',
        endpoints: [
          'POST /api/sync/members - Create/update member',
          'GET /api/sync/members - Delta sync (get updated members)',
          'DELETE /api/sync/members - Mark member deceased',
          'POST /api/sync/batch - Batch sync operations',
          'GET /api/sync/status - This endpoint',
        ],
      },
    };

    logApiAccess(request, 'sync/status:GET', true);
    return apiSuccess(status, 'Sync API is healthy');

  } catch (error: any) {
    console.error('Sync status error:', error);
    logApiAccess(request, 'sync/status:GET', false, { error: error.message });
    
    return apiSuccess({
      healthy: false,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message,
      },
    }, 'Sync API has issues');
  }
}
