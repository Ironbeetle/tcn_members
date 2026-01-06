/**
 * User by ID API - Get, update, delete specific user
 * 
 * Endpoint for the Tauri Communications desktop app to manage individual staff users.
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get specific user
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    const users = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        department,
        role,
        created,
        "lastLogin",
        "loginAttempts",
        "lockedUntil"
      FROM msgmanager."User"
      WHERE id = ${id}
    `;

    if (users.length === 0) {
      return apiError('User not found', 404);
    }

    const user = users[0];

    return apiSuccess({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      department: user.department,
      role: user.role,
      created: user.created,
      lastLogin: user.lastLogin,
      isLocked: user.lockedUntil && new Date(user.lockedUntil) > new Date(),
      lockedUntil: user.lockedUntil,
      loginAttempts: user.loginAttempts,
    });

  } catch (error: any) {
    console.error('User fetch error:', error);
    return apiError('Failed to fetch user', 500);
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, department, role, unlockAccount, password } = body;

    // Check user exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM msgmanager."User" WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return apiError('User not found', 404);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (firstName !== undefined) {
      updates.push(`first_name = $${values.length + 1}`);
      values.push(firstName);
    }

    if (lastName !== undefined) {
      updates.push(`last_name = $${values.length + 1}`);
      values.push(lastName);
    }

    if (department !== undefined) {
      updates.push(`department = $${values.length + 1}`);
      values.push(department);
    }

    if (role !== undefined) {
      updates.push(`role = $${values.length + 1}`);
      values.push(role);
    }

    if (unlockAccount === true) {
      updates.push(`"lockedUntil" = NULL`);
      updates.push(`"loginAttempts" = 0`);
    }

    if (password) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);
      updates.push(`password = $${values.length + 1}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return apiError('No fields to update', 400);
    }

    updates.push('updated = NOW()');
    values.push(id);

    const result = await prisma.$queryRawUnsafe<any[]>(`
      UPDATE msgmanager."User"
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, email, first_name, last_name, department, role, "lockedUntil", "loginAttempts"
    `, ...values);

    const updatedUser = result[0];

    logApiAccess(request, 'comm:users:PATCH', true, { userId: id });

    return apiSuccess({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      department: updatedUser.department,
      role: updatedUser.role,
      isLocked: updatedUser.lockedUntil && new Date(updatedUser.lockedUntil) > new Date(),
    }, 'User updated successfully');

  } catch (error: any) {
    console.error('User update error:', error);
    return apiError('Failed to update user', 500);
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check user exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id, email FROM msgmanager."User" WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return apiError('User not found', 404);
    }

    // Delete user (cascades to sessions, logs, etc.)
    await prisma.$executeRaw`
      DELETE FROM msgmanager."User" WHERE id = ${id}
    `;

    logApiAccess(request, 'comm:users:DELETE', true, { userId: id, email: existing[0].email });

    return apiSuccess({ id }, 'User deleted successfully');

  } catch (error: any) {
    console.error('User delete error:', error);
    return apiError('Failed to delete user', 500);
  }
}
