/**
 * Council Sync API - Master App pushes Chief & Council profiles TO portal
 * 
 * This endpoint allows the master database app to send council member profiles
 * to be displayed on the member portal.
 * 
 * Sync Direction: Master Database App → Portal
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { 
  councilMemberSyncSchema, 
  councilMemberUpdateSchema,
  councilMemberDeleteSchema,
  councilBatchSyncSchema,
} from '@/lib/council-validation';
import { z } from 'zod';

// POST - Create or update council member
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'council:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    // Check if it's a batch sync request
    if (body.items && Array.isArray(body.items)) {
      return handleBatchSync(request, body);
    }

    // Single council member sync
    const validation = councilMemberSyncSchema.safeParse(body);
    if (!validation.success) {
      logApiAccess(request, 'council:POST', false, { error: 'Validation error' });
      return apiError('Validation error', 400, validation.error.issues);
    }

    const data = validation.data;

    // Upsert - create or update based on sourceId
    const member = await prisma.chief_Council.upsert({
      where: { sourceId: data.sourceId },
      update: {
        position: data.position,
        first_name: data.first_name,
        last_name: data.last_name,
        portfolio: data.portfolio,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        image_url: data.image_url,
        updated: new Date(),
      },
      create: {
        sourceId: data.sourceId,
        position: data.position,
        first_name: data.first_name,
        last_name: data.last_name,
        portfolio: data.portfolio,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        image_url: data.image_url,
        created: data.created ? new Date(data.created) : new Date(),
      },
    });

    logApiAccess(request, 'council:POST', true, { memberId: member.id, sourceId: data.sourceId });
    return apiSuccess(member, 'Council member synced successfully');

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError('Validation error', 400, error.issues);
    }

    console.error('Council sync error:', error);
    logApiAccess(request, 'council:POST', false, { error: error.message });
    return apiError('Failed to sync council member', 500);
  }
}

// Handle batch sync operations
async function handleBatchSync(request: NextRequest, body: any) {
  const validation = councilBatchSyncSchema.safeParse(body);
  if (!validation.success) {
    return apiError('Invalid batch sync request', 400, validation.error.issues);
  }

  const { items, syncId } = validation.data;
  let processed = 0;
  let failed = 0;
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      switch (item.operation) {
        case 'CREATE':
        case 'UPSERT': {
          const data = councilMemberSyncSchema.parse(item.data);
          await prisma.chief_Council.upsert({
            where: { sourceId: data.sourceId },
            update: {
              position: data.position,
              first_name: data.first_name,
              last_name: data.last_name,
              portfolio: data.portfolio,
              email: data.email,
              phone: data.phone,
              bio: data.bio,
              image_url: data.image_url,
              updated: new Date(),
            },
            create: {
              sourceId: data.sourceId,
              position: data.position,
              first_name: data.first_name,
              last_name: data.last_name,
              portfolio: data.portfolio,
              email: data.email,
              phone: data.phone,
              bio: data.bio,
              image_url: data.image_url,
            },
          });
          processed++;
          break;
        }

        case 'UPDATE': {
          const updateData = councilMemberUpdateSchema.parse(item.data);
          await prisma.chief_Council.update({
            where: { sourceId: updateData.sourceId },
            data: {
              ...(updateData.position && { position: updateData.position }),
              ...(updateData.first_name && { first_name: updateData.first_name }),
              ...(updateData.last_name && { last_name: updateData.last_name }),
              ...(updateData.portfolio && { portfolio: updateData.portfolio }),
              ...(updateData.email && { email: updateData.email }),
              ...(updateData.phone && { phone: updateData.phone }),
              ...(updateData.bio !== undefined && { bio: updateData.bio }),
              ...(updateData.image_url !== undefined && { image_url: updateData.image_url }),
              updated: new Date(),
            },
          });
          processed++;
          break;
        }

        case 'DELETE': {
          const deleteData = councilMemberDeleteSchema.parse(item.data);
          if (deleteData.sourceId) {
            await prisma.chief_Council.delete({
              where: { sourceId: deleteData.sourceId },
            });
          } else if (deleteData.id) {
            await prisma.chief_Council.delete({
              where: { id: deleteData.id },
            });
          }
          processed++;
          break;
        }

        default:
          throw new Error(`Unknown operation: ${item.operation}`);
      }
    } catch (error: any) {
      failed++;
      errors.push({ index: i, error: error.message });
    }
  }

  logApiAccess(request, 'council:BATCH', true, { processed, failed, syncId });

  return apiSuccess({
    syncId,
    processed,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  }, `Batch sync completed: ${processed} processed, ${failed} failed`);
}

// PUT - Update existing council member
export async function PUT(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'council:PUT', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = councilMemberUpdateSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const data = validation.data;

    const member = await prisma.chief_Council.update({
      where: { sourceId: data.sourceId },
      data: {
        ...(data.position && { position: data.position }),
        ...(data.first_name && { first_name: data.first_name }),
        ...(data.last_name && { last_name: data.last_name }),
        ...(data.portfolio && { portfolio: data.portfolio }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.image_url !== undefined && { image_url: data.image_url }),
        updated: new Date(),
      },
    });

    logApiAccess(request, 'council:PUT', true, { memberId: member.id });
    return apiSuccess(member, 'Council member updated successfully');

  } catch (error: any) {
    if (error.code === 'P2025') {
      return apiError('Council member not found', 404);
    }
    console.error('Council update error:', error);
    logApiAccess(request, 'council:PUT', false, { error: error.message });
    return apiError('Failed to update council member', 500);
  }
}

// DELETE - Remove council member
export async function DELETE(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'council:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');
    const id = searchParams.get('id');

    if (!sourceId && !id) {
      return apiError('Either sourceId or id query parameter is required', 400);
    }

    let deletedMember;
    if (sourceId) {
      deletedMember = await prisma.chief_Council.delete({
        where: { sourceId },
      });
    } else if (id) {
      deletedMember = await prisma.chief_Council.delete({
        where: { id },
      });
    }

    logApiAccess(request, 'council:DELETE', true, { sourceId, id });
    return apiSuccess({ deleted: true, id: deletedMember?.id }, 'Council member deleted successfully');

  } catch (error: any) {
    if (error.code === 'P2025') {
      return apiError('Council member not found', 404);
    }
    console.error('Council delete error:', error);
    logApiAccess(request, 'council:DELETE', false, { error: error.message });
    return apiError('Failed to delete council member', 500);
  }
}

// GET - Fetch council members
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'council:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');
    const position = searchParams.get('position');

    // If sourceId provided, return single member
    if (sourceId) {
      const member = await prisma.chief_Council.findUnique({
        where: { sourceId },
      });

      if (!member) {
        return apiError('Council member not found', 404);
      }

      logApiAccess(request, 'council:GET', true, { sourceId });
      return apiSuccess(member);
    }

    // Otherwise return all members, optionally filtered by position
    const where: any = {};
    if (position === 'CHIEF' || position === 'COUNCILLOR') {
      where.position = position;
    }

    const members = await prisma.chief_Council.findMany({
      where,
      orderBy: [
        { position: 'asc' },
        { last_name: 'asc' },
      ],
    });

    logApiAccess(request, 'council:GET', true, { count: members.length });
    return apiSuccess({
      members,
      count: members.length,
    });

  } catch (error: any) {
    console.error('Council fetch error:', error);
    logApiAccess(request, 'council:GET', false, { error: error.message });
    return apiError('Failed to fetch council members', 500);
  }
}
