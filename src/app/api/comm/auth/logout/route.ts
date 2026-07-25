/**
 * Auth Logout API - Invalidate session
 * 
 * Endpoint for the TCN Communications desktop app to logout users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateAuth,
  STAFF_SESSION_COOKIE,
  STAFF_CSRF_COOKIE,
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authResult = await validateAuth(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:auth:logout:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const bodySessionToken = typeof body?.sessionToken === 'string' ? body.sessionToken : undefined;
    const cookieSessionToken = request.cookies.get(STAFF_SESSION_COOKIE)?.value;

    const sessionToken = authResult.authType === 'session'
      ? cookieSessionToken
      : bodySessionToken;

    if (!sessionToken) {
      return apiError('Session token required', 400);
    }

    if (authResult.authType === 'session' && bodySessionToken && bodySessionToken !== cookieSessionToken) {
      return apiError('Session token mismatch', 403);
    }

    // Delete the session
    const deleted = await prisma.comm_Session.deleteMany({
      where: { sessionToken }
    });

    if (deleted.count === 0) {
      logApiAccess(request, 'comm:auth:logout:POST', false, { error: 'Session not found' });
      return apiError('Session not found', 404);
    }

    logApiAccess(request, 'comm:auth:logout:POST', true, { authType: authResult.authType });

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      data: { message: 'Logged out successfully' },
      timestamp: new Date().toISOString(),
    });

    response.cookies.set({
      name: STAFF_SESSION_COOKIE,
      value: '',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set({
      name: STAFF_CSRF_COOKIE,
      value: '',
      path: '/',
      maxAge: 0,
    });

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    logApiAccess(request, 'comm:auth:logout:POST', false, { error: error.message });
    return apiError('Logout failed', 500);
  }
}
