/**
 * Bulletin Stats API - Get bulletin statistics
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:bulletin:stats:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const total = await prisma.comm_BulletinApiLog.count();

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await prisma.comm_BulletinApiLog.count({
      where: {
        created: { gte: startOfMonth }
      }
    });

    // Get by category
    const byCategory = await prisma.comm_BulletinApiLog.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    const categoryCounts = byCategory.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = item._count.id;
      return acc;
    }, {});

    logApiAccess(request, 'comm:bulletin:stats:GET', true);

    return apiSuccess({
      total,
      thisMonth,
      byCategory: categoryCounts,
    });

  } catch (error: any) {
    console.error('Bulletin stats error:', error);
    logApiAccess(request, 'comm:bulletin:stats:GET', false, { error: error.message });
    return apiError('Failed to fetch bulletin stats', 500);
  }
}
