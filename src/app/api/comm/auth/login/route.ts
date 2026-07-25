/**
 * Auth Login API - User login with session creation
 * 
 * Endpoint for the TCN Communications desktop app to authenticate users.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  checkRateLimit,
  getClientIp,
  STAFF_SESSION_COOKIE,
  STAFF_CSRF_COOKIE,
  STAFF_SESSION_TTL_SECONDS,
  generateCsrfToken,
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  // Check if this is an external request (has API key header)
  const apiKey = request.headers.get('x-api-key');
  const isExternal = !!apiKey;

  // External requests (desktop app) must have valid API key
  if (isExternal) {
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      logApiAccess(request, 'comm:auth:login:POST', false, { error: authResult.error });
      return apiError(authResult.error || 'Unauthorized', 401);
    }
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('Invalid login payload', 400);
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const ip = getClientIp(request);
    const ipRate = checkRateLimit(`comm:login:ip:${ip}`, 60, 15 * 60 * 1000);
    if (!ipRate.allowed) {
      logApiAccess(request, 'comm:auth:login:POST', false, { error: 'Rate limit exceeded', ip });
      return apiError('Too many login attempts. Try again later.', 429);
    }

    const identityRate = checkRateLimit(`comm:login:identity:${email}:${ip}`, 12, 15 * 60 * 1000);
    if (!identityRate.allowed) {
      logApiAccess(request, 'comm:auth:login:POST', false, { error: 'Identity rate limit exceeded', email, ip });
      return apiError('Too many login attempts. Try again later.', 429);
    }

    // Find user
    const user = await prisma.comm_User.findUnique({
      where: { email }
    });

    if (!user) {
      logApiAccess(request, 'comm:auth:login:POST', false, { error: 'User not found', email });
      return apiError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      logApiAccess(request, 'comm:auth:login:POST', false, { error: 'Account locked', email });
      return apiError(`Account locked. Try again in ${remainingTime} minutes.`, 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      const newAttempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts: newAttempts };
      
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }
      
      await prisma.comm_User.update({
        where: { id: user.id },
        data: updateData
      });

      // Log failed attempt
      await prisma.comm_LoginLog.create({
        data: {
          userId: user.id,
          department: user.department,
          success: false,
          failReason: 'Invalid password',
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
          userAgent: request.headers.get('user-agent') || null,
        }
      });

      logApiAccess(request, 'comm:auth:login:POST', false, { 
        error: 'Invalid password', 
        email, 
        attempts: newAttempts 
      });

      return apiError('Invalid email or password', 401);
    }

    // Success - reset attempts, update last login
    await prisma.comm_User.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    });

    // Create session (expires in 24 hours)
    const sessionToken = crypto.randomUUID();
    const session = await prisma.comm_Session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    // Log successful login
    await prisma.comm_LoginLog.create({
      data: {
        userId: user.id,
        department: user.department,
        success: true,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        userAgent: request.headers.get('user-agent') || null,
      }
    });

    logApiAccess(request, 'comm:auth:login:POST', true, { userId: user.id });

    const csrfToken = generateCsrfToken();
    const response = NextResponse.json({
      success: true,
      message: 'Operation successful',
      timestamp: new Date().toISOString(),
      data: {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department,
        role: user.role
      },
      sessionToken: session.sessionToken
      }
    });

    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set({
      name: STAFF_SESSION_COOKIE,
      value: session.sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: STAFF_SESSION_TTL_SECONDS,
    });

    response.cookies.set({
      name: STAFF_CSRF_COOKIE,
      value: csrfToken,
      httpOnly: false,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: STAFF_SESSION_TTL_SECONDS,
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    logApiAccess(request, 'comm:auth:login:POST', false, { error: error.message });
    return apiError('Login failed', 500);
  }
}
