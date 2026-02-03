/**
 * Sign-Up Form Submission Delete API
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

// DELETE - Delete submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:submissions:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { submissionId } = await params;

    await prisma.comm_FormSubmission.delete({
      where: { id: submissionId }
    });

    logApiAccess(request, 'comm:signup-forms:submissions:DELETE', true, { submissionId });

    return apiSuccess({ deleted: true }, 'Submission deleted');

  } catch (error: any) {
    console.error('Form submission delete error:', error);
    logApiAccess(request, 'comm:signup-forms:submissions:DELETE', false, { error: error.message });
    return apiError('Failed to delete submission', 500);
  }
}
