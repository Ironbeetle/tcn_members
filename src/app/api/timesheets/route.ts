/**
 * Timesheets API - Manage staff timesheets
 * 
 * Endpoint for the TCN Communications desktop app to manage timesheets.
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

const timesheetSchema = z.object({
  userId: z.string(),
  payPeriodStart: z.string().datetime(),
  payPeriodEnd: z.string().datetime(),
  dailyHours: z.record(z.string(), z.any()).default({}),
  regularHours: z.number().default(0),
  overtimeHours: z.number().default(0),
  sickHours: z.number().default(0),
  vacationHours: z.number().default(0),
  statHolidayHours: z.number().default(0),
  totalHours: z.number().default(0),
  notes: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).default('DRAFT'),
});

// GET - Get all timesheets (admin) or filter by user
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    const [timesheets, total] = await Promise.all([
      prisma.comm_TimeSheet.findMany({
        where,
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
        },
        orderBy: { payPeriodStart: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.comm_TimeSheet.count({ where }),
    ]);

    logApiAccess(request, 'timesheets:GET', true, { count: timesheets.length });

    return apiSuccess({
      timesheets,
      count: timesheets.length,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + timesheets.length < total,
      },
    });

  } catch (error: any) {
    console.error('Timesheets list error:', error);
    logApiAccess(request, 'timesheets:GET', false, { error: error.message });
    return apiError('Failed to fetch timesheets', 500);
  }
}

// POST - Create or upsert timesheet
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'timesheets:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = timesheetSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const data = validation.data;

    // Upsert based on userId + payPeriodStart
    const timesheet = await prisma.comm_TimeSheet.upsert({
      where: {
        userId_payPeriodStart: {
          userId: data.userId,
          payPeriodStart: new Date(data.payPeriodStart)
        }
      },
      update: {
        dailyHours: data.dailyHours as any,
        regularHours: data.regularHours,
        overtimeHours: data.overtimeHours,
        sickHours: data.sickHours,
        vacationHours: data.vacationHours,
        statHolidayHours: data.statHolidayHours,
        totalHours: data.totalHours,
        notes: data.notes || null,
        status: data.status,
      },
      create: {
        userId: data.userId,
        payPeriodStart: new Date(data.payPeriodStart),
        payPeriodEnd: new Date(data.payPeriodEnd),
        dailyHours: data.dailyHours as any,
        regularHours: data.regularHours,
        overtimeHours: data.overtimeHours,
        sickHours: data.sickHours,
        vacationHours: data.vacationHours,
        statHolidayHours: data.statHolidayHours,
        totalHours: data.totalHours,
        notes: data.notes || null,
        status: data.status,
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

    logApiAccess(request, 'timesheets:POST', true, { timesheetId: timesheet.id });

    return apiSuccess(timesheet, 'Timesheet saved');

  } catch (error: any) {
    console.error('Timesheet create error:', error);
    logApiAccess(request, 'timesheets:POST', false, { error: error.message });
    return apiError('Failed to save timesheet', 500);
  }
}
