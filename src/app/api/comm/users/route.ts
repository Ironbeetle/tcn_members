/**
 * Users API - List staff users
 * 
 * Endpoint for the Tauri Communications desktop app to manage staff users.
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

// GET - List all staff users
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:users:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const role = searchParams.get('role');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where conditions
    const whereConditions: string[] = [];
    const params: any[] = [];

    if (department) {
      whereConditions.push(`department = $${params.length + 1}`);
      params.push(department);
    }

    if (role) {
      whereConditions.push(`role = $${params.length + 1}`);
      params.push(role);
    }

    if (!includeInactive) {
      whereConditions.push(`("lockedUntil" IS NULL OR "lockedUntil" < NOW())`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const users = await prisma.$queryRawUnsafe<any[]>(`
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
      ${whereClause}
      ORDER BY last_name, first_name
    `, ...params);

    logApiAccess(request, 'comm:users:GET', true, { count: users.length });

    return apiSuccess({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        department: u.department,
        role: u.role,
        created: u.created,
        lastLogin: u.lastLogin,
        isLocked: u.lockedUntil && new Date(u.lockedUntil) > new Date(),
        lockedUntil: u.lockedUntil,
        loginAttempts: u.loginAttempts,
      })),
      count: users.length,
    });

  } catch (error: any) {
    console.error('Users list error:', error);
    logApiAccess(request, 'comm:users:GET', false, { error: error.message });
    return apiError('Failed to fetch users', 500);
  }
}

// POST - Create new staff user
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { email, password, firstName, lastName, department, role } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return apiError('Missing required fields: email, password, firstName, lastName', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError('Invalid email format', 400);
    }

    // Check if email already exists
    const existing = await prisma.comm_User.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existing) {
      return apiError('User with this email already exists', 409);
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.comm_User.create({
      data: {
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        department: department || 'BAND_OFFICE',
        role: role || 'STAFF',
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        department: true,
        role: true,
        created: true,
      }
    });

    logApiAccess(request, 'comm:users:POST', true, { userId: newUser.id });

    return apiSuccess({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      department: newUser.department,
      role: newUser.role,
      created: newUser.created,
    }, 'User created successfully');

  } catch (error: any) {
    console.error('User creation error:', error);
    return apiError('Failed to create user', 500);
  }
}
