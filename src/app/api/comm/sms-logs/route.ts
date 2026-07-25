/**
 * SMS Logs API - Log SMS send attempts
 * 
 * Endpoint for the TCN Communications desktop app to log SMS messages.
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

const smsLogSchema = z.object({
  message: z.string().min(1),
  recipients: z.array(z.string()).min(1),
  status: z.string(),
  messageIds: z.array(z.string()).default([]),
  error: z.string().nullable().optional(),
  userId: z.string(),
});

// POST - Create SMS log
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:sms-logs:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = smsLogSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { message, recipients, status, messageIds, error, userId } = validation.data;

    const log = await prisma.comm_SmsLog.create({
      data: {
        message,
        recipients,
        status,
        messageIds,
        error: error || null,
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

    logApiAccess(request, 'comm:sms-logs:POST', true, { logId: log.id });

    return apiSuccess(log, 'SMS log created');

  } catch (error: any) {
    console.error('SMS log create error:', error);
    logApiAccess(request, 'comm:sms-logs:POST', false, { error: error.message });
    return apiError('Failed to create SMS log', 500);
  }
}

// GET - List SMS logs
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:sms-logs:GET', false, { error: authResult.error });
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
      prisma.comm_SmsLog.findMany({
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
      prisma.comm_SmsLog.count({ where }),
    ]);

    logApiAccess(request, 'comm:sms-logs:GET', true, { count: logs.length });

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
    console.error('SMS logs list error:', error);
    logApiAccess(request, 'comm:sms-logs:GET', false, { error: error.message });
    return apiError('Failed to fetch SMS logs', 500);
  }
}
