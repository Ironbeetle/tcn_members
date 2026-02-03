/**
 * Timesheet by ID API - Get, Delete individual timesheets
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

// GET - Get single timesheet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:id:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    const timesheet = await prisma.comm_TimeSheet.findUnique({
      where: { id },
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

    if (!timesheet) {
      return apiError('Timesheet not found', 404);
    }

    logApiAccess(request, 'timesheets:id:GET', true, { timesheetId: id });

    return apiSuccess(timesheet);

  } catch (error: any) {
    console.error('Timesheet get error:', error);
    logApiAccess(request, 'timesheets:id:GET', false, { error: error.message });
    return apiError('Failed to fetch timesheet', 500);
  }
}

// DELETE - Delete draft timesheet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:id:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check if timesheet exists and is a draft
    const timesheet = await prisma.comm_TimeSheet.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!timesheet) {
      return apiError('Timesheet not found', 404);
    }

    if (timesheet.status !== 'DRAFT') {
      return apiError('Only draft timesheets can be deleted', 400);
    }

    await prisma.comm_TimeSheet.delete({
      where: { id }
    });

    logApiAccess(request, 'timesheets:id:DELETE', true, { timesheetId: id });

    return apiSuccess({ deleted: true }, 'Timesheet deleted');

  } catch (error: any) {
    console.error('Timesheet delete error:', error);
    logApiAccess(request, 'timesheets:id:DELETE', false, { error: error.message });
    return apiError('Failed to delete timesheet', 500);
  }
}
