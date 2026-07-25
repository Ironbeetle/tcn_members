/**
 * Contacts API - Query member contacts for messaging
 * 
 * Endpoint for the Tauri Communications desktop app to search and list
 * member contact information for SMS and email campaigns.
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

// GET - Search/list member contacts
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:contacts:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const community = searchParams.get('community');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // 'active', 'inactive', or 'all'

    // Build where clause
    const whereConditions: string[] = [];
    const params: any[] = [];

    // Exclude deceased members by default
    whereConditions.push(`(m.deceased IS NULL OR m.deceased = 'no' OR m.deceased = '')`);

    // Search filter (name or t_number)
    if (query) {
      whereConditions.push(`(
        m.first_name ILIKE $${params.length + 1} OR 
        m.last_name ILIKE $${params.length + 1} OR 
        m.t_number ILIKE $${params.length + 1} OR
        CONCAT(m.first_name, ' ', m.last_name) ILIKE $${params.length + 1}
      )`);
      params.push(`%${query}%`);
    }

    // Status filter
    if (status === 'active') {
      whereConditions.push(`m.activated = 'ACTIVATED'`);
    } else if (status === 'inactive') {
      whereConditions.push(`m.activated != 'ACTIVATED'`);
    }

    // Community filter
    if (community) {
      whereConditions.push(`p.community ILIKE $${params.length + 1}`);
      params.push(`%${community}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Query members with their profile info
    const contacts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT DISTINCT
        m.id,
        m.t_number,
        m.first_name,
        m.last_name,
        m.activated as status,
        p.email,
        p.phone_number as phone,
        p.community,
        p.address
      FROM fnmemberlist.fnmember m
      LEFT JOIN fnmemberlist."Profile" p ON p."fnmemberId" = m.id
      ${whereClause}
      ORDER BY m.last_name, m.first_name
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `, ...params, limit, offset);

    // Get total count for pagination
    const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(DISTINCT m.id) as count
      FROM fnmemberlist.fnmember m
      LEFT JOIN fnmemberlist."Profile" p ON p."fnmemberId" = m.id
      ${whereClause}
    `, ...params);

    const totalCount = Number(countResult[0]?.count || 0);

    logApiAccess(request, 'comm:contacts:GET', true, { 
      query, 
      community,
      returned: contacts.length,
      total: totalCount,
    });

    return apiSuccess({
      contacts: contacts.map(c => ({
        id: c.id,
        t_number: c.t_number,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        community: c.community,
        status: c.status === 'ACTIVATED' ? 'active' : 'inactive',
      })),
      count: contacts.length,
      total: totalCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + contacts.length < totalCount,
      },
    });

  } catch (error: any) {
    console.error('Contacts query error:', error);
    logApiAccess(request, 'comm:contacts:GET', false, { error: error.message });
    return apiError('Failed to fetch contacts', 500);
  }
}

// POST - Get specific contacts by IDs or T-numbers
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { ids, tNumbers } = body;

    if ((!ids || !Array.isArray(ids) || ids.length === 0) && 
        (!tNumbers || !Array.isArray(tNumbers) || tNumbers.length === 0)) {
      return apiError('Must provide ids or tNumbers array', 400);
    }

    let contacts: any[] = [];

    if (ids && ids.length > 0) {
      contacts = await prisma.$queryRaw<any[]>`
        SELECT DISTINCT
          m.id,
          m.t_number,
          m.first_name,
          m.last_name,
          m.activated as status,
          p.email,
          p.phone_number as phone,
          p.community
        FROM fnmemberlist.fnmember m
        LEFT JOIN fnmemberlist."Profile" p ON p."fnmemberId" = m.id
        WHERE m.id = ANY(${ids})
      `;
    } else if (tNumbers && tNumbers.length > 0) {
      contacts = await prisma.$queryRaw<any[]>`
        SELECT DISTINCT
          m.id,
          m.t_number,
          m.first_name,
          m.last_name,
          m.activated as status,
          p.email,
          p.phone_number as phone,
          p.community
        FROM fnmemberlist.fnmember m
        LEFT JOIN fnmemberlist."Profile" p ON p."fnmemberId" = m.id
        WHERE m.t_number = ANY(${tNumbers})
      `;
    }

    return apiSuccess({
      contacts: contacts.map(c => ({
        id: c.id,
        t_number: c.t_number,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        community: c.community,
        status: c.status === 'ACTIVATED' ? 'active' : 'inactive',
      })),
      count: contacts.length,
    });

  } catch (error: any) {
    console.error('Contacts lookup error:', error);
    return apiError('Failed to fetch contacts', 500);
  }
}
