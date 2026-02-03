/**
 * Auth Logout API - Invalidate session
 * 
 * Endpoint for the TCN Communications desktop app to logout users.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:auth:logout:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return apiError('Session token required', 400);
    }

    // Delete the session
    const deleted = await prisma.comm_Session.deleteMany({
      where: { sessionToken }
    });

    if (deleted.count === 0) {
      logApiAccess(request, 'comm:auth:logout:POST', false, { error: 'Session not found' });
      return apiError('Session not found', 404);
    }

    logApiAccess(request, 'comm:auth:logout:POST', true, { sessionToken });

    return apiSuccess({ message: 'Logged out successfully' });

  } catch (error: any) {
    console.error('Logout error:', error);
    logApiAccess(request, 'comm:auth:logout:POST', false, { error: error.message });
    return apiError('Logout failed', 500);
  }
}
