/**
 * Sign-Up Form Submissions API - Manage form submissions
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

const submissionSchema = z.object({
  memberId: z.string().nullable().optional(),
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  responses: z.record(z.string(), z.any()),
});

// GET - Get form submissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:submissions:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const [submissions, total] = await Promise.all([
      prisma.comm_FormSubmission.findMany({
        where: { formId: id },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.comm_FormSubmission.count({ where: { formId: id } }),
    ]);

    logApiAccess(request, 'comm:signup-forms:submissions:GET', true, { formId: id, count: submissions.length });

    return apiSuccess({
      submissions,
      count: submissions.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + submissions.length < total,
      },
    });

  } catch (error: any) {
    console.error('Form submissions list error:', error);
    logApiAccess(request, 'comm:signup-forms:submissions:GET', false, { error: error.message });
    return apiError('Failed to fetch form submissions', 500);
  }
}

// POST - Submit form response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:submissions:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = submissionSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { memberId, name, email, phone, responses } = validation.data;

    // Check if form exists and is active
    const form = await prisma.comm_SignUpForm.findUnique({
      where: { id },
      select: { 
        id: true, 
        isActive: true, 
        maxEntries: true,
        deadline: true,
        _count: { select: { submissions: true } }
      }
    });

    if (!form) {
      return apiError('Form not found', 404);
    }

    if (!form.isActive) {
      return apiError('Form is no longer accepting submissions', 400);
    }

    if (form.deadline && new Date(form.deadline) < new Date()) {
      return apiError('Form submission deadline has passed', 400);
    }

    if (form.maxEntries && form._count.submissions >= form.maxEntries) {
      return apiError('Form has reached maximum entries', 400);
    }

    // Create submission
    const submission = await prisma.comm_FormSubmission.create({
      data: {
        formId: id,
        memberId: memberId || null,
        name,
        email: email || null,
        phone: phone || null,
        responses: responses as any,
      }
    });

    logApiAccess(request, 'comm:signup-forms:submissions:POST', true, { formId: id, submissionId: submission.id });

    return apiSuccess(submission, 'Form submitted successfully');

  } catch (error: any) {
    console.error('Form submission create error:', error);
    logApiAccess(request, 'comm:signup-forms:submissions:POST', false, { error: error.message });
    return apiError('Failed to submit form', 500);
  }
}
