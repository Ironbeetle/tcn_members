/**
 * Staff Email Logs Stats API - Get staff email statistics
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
    logApiAccess(request, 'comm:staff-email-logs:stats:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const [sent, failed, total] = await Promise.all([
      prisma.comm_StaffEmailLog.count({ where: { status: 'sent' } }),
      prisma.comm_StaffEmailLog.count({ where: { status: 'failed' } }),
      prisma.comm_StaffEmailLog.count(),
    ]);

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await prisma.comm_StaffEmailLog.count({
      where: {
        created: { gte: startOfMonth }
      }
    });

    logApiAccess(request, 'comm:staff-email-logs:stats:GET', true);

    return apiSuccess({
      sent,
      failed,
      total,
      thisMonth,
    });

  } catch (error: any) {
    console.error('Staff email stats error:', error);
    logApiAccess(request, 'comm:staff-email-logs:stats:GET', false, { error: error.message });
    return apiError('Failed to fetch staff email stats', 500);
  }
}
