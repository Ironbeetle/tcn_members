/**
 * Travel Form Approve API - Approve submitted travel form
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
    logApiAccess(request, 'travel-forms:approve:POST', false, { error: authResult.error });
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

    // Check if form exists and is submitted or under review
    const existing = await prisma.comm_TravelForm.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return apiError('Travel form not found', 404);
    }

    if (existing.status !== 'SUBMITTED' && existing.status !== 'UNDER_REVIEW') {
      return apiError('Only submitted travel forms can be approved', 400);
    }

    const form = await prisma.comm_TravelForm.update({
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

    logApiAccess(request, 'travel-forms:approve:POST', true, { formId: id, approverId });

    return apiSuccess(form, 'Travel form approved');

  } catch (error: any) {
    console.error('Travel form approve error:', error);
    logApiAccess(request, 'travel-forms:approve:POST', false, { error: error.message });
    return apiError('Failed to approve travel form', 500);
  }
}
