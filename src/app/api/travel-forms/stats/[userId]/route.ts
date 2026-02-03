/**
 * Travel Form Stats API - Get travel form statistics for a user
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
    logApiAccess(request, 'travel-forms:stats:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { userId } = await params;

    const [
      totalForms,
      draftForms,
      submittedForms,
      approvedForms,
      rejectedForms,
    ] = await Promise.all([
      prisma.comm_TravelForm.count({ where: { userId } }),
      prisma.comm_TravelForm.count({ where: { userId, status: 'DRAFT' } }),
      prisma.comm_TravelForm.count({ where: { userId, status: 'SUBMITTED' } }),
      prisma.comm_TravelForm.count({ where: { userId, status: 'APPROVED' } }),
      prisma.comm_TravelForm.count({ where: { userId, status: 'REJECTED' } }),
    ]);

    // Get total approved amount
    const approvedAmount = await prisma.comm_TravelForm.aggregate({
      where: { 
        userId,
        status: { in: ['APPROVED', 'ISSUED', 'COMPLETED'] }
      },
      _sum: {
        grandTotal: true,
      }
    });

    // Get this year's stats
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const thisYearApproved = await prisma.comm_TravelForm.aggregate({
      where: { 
        userId,
        status: { in: ['APPROVED', 'ISSUED', 'COMPLETED'] },
        approvedDate: { gte: startOfYear }
      },
      _sum: {
        grandTotal: true,
      },
      _count: true,
    });

    logApiAccess(request, 'travel-forms:stats:GET', true, { userId });

    return apiSuccess({
      totalForms,
      draftForms,
      submittedForms,
      approvedForms,
      rejectedForms,
      totalApprovedAmount: approvedAmount._sum.grandTotal || 0,
      thisYear: {
        approvedForms: thisYearApproved._count,
        approvedAmount: thisYearApproved._sum.grandTotal || 0,
      }
    });

  } catch (error: any) {
    console.error('Travel form stats error:', error);
    logApiAccess(request, 'travel-forms:stats:GET', false, { error: error.message });
    return apiError('Failed to fetch travel form stats', 500);
  }
}
