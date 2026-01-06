/**
 * Auth Verify API - Validate user credentials for desktop app login
 * 
 * Endpoint for the Tauri Communications desktop app to authenticate users.
 * Uses API key authentication + user credentials.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import bcrypt from 'bcryptjs';

// POST - Verify user credentials
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:auth:verify:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return apiError('Email and password required', 400);
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
