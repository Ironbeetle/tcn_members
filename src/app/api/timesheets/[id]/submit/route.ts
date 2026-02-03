/**
 * Timesheet Submit API - Submit timesheet for approval
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:submit:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check if timesheet exists and is a draft
    const existing = await prisma.comm_TimeSheet.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return apiError('Timesheet not found', 404);
    }

    if (existing.status !== 'DRAFT') {
      return apiError('Timesheet has already been submitted', 400);
    }

    const timesheet = await prisma.comm_TimeSheet.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedDate: new Date(),
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

    logApiAccess(request, 'timesheets:submit:POST', true, { timesheetId: id });

    return apiSuccess(timesheet, 'Timesheet submitted for approval');

  } catch (error: any) {
    console.error('Timesheet submit error:', error);
    logApiAccess(request, 'timesheets:submit:POST', false, { error: error.message });
    return apiError('Failed to submit timesheet', 500);
  }
}
