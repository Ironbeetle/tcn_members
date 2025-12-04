/**
 * Member Contacts API - Query member contact info for messaging
 * 
 * This endpoint allows the messaging app to query member contact information
 * (phone numbers and email addresses) for SMS and email campaigns.
 * 
 * Security: API key authentication required
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { z } from 'zod';

// Query parameters schema
const contactQuerySchema = z.object({
  search: z.string().optional(),           // Search by name or t_number
  community: z.string().optional(),         // Filter by community
  activated: z.enum(['true', 'false', 'all']).optional().default('all'),
  includeDeceased: z.enum(['true', 'false']).optional().default('false'),
  limit: z.number().min(1).max(500).optional().default(100),
  cursor: z.string().optional(),           // For pagination
  fields: z.enum(['phone', 'email', 'both']).optional().default('both'),
});

// Single member lookup schema
const memberLookupSchema = z.object({
  t_number: z.string().optional(),
  memberId: z.string().cuid().optional(),
  email: z.string().email().optional(),
}).refine(data => data.t_number || data.memberId || data.email, {
  message: 'At least one identifier (t_number, memberId, or email) must be provided',
});

export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'contacts:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const params = {
      search: searchParams.get('search') || undefined,
      community: searchParams.get('community') || undefined,
      activated: searchParams.get('activated') || 'all',
      includeDeceased: searchParams.get('includeDeceased') || 'false',
      limit: parseInt(searchParams.get('limit') || '100'),
      cursor: searchParams.get('cursor') || undefined,
      fields: searchParams.get('fields') || 'both',
    };

    const validation = contactQuerySchema.safeParse(params);
    if (!validation.success) {
      return apiError('Invalid query parameters', 400, validation.error.issues);
    }

    const { search, community, activated, includeDeceased, limit, cursor, fields } = validation.data;

    // Build where clause
    const where: any = {
      // Include deceased='no' or null as "not deceased", exclude only 'yes'/'deceased' values
      ...(includeDeceased === 'false' && { 
        OR: [
          { deceased: null },
          { deceased: 'no' },
          { deceased: '' },
        ]
      }),
      ...(activated !== 'all' && { 
        activated: activated === 'true' ? 'ACTIVATED' : { not: 'ACTIVATED' }
      }),
    };

    // Add search filter
    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { t_number: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add community filter
    if (community) {
      where.profile = {
        some: { community: { equals: community, mode: 'insensitive' } },
      };
    }

    // Query members with profiles
    const members = await prisma.fnmember.findMany({
      where: {
        ...where,
        ...(cursor && { id: { gt: cursor } }),
      },
      include: {
        profile: {
          select: {
            phone_number: fields === 'phone' || fields === 'both',
            email: fields === 'email' || fields === 'both',
            community: true,
            o_r_status: true,
          },
        },
      },
      orderBy: { id: 'asc' },
      take: limit + 1,
    });

    const hasMore = members.length > limit;
    if (hasMore) {
      members.pop();
    }

    // Format results for messaging - include members even without profiles
    const contacts = members.map(member => {
        const profile = member.profile[0] || null;
        return {
          memberId: member.id,
          t_number: member.t_number,
          name: `${member.first_name} ${member.last_name}`,
          firstName: member.first_name,
          lastName: member.last_name,
          ...(fields !== 'email' && profile?.phone_number && { phone: profile.phone_number }),
          ...(fields !== 'phone' && profile?.email && { email: profile.email }),
          community: profile?.community || null,
          status: profile?.o_r_status || null,
          activated: member.activated,
          birthdate: member.birthdate.toISOString().split('T')[0],
          hasProfile: !!profile,
        };
      });

    const nextCursor = hasMore && members.length > 0 
      ? members[members.length - 1].id 
      : undefined;

    logApiAccess(request, 'contacts:GET', true, { 
      count: contacts.length,
      search,
      community,
    });

    return apiSuccess({
      contacts,
      count: contacts.length,
      pagination: {
        hasMore,
        nextCursor,
        limit,
      },
      query: {
        search: search || 'none',
        community: community || 'all',
        activated,
        includeDeceased,
        fields,
      },
    });

  } catch (error: any) {
    console.error('Contacts GET error:', error);
    logApiAccess(request, 'contacts:GET', false, { error: error.message });
    return apiError('Failed to fetch contacts', 500);
  }
}

// POST - Lookup specific member(s)
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'contacts:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    // Handle batch lookup
    if (Array.isArray(body)) {
      return handleBatchLookup(request, body);
    }

    // Single member lookup
    const validation = memberLookupSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Invalid lookup parameters', 400, validation.error.issues);
    }

    const { t_number, memberId, email } = validation.data;

    const member = await prisma.fnmember.findFirst({
      where: {
        OR: [
          ...(t_number ? [{ t_number }] : []),
          ...(memberId ? [{ id: memberId }] : []),
          ...(email ? [{ profile: { some: { email } } }] : []),
        ],
      },
      include: {
        profile: {
          select: {
            phone_number: true,
            email: true,
            community: true,
            o_r_status: true,
          },
        },
      },
    });

    if (!member || member.profile.length === 0) {
      return apiError('Member not found or has no profile', 404);
    }

    const profile = member.profile[0];
    const contact = {
      memberId: member.id,
      t_number: member.t_number,
      name: `${member.first_name} ${member.last_name}`,
      firstName: member.first_name,
      lastName: member.last_name,
      phone: profile.phone_number,
      email: profile.email,
      community: profile.community,
      status: profile.o_r_status,
      activated: member.activated,
      deceased: member.deceased,
      birthdate: member.birthdate.toISOString().split('T')[0],
    };

    logApiAccess(request, 'contacts:POST', true, { t_number: member.t_number });
    return apiSuccess(contact);

  } catch (error: any) {
    console.error('Contacts POST error:', error);
    logApiAccess(request, 'contacts:POST', false, { error: error.message });
    return apiError('Failed to lookup member', 500);
  }
}

// Handle batch member lookup
async function handleBatchLookup(request: NextRequest, identifiers: any[]) {
  if (identifiers.length > 100) {
    return apiError('Batch lookup limited to 100 members', 400);
  }

  const results: any[] = [];
  const notFound: any[] = [];

  for (const identifier of identifiers) {
    const validation = memberLookupSchema.safeParse(identifier);
    if (!validation.success) {
      notFound.push({ identifier, error: 'Invalid identifier format' });
      continue;
    }

    const { t_number, memberId, email } = validation.data;

    try {
      const member = await prisma.fnmember.findFirst({
        where: {
          OR: [
            ...(t_number ? [{ t_number }] : []),
            ...(memberId ? [{ id: memberId }] : []),
            ...(email ? [{ profile: { some: { email } } }] : []),
          ],
        },
        include: {
          profile: {
            select: {
              phone_number: true,
              email: true,
              community: true,
              o_r_status: true,
            },
          },
        },
      });

      if (!member || member.profile.length === 0) {
        notFound.push({ identifier, error: 'Member not found' });
        continue;
      }

      const profile = member.profile[0];
      results.push({
        memberId: member.id,
        t_number: member.t_number,
        name: `${member.first_name} ${member.last_name}`,
        phone: profile.phone_number,
        email: profile.email,
        community: profile.community,
        activated: member.activated,
      });
    } catch (err) {
      notFound.push({ identifier, error: 'Lookup failed' });
    }
  }

  logApiAccess(request, 'contacts:BATCH', true, { 
    found: results.length,
    notFound: notFound.length,
  });

  return apiSuccess({
    found: results,
    notFound,
    total: identifiers.length,
  });
}
