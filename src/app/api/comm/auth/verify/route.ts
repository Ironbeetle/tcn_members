/**
 * Auth Verify API - Validate user credentials or session tokens
 * 
 * Supports two modes:
 * 1. Session token verification (internal web app) - validates sessionToken
 * 2. Credential verification (desktop app with API key) - validates email/password
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  checkRateLimit,
  getClientIp,
  STAFF_SESSION_COOKIE,
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const verifySchema = z.object({
  sessionToken: z.string().min(16).max(256).optional(),
  email: z.string().email().max(254).optional(),
  password: z.string().min(1).max(256).optional(),
});

// POST - Verify session token or user credentials
export async function POST(request: NextRequest) {
  try {
    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid verification payload', 400);
    }

    const sessionToken = parsed.data.sessionToken || request.cookies.get(STAFF_SESSION_COOKIE)?.value;

    // If sessionToken provided, verify session (internal web app flow)
    if (sessionToken) {
      const session = await prisma.comm_Session.findUnique({
        where: { sessionToken },
        include: { user: true }
      });

      if (!session) {
        return apiSuccess({ valid: false }, 'Session not found');
      }

      if (new Date(session.expires) < new Date()) {
        // Clean up expired session
        await prisma.comm_Session.delete({ where: { sessionToken } });
        return apiSuccess({ valid: false }, 'Session expired');
      }

      return apiSuccess({ 
        valid: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          first_name: session.user.first_name,
          last_name: session.user.last_name,
          department: session.user.department,
          role: session.user.role
        }
      });
    }

    // Otherwise verify email/password (desktop app flow)
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      logApiAccess(request, 'comm:auth:verify:POST', false, { error: authResult.error });
      return apiError(authResult.error || 'Unauthorized', 401);
    }

    const email = parsed.data.email?.trim().toLowerCase();
    const password = parsed.data.password;

    if (!email || !password) {
      return apiError('Email and password required', 400);
    }

    const ip = getClientIp(request);
    const ipRate = checkRateLimit(`comm:verify:ip:${ip}`, 60, 15 * 60 * 1000);
    if (!ipRate.allowed) {
      logApiAccess(request, 'comm:auth:verify:POST', false, { error: 'Rate limit exceeded', ip });
      return apiError('Too many verification attempts. Try again later.', 429);
    }

    const identityRate = checkRateLimit(`comm:verify:identity:${email}:${ip}`, 12, 15 * 60 * 1000);
    if (!identityRate.allowed) {
      logApiAccess(request, 'comm:auth:verify:POST', false, { error: 'Identity rate limit exceeded', email, ip });
      return apiError('Too many verification attempts. Try again later.', 429);
    }

    // Find user in msgmanager schema
    const users = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        email,
        password,
        first_name,
        last_name,
        department,
        role,
        "lockedUntil",
        "loginAttempts",
        "lastLogin"
      FROM msgmanager."User"
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      logApiAccess(request, 'comm:auth:verify:POST', false, { error: 'User not found', email });
      return apiError('Invalid credentials', 401);
    }

    const user = users[0];

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
      );
      logApiAccess(request, 'comm:auth:verify:POST', false, { error: 'Account locked', email });
      return apiError(`Account locked. Try again in ${minutesLeft} minutes.`, 403);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      // Increment failed attempts
      const newAttempts = (user.loginAttempts || 0) + 1;
      const shouldLock = newAttempts >= 5;

      await prisma.$executeRaw`
        UPDATE msgmanager."User"
        SET 
          "loginAttempts" = ${newAttempts},
          "lockedUntil" = ${shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null},
          updated = NOW()
        WHERE id = ${user.id}
      `;

      logApiAccess(request, 'comm:auth:verify:POST', false, { 
        error: 'Invalid password', 
        email, 
        attempts: newAttempts,
        locked: shouldLock,
      });

      return apiError('Invalid credentials', 401);
    }

    // Reset failed attempts on success and update last login
    await prisma.$executeRaw`
      UPDATE msgmanager."User"
      SET 
        "loginAttempts" = 0,
        "lockedUntil" = NULL,
        "lastLogin" = NOW(),
        updated = NOW()
      WHERE id = ${user.id}
    `;

    // Log successful login
    await prisma.$executeRaw`
      INSERT INTO msgmanager."LoginLog" (id, "userId", "loginTime", department, "ipAddress", "userAgent", success)
      VALUES (
        gen_random_uuid()::text,
        ${user.id},
        NOW(),
        ${user.department}::"msgmanager"."Department",
        ${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'},
        ${request.headers.get('user-agent') || 'unknown'},
        true
      )
    `;

    logApiAccess(request, 'comm:auth:verify:POST', true, { email, userId: user.id });

    // Return user (without password)
    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department,
        role: user.role,
      },
    }, 'Login successful');

  } catch (error: any) {
    console.error('Auth verify error:', error);
    logApiAccess(request, 'comm:auth:verify:POST', false, { error: error.message });
    return apiError('Authentication failed', 500);
  }
}
