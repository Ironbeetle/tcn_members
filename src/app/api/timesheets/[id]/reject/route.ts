/**
 * Timesheet Reject API - Reject submitted timesheet
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { z } from 'zod';

const rejectSchema = z.object({
  rejecterId: z.string(),
  reason: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:reject:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = rejectSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { rejecterId, reason } = validation.data;

    // Check if timesheet exists and is submitted
    const existing = await prisma.comm_TimeSheet.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return apiError('Timesheet not found', 404);
    }

    if (existing.status !== 'SUBMITTED') {
      return apiError('Only submitted timesheets can be rejected', 400);
    }

    const timesheet = await prisma.comm_TimeSheet.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedDate: new Date(),
        rejectedBy: rejecterId,
        rejectionReason: reason,
        approvedDate: null,
        approvedBy: null,
      },
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
      }
    });

    logApiAccess(request, 'timesheets:reject:POST', true, { timesheetId: id, rejecterId });

    return apiSuccess(timesheet, 'Timesheet rejected');

  } catch (error: any) {
    console.error('Timesheet reject error:', error);
    logApiAccess(request, 'timesheets:reject:POST', false, { error: error.message });
    return apiError('Failed to reject timesheet', 500);
  }
}
