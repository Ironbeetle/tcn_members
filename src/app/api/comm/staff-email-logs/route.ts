/**
 * Staff Email Logs API - Log internal staff email send attempts
 * 
 * Endpoint for the TCN Communications desktop app to log staff emails.
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

const staffEmailLogSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  recipients: z.array(z.string()).min(1),
  status: z.string(),
  messageId: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    size: z.number(),
  })).nullable().optional(),
  userId: z.string(),
});

// POST - Create staff email log
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:staff-email-logs:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = staffEmailLogSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { subject, message, recipients, status, messageId, error, attachments, userId } = validation.data;

    const log = await prisma.comm_StaffEmailLog.create({
      data: {
        subject,
        message,
        recipients,
        status,
        messageId: messageId || null,
        error: error || null,
        attachments: attachments || undefined,
        userId,
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          }
        }
      }
    });

    logApiAccess(request, 'comm:staff-email-logs:POST', true, { logId: log.id });

    return apiSuccess(log, 'Staff email log created');

  } catch (error: any) {
    console.error('Staff email log create error:', error);
    logApiAccess(request, 'comm:staff-email-logs:POST', false, { error: error.message });
    return apiError('Failed to create staff email log', 500);
  }
}

// GET - List staff email logs
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:staff-email-logs:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const [logs, total] = await Promise.all([
      prisma.comm_StaffEmailLog.findMany({
        where,
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            }
          }
        },
        orderBy: { created: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.comm_StaffEmailLog.count({ where }),
    ]);

    logApiAccess(request, 'comm:staff-email-logs:GET', true, { count: logs.length });

    return apiSuccess({
      logs,
      count: logs.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + logs.length < total,
      },
    });

  } catch (error: any) {
    console.error('Staff email logs list error:', error);
    logApiAccess(request, 'comm:staff-email-logs:GET', false, { error: error.message });
    return apiError('Failed to fetch staff email logs', 500);
  }
}
