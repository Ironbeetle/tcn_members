/**
 * Travel Form Submit API - Submit travel form for approval
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
    logApiAccess(request, 'travel-forms:submit:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check if form exists and is a draft
    const existing = await prisma.comm_TravelForm.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!existing) {
      return apiError('Travel form not found', 404);
    }

    if (existing.status !== 'DRAFT') {
      return apiError('Travel form has already been submitted', 400);
    }

    const form = await prisma.comm_TravelForm.update({
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

    logApiAccess(request, 'travel-forms:submit:POST', true, { formId: id });

    return apiSuccess(form, 'Travel form submitted for approval');

  } catch (error: any) {
    console.error('Travel form submit error:', error);
    logApiAccess(request, 'travel-forms:submit:POST', false, { error: error.message });
    return apiError('Failed to submit travel form', 500);
  }
}
