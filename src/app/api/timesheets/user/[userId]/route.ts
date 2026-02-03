/**
 * User Timesheets API - Get timesheets for a specific user
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:user:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [timesheets, total] = await Promise.all([
      prisma.comm_TimeSheet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              department: true,
            }
          }
        },
        orderBy: { payPeriodStart: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.comm_TimeSheet.count({ where }),
    ]);

    logApiAccess(request, 'timesheets:user:GET', true, { userId, count: timesheets.length });

    return apiSuccess({
      timesheets,
      count: timesheets.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + timesheets.length < total,
      },
    });

  } catch (error: any) {
    console.error('User timesheets list error:', error);
    logApiAccess(request, 'timesheets:user:GET', false, { error: error.message });
    return apiError('Failed to fetch user timesheets', 500);
  }
}
