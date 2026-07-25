/**
 * User Password Change API - Change user password
 * 
 * Endpoint for the TCN Communications desktop app to change user passwords.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateAuth,
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await validateAuth(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:users:password:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = passwordSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { currentPassword, newPassword } = validation.data;
    const isSessionAuth = authResult.authType === 'session';
    const isSelfChange = isSessionAuth && authResult.user?.id === id;
    const isElevatedSession = isSessionAuth && (
      authResult.user?.role === 'STAFF_ADMIN' ||
      authResult.user?.role === 'DEPARTMENT_ADMIN' ||
      authResult.user?.role === 'FINANCE' ||
      authResult.user?.role === 'ADMIN' ||
      authResult.user?.role === 'COUNCIL'
    );

    if (isSessionAuth && !isSelfChange && !isElevatedSession) {
      return apiError('Forbidden', 403);
    }

    if (isSelfChange && !currentPassword) {
      return apiError('Current password is required', 400);
    }

    // Get user
    const user = await prisma.comm_User.findUnique({
      where: { id },
      select: { id: true, password: true, email: true }
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // Self-service password changes must verify the current password first.
    if (isSelfChange) {
      const isValid = await bcrypt.compare(currentPassword!, user.password);
      if (!isValid) {
        logApiAccess(request, 'comm:users:password:POST', false, { 
          error: 'Invalid current password', 
          userId: id 
        });
        return apiError('Current password is incorrect', 401);
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.comm_User.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordResetCompleted: new Date(),
      }
    });

    logApiAccess(request, 'comm:users:password:POST', true, { userId: id });

    return apiSuccess({ success: true }, 'Password changed successfully');

  } catch (error: any) {
    console.error('Password change error:', error);
    logApiAccess(request, 'comm:users:password:POST', false, { error: error.message });
    return apiError('Failed to change password', 500);
  }
}
