/**
 * Timesheet Approve API - Approve submitted timesheet
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

const approveSchema = z.object({
  approverId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:approve:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = approveSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { approverId } = validation.data;

    // Check if timesheet exists and is submitted
    const existing = await prisma.comm_TimeSheet.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return apiError('Timesheet not found', 404);
    }

    if (existing.status !== 'SUBMITTED') {
      return apiError('Only submitted timesheets can be approved', 400);
    }

    const timesheet = await prisma.comm_TimeSheet.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedDate: new Date(),
        approvedBy: approverId,
        rejectedDate: null,
        rejectedBy: null,
        rejectionReason: null,
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

    logApiAccess(request, 'timesheets:approve:POST', true, { timesheetId: id, approverId });

    return apiSuccess(timesheet, 'Timesheet approved');

  } catch (error: any) {
    console.error('Timesheet approve error:', error);
    logApiAccess(request, 'timesheets:approve:POST', false, { error: error.message });
    return apiError('Failed to approve timesheet', 500);
  }
}
