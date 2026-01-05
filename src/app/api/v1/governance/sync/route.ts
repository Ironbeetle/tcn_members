/**
 * Governance Sync API - Receives council term and members from Central DB
 * 
 * POST /api/v1/governance/sync - Receive full council sync (term + all members)
 * 
 * This endpoint handles the "Sync to VPS" button from the Council Profile Editor
 * in the TCN Central Database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  validateApiKey,
  apiSuccess,
  apiError,
  logApiAccess,
} from '@/lib/api-auth';
import { z } from 'zod';

// Validation schemas matching VPS_GOVERNANCE_SYNC_REFERENCE.md
const positionSchema = z.enum(['CHIEF', 'COUNCILLOR']);

const portfolioSchema = z.enum([
  'TREATY',
  'HEALTH',
  'EDUCATION',
  'HOUSING',
  'ECONOMIC_DEVELOPMENT',
  'ENVIRONMENT',
  'PUBLIC_SAFETY',
  'LEADERSHIP',
]);

const councilSchema = z.object({
  source_id: z.string().min(1),
  council_start: z.string().datetime(),
  council_end: z.string().datetime(),
});

const councilMemberSchema = z.object({
  source_id: z.string().min(1),
  position: positionSchema,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  portfolios: z.array(portfolioSchema).max(4),
  email: z.string().email(),
  phone: z.string().min(1),
  bio: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

const governanceSyncRequestSchema = z.object({
  council: councilSchema,
  members: z.array(councilMemberSchema).min(1),
});

export async function POST(request: NextRequest) {
  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'v1/governance/sync:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = governanceSyncRequestSchema.safeParse(body);
    if (!validation.success) {
      logApiAccess(request, 'v1/governance/sync:POST', false, { error: 'Validation error' });
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { council, members } = validation.data;

    const result = {
      council: { id: '', action: '' as 'created' | 'updated' },
      members: { created: 0, updated: 0, deleted: 0 },
      errors: [] as string[],
    };

    // 1. Upsert Council by sourceId
    const existingCouncil = await prisma.current_Council.findUnique({
      where: { sourceId: council.source_id },
    });

    let councilRecord;
    if (existingCouncil) {
      councilRecord = await prisma.current_Council.update({
        where: { id: existingCouncil.id },
        data: {
          council_start: new Date(council.council_start),
          council_end: new Date(council.council_end),
          updated: new Date(),
        },
      });
      result.council = { id: councilRecord.id, action: 'updated' };
    } else {
      councilRecord = await prisma.current_Council.create({
        data: {
          sourceId: council.source_id,
          council_start: new Date(council.council_start),
          council_end: new Date(council.council_end),
        },
      });
      result.council = { id: councilRecord.id, action: 'created' };
    }

    // 2. Upsert each Council Member by sourceId
    for (const member of members) {
      try {
        const existingMember = await prisma.council_Member.findUnique({
          where: { sourceId: member.source_id },
        });

        if (existingMember) {
          await prisma.council_Member.update({
            where: { id: existingMember.id },
            data: {
              position: member.position,
              first_name: member.first_name,
              last_name: member.last_name,
              portfolios: member.portfolios,
              email: member.email.toLowerCase(),
              phone: member.phone,
              bio: member.bio || null,
              image_url: member.image_url || null,
              councilId: councilRecord.id,
              updated: new Date(),
            },
          });
          result.members.updated++;
        } else {
          await prisma.council_Member.create({
            data: {
              sourceId: member.source_id,
              position: member.position,
              first_name: member.first_name,
              last_name: member.last_name,
              portfolios: member.portfolios,
              email: member.email.toLowerCase(),
              phone: member.phone,
              bio: member.bio || null,
              image_url: member.image_url || null,
              councilId: councilRecord.id,
            },
          });
          result.members.created++;
        }
      } catch (memberError: any) {
        result.errors.push(
          `Failed to sync ${member.first_name} ${member.last_name}: ${memberError.message}`
        );
      }
    }

    logApiAccess(request, 'v1/governance/sync:POST', true, {
      councilId: councilRecord.id,
      councilAction: result.council.action,
      membersCreated: result.members.created,
      membersUpdated: result.members.updated,
      errors: result.errors.length,
    });

    return apiSuccess(result, 'Governance sync completed successfully');

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError('Validation error', 400, error.issues);
    }

    console.error('Governance sync error:', error);
    logApiAccess(request, 'v1/governance/sync:POST', false, { error: error.message });
    return apiError('Internal server error', 500);
  }
}

// GET - Check sync status / health
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'v1/governance/sync:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const [councilCount, memberCount, latestCouncil] = await Promise.all([
      prisma.current_Council.count(),
      prisma.council_Member.count(),
      prisma.current_Council.findFirst({
        orderBy: { updated: 'desc' },
        include: {
          members: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              position: true,
            },
          },
        },
      }),
    ]);

    logApiAccess(request, 'v1/governance/sync:GET', true);

    return apiSuccess({
      status: 'healthy',
      stats: {
        councils: councilCount,
        members: memberCount,
      },
      latestCouncil: latestCouncil ? {
        id: latestCouncil.id,
        sourceId: latestCouncil.sourceId,
        council_start: latestCouncil.council_start,
        council_end: latestCouncil.council_end,
        memberCount: latestCouncil.members.length,
        updated: latestCouncil.updated,
      } : null,
    });

  } catch (error: any) {
    console.error('Governance status error:', error);
    return apiError('Failed to fetch governance status', 500);
  }
}
