/**
 * Sync API - Members Endpoint
 * Handles member sync operations from master database
 * 
 * POST /api/sync/members - Create or update members
 * GET /api/sync/members - Get members for sync to master (delta sync)
 * DELETE /api/sync/members - Mark member as deleted/deceased
 */

import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  validateApiKey,
  checkRateLimit,
  getClientIp,
  apiSuccess,
  apiError,
  logApiAccess,
} from '@/lib/api-auth';
import {
  newMemberFromMasterSchema,
  memberUpdateSchema,
  markDeceasedSchema,
  deltaSyncRequestSchema,
} from '@/lib/sync-validation';
import { z } from 'zod';

const prisma = new PrismaClient();

// POST - Create or update member from master
export async function POST(request: NextRequest) {
  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'sync/members:POST', false, { error: authResult.error });
    return apiError(authResult.error!, 401);
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`sync:${clientIp}`, 100, 60000);
  if (!rateLimit.allowed) {
    logApiAccess(request, 'sync/members:POST', false, { error: 'Rate limit exceeded' });
    return apiError('Rate limit exceeded', 429);
  }

  try {
    const body = await request.json();
    
    // Check if it's an update or create
    const isUpdate = body.id && !body.birthdate;
    
    if (isUpdate) {
      // Validate as update
      const validated = memberUpdateSchema.parse(body);
      
      const member = await prisma.fnmember.update({
        where: { id: validated.id },
        data: {
          ...(validated.first_name && { first_name: validated.first_name }),
          ...(validated.last_name && { last_name: validated.last_name }),
          ...(validated.birthdate && { birthdate: new Date(validated.birthdate) }),
          ...(validated.t_number && { t_number: validated.t_number }),
          ...(validated.deceased !== undefined && { deceased: validated.deceased }),
          updated: new Date(),
        },
        include: {
          profile: true,
          barcode: true,
          family: true,
        },
      });

      logApiAccess(request, 'sync/members:POST:UPDATE', true, { memberId: member.id });
      return apiSuccess(member, 'Member updated successfully');
    } else {
      // Validate as new member
      const validated = newMemberFromMasterSchema.parse(body);
      
      // Check if member already exists by t_number
      const existing = await prisma.fnmember.findUnique({
        where: { t_number: validated.t_number },
      });

      if (existing) {
        // Update existing member
        const member = await prisma.fnmember.update({
          where: { id: existing.id },
          data: {
            first_name: validated.first_name,
            last_name: validated.last_name,
            birthdate: new Date(validated.birthdate),
            deceased: validated.deceased,
            updated: new Date(),
          },
          include: {
            profile: true,
            barcode: true,
            family: true,
          },
        });

        logApiAccess(request, 'sync/members:POST:UPSERT', true, { memberId: member.id });
        return apiSuccess(member, 'Member updated (already existed)');
      }

      // Create new member with optional relations
      const member = await prisma.fnmember.create({
        data: {
          ...(validated.id && { id: validated.id }),
          birthdate: new Date(validated.birthdate),
          first_name: validated.first_name,
          last_name: validated.last_name,
          t_number: validated.t_number,
          deceased: validated.deceased,
          activated: 'NONE', // New members start as not activated on portal
          ...(validated.profile && {
            profile: {
              create: {
                gender: validated.profile.gender,
                o_r_status: validated.profile.o_r_status,
                community: validated.profile.community,
                address: validated.profile.address,
                phone_number: validated.profile.phone_number,
                email: validated.profile.email,
                image_url: validated.profile.image_url,
              },
            },
          }),
          ...(validated.barcode && {
            barcode: {
              create: {
                barcode: validated.barcode.barcode,
                activated: validated.barcode.activated ?? 1,
              },
            },
          }),
          ...(validated.family && {
            family: {
              create: {
                spouse_fname: validated.family.spouse_fname,
                spouse_lname: validated.family.spouse_lname,
                dependents: validated.family.dependents ?? 0,
              },
            },
          }),
        },
        include: {
          profile: true,
          barcode: true,
          family: true,
        },
      });

      logApiAccess(request, 'sync/members:POST:CREATE', true, { memberId: member.id });
      return apiSuccess(member, 'Member created successfully');
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logApiAccess(request, 'sync/members:POST', false, { error: 'Validation error', details: error.issues });
      return apiError('Validation error', 400, error.issues);
    }
    
    if (error.code === 'P2002') {
      logApiAccess(request, 'sync/members:POST', false, { error: 'Duplicate entry' });
      return apiError('A member with this t_number already exists', 409);
    }
    
    if (error.code === 'P2025') {
      logApiAccess(request, 'sync/members:POST', false, { error: 'Member not found' });
      return apiError('Member not found', 404);
    }

    console.error('Sync members error:', error);
    logApiAccess(request, 'sync/members:POST', false, { error: error.message });
    return apiError('Internal server error', 500);
  }
}

