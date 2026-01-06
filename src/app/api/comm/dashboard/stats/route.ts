/**
 * Dashboard Stats API - Get statistics for the communications dashboard
 * 
 * Endpoint for the Tauri Communications desktop app to display overview
 * statistics and charts.
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

// GET - Get dashboard statistics
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:dashboard:stats:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user counts by role
    const usersByRole = await prisma.$queryRaw<Array<{ role: string; count: bigint }>>`
      SELECT role, COUNT(*) as count
      FROM msgmanager."User"
      GROUP BY role
    `;

    // Get user counts by department
    const usersByDepartment = await prisma.$queryRaw<Array<{ department: string; count: bigint }>>`
      SELECT department, COUNT(*) as count
      FROM msgmanager."User"
      GROUP BY department
    `;

    // Get total users
    const totalUsers = usersByRole.reduce((sum, r) => sum + Number(r.count), 0);

    // Get email stats
    const emailStats = await prisma.$queryRaw<[{ total: bigint; last30: bigint }]>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created >= ${thirtyDaysAgo}) as last30
      FROM msgmanager."EmailLog"
    `;

    // Get SMS stats
    const smsStats = await prisma.$queryRaw<[{ total: bigint; last30: bigint }]>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created >= ${thirtyDaysAgo}) as last30
      FROM msgmanager."SmsLog"
    `;

    // Get bulletin stats
    const bulletinStats = await prisma.$queryRaw<[{ total: bigint; last30: bigint }]>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created >= ${thirtyDaysAgo}) as last30
      FROM msgmanager."BulletinApiLog"
    `;

    // Get form stats
    const formStats = await prisma.$queryRaw<[{ total: bigint; active: bigint }]>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "isActive" = true) as active
      FROM msgmanager."SignUpForm"
    `;

    // Get submission stats
    const submissionStats = await prisma.$queryRaw<[{ total: bigint; last30: bigint }]>`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "submittedAt" >= ${thirtyDaysAgo}) as last30
      FROM msgmanager."FormSubmission"
    `;

    // Get recent logins (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentLogins = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM msgmanager."LoginLog"
      WHERE "loginTime" >= ${sevenDaysAgo} AND success = true
    `;

    // Get email activity for chart (last 30 days, grouped by day)
    const emailChart = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT 
        DATE(created) as date,
        COUNT(*) as count
      FROM msgmanager."EmailLog"
      WHERE created >= ${thirtyDaysAgo}
      GROUP BY DATE(created)
      ORDER BY date
    `;

    // Get SMS activity for chart (last 30 days, grouped by day)
    const smsChart = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT 
        DATE(created) as date,
        COUNT(*) as count
      FROM msgmanager."SmsLog"
      WHERE created >= ${thirtyDaysAgo}
      GROUP BY DATE(created)
      ORDER BY date
    `;

    // Get recent activity (last 10 items)
    const recentActivity = await prisma.$queryRaw<any[]>`
      SELECT * FROM (
        SELECT 'email' as type, id, created, subject as title, status
        FROM msgmanager."EmailLog"
        ORDER BY created DESC LIMIT 5
      ) emails
      UNION ALL
      SELECT * FROM (
        SELECT 'sms' as type, id, created, LEFT(message, 50) as title, status
        FROM msgmanager."SmsLog"
        ORDER BY created DESC LIMIT 5
      ) sms
      ORDER BY created DESC
      LIMIT 10
    `;

    logApiAccess(request, 'comm:dashboard:stats:GET', true);

    return apiSuccess({
      overview: {
        totalUsers,
        totalEmails: Number(emailStats[0]?.total || 0),
        emailsLast30Days: Number(emailStats[0]?.last30 || 0),
        totalSms: Number(smsStats[0]?.total || 0),
        smsLast30Days: Number(smsStats[0]?.last30 || 0),
        totalBulletins: Number(bulletinStats[0]?.total || 0),
        bulletinsLast30Days: Number(bulletinStats[0]?.last30 || 0),
        totalForms: Number(formStats[0]?.total || 0),
        activeForms: Number(formStats[0]?.active || 0),
        totalSubmissions: Number(submissionStats[0]?.total || 0),
        submissionsLast30Days: Number(submissionStats[0]?.last30 || 0),
        recentLogins: Number(recentLogins[0]?.count || 0),
      },
      usersByRole: usersByRole.map(r => ({
        role: r.role,
        count: Number(r.count),
      })),
      usersByDepartment: usersByDepartment.map(d => ({
        department: d.department,
        count: Number(d.count),
      })),
      charts: {
        emails: emailChart.map(e => ({
          date: e.date.toISOString().split('T')[0],
          count: Number(e.count),
        })),
        sms: smsChart.map(s => ({
          date: s.date.toISOString().split('T')[0],
          count: Number(s.count),
        })),
      },
      recentActivity: recentActivity.map(a => ({
        type: a.type,
        id: a.id,
        created: a.created,
        title: a.title,
        status: a.status,
      })),
    });

  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    logApiAccess(request, 'comm:dashboard:stats:GET', false, { error: error.message });
    return apiError('Failed to fetch dashboard stats', 500);
  }
}
