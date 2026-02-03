/**
 * Sign-Up Form Stats API - Get form statistics
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:stats:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const [totalForms, activeForms, totalSubmissions] = await Promise.all([
      prisma.comm_SignUpForm.count(),
      prisma.comm_SignUpForm.count({ where: { isActive: true } }),
      prisma.comm_FormSubmission.count(),
    ]);

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [formsThisMonth, submissionsThisMonth] = await Promise.all([
      prisma.comm_SignUpForm.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      prisma.comm_FormSubmission.count({
        where: { submittedAt: { gte: startOfMonth } }
      }),
    ]);

    logApiAccess(request, 'comm:signup-forms:stats:GET', true);

    return apiSuccess({
      totalForms,
      activeForms,
      totalSubmissions,
      formsThisMonth,
      submissionsThisMonth,
    });

  } catch (error: any) {
    console.error('Sign-up form stats error:', error);
    logApiAccess(request, 'comm:signup-forms:stats:GET', false, { error: error.message });
    return apiError('Failed to fetch sign-up form stats', 500);
  }
}