// GET - Delta sync - get members updated since timestamp
export async function GET(request: NextRequest) {
  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'sync/members:GET', false, { error: authResult.error });
    return apiError(authResult.error!, 401);
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`sync:${clientIp}`, 100, 60000);
  if (!rateLimit.allowed) {
    return apiError('Rate limit exceeded', 429);
  }

  try {
    const { searchParams } = new URL(request.url);
    
    const params = deltaSyncRequestSchema.parse({
      since: searchParams.get('since') || new Date(0).toISOString(),
      limit: parseInt(searchParams.get('limit') || '100', 10),
      cursor: searchParams.get('cursor') || undefined,
    });

    const sinceDate = new Date(params.since);

    const members = await prisma.fnmember.findMany({
      where: {
        updated: { gte: sinceDate },
        ...(params.cursor && { id: { gt: params.cursor } }),
      },
      orderBy: { id: 'asc' },
      take: params.limit,
      include: {
        profile: true,
        barcode: true,
        family: true,
        // Exclude auth - that's portal-only
      },
    });

    const nextCursor = members.length === params.limit 
      ? members[members.length - 1].id 
      : null;

    logApiAccess(request, 'sync/members:GET', true, { count: members.length });
    
    return apiSuccess({
      members,
      pagination: {
        count: members.length,
        nextCursor,
        hasMore: !!nextCursor,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError('Validation error', 400, error.issues);
    }
    
    console.error('Sync members GET error:', error);
    logApiAccess(request, 'sync/members:GET', false, { error: error.message });
    return apiError('Internal server error', 500);
  }
}

// DELETE - Mark member as deceased
export async function DELETE(request: NextRequest) {
  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'sync/members:DELETE', false, { error: authResult.error });
    return apiError(authResult.error!, 401);
  }

  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`sync:${clientIp}`, 50, 60000);
  if (!rateLimit.allowed) {
    return apiError('Rate limit exceeded', 429);
  }

  try {
    const body = await request.json();
    const validated = markDeceasedSchema.parse(body);

    let member;

    if (validated.memberId) {
      member = await prisma.fnmember.update({
        where: { id: validated.memberId },
        data: {
          deceased: validated.deceasedDate,
          updated: new Date(),
        },
      });
    } else if (validated.t_number) {
      member = await prisma.fnmember.update({
        where: { t_number: validated.t_number },
        data: {
          deceased: validated.deceasedDate,
          updated: new Date(),
        },
      });
    }

    logApiAccess(request, 'sync/members:DELETE', true, { 
      memberId: member?.id,
      deceasedDate: validated.deceasedDate 
    });
    
    return apiSuccess(member, 'Member marked as deceased');
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError('Validation error', 400, error.issues);
    }
    
    if (error.code === 'P2025') {
      logApiAccess(request, 'sync/members:DELETE', false, { error: 'Member not found' });
      return apiError('Member not found', 404);
    }

    console.error('Sync members DELETE error:', error);
    logApiAccess(request, 'sync/members:DELETE', false, { error: error.message });
    return apiError('Internal server error', 500);
  }
}
