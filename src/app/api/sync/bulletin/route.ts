/**
 * Bulletin Sync API - Messaging App pushes bulletins TO portal
 * 
 * This endpoint allows the messaging app to send bulletins
 * to be displayed on the member portal.
 * 
 * Sync Direction: Messaging App → Portal
 */

import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { 
  bulletinSyncSchema, 
  bulletinUpdateSchema,
  bulletinDeleteSchema,
  bulletinBatchSyncSchema,
} from '@/lib/bulletin-validation';
import { z } from 'zod';

// Logo name to organization name mapping
const logoOrgNames: Record<string, string> = {
  'tcn-main': 'Tataskweyak Cree Nation',
  'cscmec-main': 'Chief Sam Cook Mahmuwee Educational Center',
  'jwhc-main': 'John Wavey Health Center',
};

// Create letterhead HTML for text-only bulletins with logo
function createLetterheadHtml(logoId: string | undefined): string {
  if (!logoId) return '';
  
  const logoUrl = `/logos/${logoId}.png`;
  const orgName = logoOrgNames[logoId] || 'Tataskweyak Cree Nation';
  return `<div class="w-full h-auto mb-5 pb-4 border-b-2 border-cyan-400">
    <div class="flex flex-row items-center justify-center gap-4">
      <img src="${logoUrl}" alt="${orgName}" class="w-[120px] h-auto" />
      <span class="text-slate-800 text-lg font-bold">${orgName}</span>
    </div>
  </div>`;
}

// POST - Create or update bulletin
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'bulletin:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    // Check if it's a batch sync request
    if (body.items && Array.isArray(body.items)) {
      return handleBatchSync(request, body);
    }

    // Single bulletin sync
    const validation = bulletinSyncSchema.safeParse(body);
    if (!validation.success) {
      logApiAccess(request, 'bulletin:POST', false, { error: 'Validation error' });
      return apiError('Validation error', 400, validation.error.issues);
    }

    const data = validation.data;

    // Prepend letterhead to content if logoId is provided
    const finalContent = data.content ? createLetterheadHtml(data.logoId) + data.content : null;

    // If no poster_url provided, check if a poster file already exists for this sourceId
    // This handles race conditions where poster was uploaded before bulletin metadata
    let finalPosterUrl = data.poster_url;
    if (!finalPosterUrl || finalPosterUrl === '') {
      const path = await import('path');
      const { existsSync, readdirSync } = await import('fs');
      const posterDir = path.join(process.cwd(), 'public', 'bulletinboard');
      
      if (existsSync(posterDir)) {
        const files = readdirSync(posterDir);
        const posterFile = files.find(f => f.startsWith(data.sourceId));
        if (posterFile) {
          finalPosterUrl = `/bulletinboard/${posterFile}`;
        }
      }
    }

    // Upsert - create or update based on sourceId
    const bulletin = await prisma.bulletin.upsert({
      where: { sourceId: data.sourceId },
      update: {
        title: data.title,
        subject: data.subject,
        poster_url: finalPosterUrl || null,
        content: finalContent,
        category: data.category,
        userId: data.userId,
        updated: new Date(),
      },
      create: {
        sourceId: data.sourceId,
        title: data.title,
        subject: data.subject,
        poster_url: finalPosterUrl || null,
        content: finalContent,
        category: data.category,
        userId: data.userId,
        created: data.created ? new Date(data.created) : new Date(),
      },
    });

    // Revalidate the bulletin board page cache
    revalidatePath('/TCN_BulletinBoard');
    
    logApiAccess(request, 'bulletin:POST', true, { bulletinId: bulletin.id, sourceId: data.sourceId });
    return apiSuccess(bulletin, 'Bulletin synced successfully');

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiError('Validation error', 400, error.issues);
    }

    console.error('Bulletin sync error:', error);
    logApiAccess(request, 'bulletin:POST', false, { error: error.message });
    return apiError('Failed to sync bulletin', 500);
  }
}

// Handle batch sync operations
async function handleBatchSync(request: NextRequest, body: any) {
  const validation = bulletinBatchSyncSchema.safeParse(body);
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
          const data = bulletinSyncSchema.parse(item.data);
          const batchContent = data.content ? createLetterheadHtml(data.logoId) + data.content : null;
          await prisma.bulletin.upsert({
            where: { sourceId: data.sourceId },
            update: {
              title: data.title,
              subject: data.subject,
              poster_url: data.poster_url,
              content: batchContent,
              category: data.category,
              userId: data.userId,
              updated: new Date(),
            },
            create: {
              sourceId: data.sourceId,
              title: data.title,
              subject: data.subject,
              poster_url: data.poster_url,
              content: batchContent,
              category: data.category,
              userId: data.userId,
            },
          });
          processed++;
          break;
        }

        case 'UPDATE': {
          const updateData = bulletinUpdateSchema.parse(item.data);
          const updateContent = updateData.content ? createLetterheadHtml(updateData.logoId) + updateData.content : undefined;
          await prisma.bulletin.update({
            where: { sourceId: updateData.sourceId },
            data: {
              ...(updateData.title && { title: updateData.title }),
              ...(updateData.subject && { subject: updateData.subject }),
              ...(updateData.poster_url && { poster_url: updateData.poster_url }),
              ...(updateContent && { content: updateContent }),
              ...(updateData.category && { category: updateData.category }),
              updated: new Date(),
            },
          });
          processed++;
          break;
        }

        case 'DELETE': {
          const deleteData = bulletinDeleteSchema.parse(item.data);
          if (deleteData.sourceId) {
            await prisma.bulletin.delete({
              where: { sourceId: deleteData.sourceId },
            });
          } else if (deleteData.id) {
            await prisma.bulletin.delete({
              where: { id: deleteData.id },
            });
          }
          processed++;
          break;
        }
      }
    } catch (err: any) {
      failed++;
      errors.push({ index: i, error: err.message });
    }
  }

  logApiAccess(request, 'bulletin:BATCH', true, { syncId, processed, failed });
  
  return apiSuccess({
    syncId,
    processed,
    failed,
    total: items.length,
    errors: errors.length > 0 ? errors : undefined,
  }, `Batch sync completed: ${processed} processed, ${failed} failed`);
}

// GET - List bulletins (for verification/debugging)
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const since = searchParams.get('since');

    const bulletins = await prisma.bulletin.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(since && { updated: { gte: new Date(since) } }),
      },
      orderBy: { created: 'desc' },
      take: Math.min(limit, 100),
    });

    return apiSuccess({
      bulletins,
      count: bulletins.length,
    });

  } catch (error: any) {
    console.error('Bulletin GET error:', error);
    return apiError('Failed to fetch bulletins', 500);
  }
}

// DELETE - Remove a bulletin
export async function DELETE(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'bulletin:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = bulletinDeleteSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { sourceId, id } = validation.data;

    let deleted;
    if (sourceId) {
      deleted = await prisma.bulletin.delete({
        where: { sourceId },
      });
    } else if (id) {
      deleted = await prisma.bulletin.delete({
        where: { id },
      });
    }

    logApiAccess(request, 'bulletin:DELETE', true, { deletedId: deleted?.id });
    return apiSuccess(deleted, 'Bulletin deleted successfully');

  } catch (error: any) {
    if (error.code === 'P2025') {
      return apiError('Bulletin not found', 404);
    }
    
    console.error('Bulletin delete error:', error);
    logApiAccess(request, 'bulletin:DELETE', false, { error: error.message });
    return apiError('Failed to delete bulletin', 500);
  }
}
