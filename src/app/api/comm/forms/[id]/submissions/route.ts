/**
 * Form Submissions API - Get and manage form submissions
 * 
 * Endpoint for the Tauri Communications desktop app to view and manage
 * submissions for a specific form.
 * Uses API key authentication only (no user auth).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get all submissions for a form
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:forms:submissions:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check form exists
    const forms = await prisma.$queryRaw<any[]>`
      SELECT id, title FROM msgmanager."SignUpForm" WHERE id = ${id}
    `;

    if (forms.length === 0) {
      return apiError('Form not found', 404);
    }

    // Get submissions
    const submissions = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        "memberId",
        name,
        email,
        phone,
        responses,
        "submittedAt"
      FROM msgmanager."FormSubmission"
      WHERE "formId" = ${id}
      ORDER BY "submittedAt" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM msgmanager."FormSubmission" WHERE "formId" = ${id}
    `;

    const totalCount = Number(countResult[0]?.count || 0);

    logApiAccess(request, 'comm:forms:submissions:GET', true, { 
      formId: id, 
      returned: submissions.length,
      total: totalCount,
    });

    return apiSuccess({
      formId: id,
      formTitle: forms[0].title,
      submissions: submissions.map(s => ({
        id: s.id,
        memberId: s.memberId,
        name: s.name,
        email: s.email,
        phone: s.phone,
        responses: s.responses,
        submittedAt: s.submittedAt,
      })),
      count: submissions.length,
      total: totalCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + submissions.length < totalCount,
      },
    });

  } catch (error: any) {
    console.error('Submissions fetch error:', error);
    logApiAccess(request, 'comm:forms:submissions:GET', false, { error: error.message });
    return apiError('Failed to fetch submissions', 500);
  }
}

// DELETE - Delete a specific submission
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id: formId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return apiError('submissionId query parameter is required', 400);
    }

    // Check submission exists and belongs to this form
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM msgmanager."FormSubmission" 
      WHERE id = ${submissionId} AND "formId" = ${formId}
    `;

    if (existing.length === 0) {
      return apiError('Submission not found', 404);
    }

    // Delete submission
    await prisma.$executeRaw`
      DELETE FROM msgmanager."FormSubmission" WHERE id = ${submissionId}
    `;

    logApiAccess(request, 'comm:forms:submissions:DELETE', true, { 
      formId, 
      submissionId,
    });

    return apiSuccess({ 
      formId,
      submissionId,
    }, 'Submission deleted successfully');

  } catch (error: any) {
    console.error('Submission delete error:', error);
    return apiError('Failed to delete submission', 500);
  }
}
