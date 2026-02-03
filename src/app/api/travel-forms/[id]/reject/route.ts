/**
 * Travel Form Reject API - Reject submitted travel form
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
    logApiAccess(request, 'travel-forms:reject:POST', false, { error: authResult.error });
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

    // Check if form exists and is submitted or under review
    const existing = await prisma.comm_TravelForm.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return apiError('Travel form not found', 404);
    }

    if (existing.status !== 'SUBMITTED' && existing.status !== 'UNDER_REVIEW') {
      return apiError('Only submitted travel forms can be rejected', 400);
    }

    const form = await prisma.comm_TravelForm.update({
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

    logApiAccess(request, 'travel-forms:reject:POST', true, { formId: id, rejecterId });

    return apiSuccess(form, 'Travel form rejected');

  } catch (error: any) {
    console.error('Travel form reject error:', error);
    logApiAccess(request, 'travel-forms:reject:POST', false, { error: error.message });
    return apiError('Failed to reject travel form', 500);
  }
}
