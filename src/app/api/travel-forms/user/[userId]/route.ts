/**
 * User Travel Forms API - Get travel forms for a specific user
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
    logApiAccess(request, 'travel-forms:user:GET', false, { error: authResult.error });
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

    const [forms, total] = await Promise.all([
      prisma.comm_TravelForm.findMany({
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
        orderBy: { created: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.comm_TravelForm.count({ where }),
    ]);

    logApiAccess(request, 'travel-forms:user:GET', true, { userId, count: forms.length });

    return apiSuccess({
      forms,
      count: forms.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + forms.length < total,
      },
    });

  } catch (error: any) {
    console.error('User travel forms list error:', error);
    logApiAccess(request, 'travel-forms:user:GET', false, { error: error.message });
    return apiError('Failed to fetch user travel forms', 500);
  }
}
