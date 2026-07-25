/**
 * Bulletin by ID API - Get, update, delete specific bulletin
 * 
 * Endpoint for the Tauri Communications desktop app to manage individual bulletins.
 * Uses API key authentication only (no user auth).
 */

import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { 
  validateAuth,
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { BULLETIN_CATEGORIES } from '@/lib/category-constants';
import {
  getBulletinPlainTextLength,
  MAX_BULLETIN_HTML_LENGTH,
  MAX_BULLETIN_TEXT_LENGTH,
  normalizeBulletinContent,
} from '@/lib/bulletin-content';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Centralized category tuple used for request validation and consistency.
const categories = BULLETIN_CATEGORIES;

// GET - Get specific bulletin
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateAuth(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    const bulletins = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        title,
        subject,
        content,
        poster_url,
        category,
        "userId",
        created,
        updated
      FROM msgmanager."BulletinApiLog"
      WHERE id = ${id}
    `;

    if (bulletins.length === 0) {
      return apiError('Bulletin not found', 404);
    }

    const bulletin = bulletins[0];

    return apiSuccess({
      id: bulletin.id,
      title: bulletin.title,
      subject: bulletin.subject,
      content: bulletin.content,
      posterUrl: bulletin.poster_url,
      category: bulletin.category,
      userId: bulletin.userId,
      created: bulletin.created,
      updated: bulletin.updated,
    });

  } catch (error: any) {
    console.error('Bulletin fetch error:', error);
    return apiError('Failed to fetch bulletin', 500);
  }
}

// PATCH - Update bulletin
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateAuth(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subject, poster_url, content, category } = body;
    const normalizedContent = typeof content === 'string' ? normalizeBulletinContent(content) : content;

    if (category !== undefined && !categories.includes(category)) {
      return apiError('Invalid category', 400);
    }

    if (typeof normalizedContent === 'string') {
      if (normalizedContent.length > MAX_BULLETIN_HTML_LENGTH) {
        return apiError('Validation error', 400, [
          {
            path: ['content'],
            message: `Content HTML is too large (max ${MAX_BULLETIN_HTML_LENGTH} characters)`,
          },
        ]);
      }

      if (getBulletinPlainTextLength(normalizedContent) > MAX_BULLETIN_TEXT_LENGTH) {
        return apiError('Validation error', 400, [
          {
            path: ['content'],
            message: `Bulletin text is too long (max ${MAX_BULLETIN_TEXT_LENGTH} characters)`,
          },
        ]);
      }
    }

    // Check bulletin exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM msgmanager."BulletinApiLog" WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return apiError('Bulletin not found', 404);
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push(`title = $${values.length + 1}`);
      values.push(title);
    }

    if (subject !== undefined) {
      updates.push(`subject = $${values.length + 1}`);
      values.push(subject);
    }

    if (poster_url !== undefined) {
      updates.push(`poster_url = $${values.length + 1}`);
      values.push(poster_url);
    }

    if (normalizedContent !== undefined) {
      updates.push(`content = $${values.length + 1}`);
      values.push(normalizedContent);
    }

    if (category !== undefined) {
      updates.push(`category = $${values.length + 1}::"msgmanager"."Categories"`);
      values.push(category);
    }

    if (updates.length === 0) {
      return apiError('No fields to update', 400);
    }

    updates.push('updated = NOW()');
    values.push(id);

    const result = await prisma.$queryRawUnsafe<any[]>(`
      UPDATE msgmanager."BulletinApiLog"
      SET ${updates.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, title, subject, content, poster_url, category, updated
    `, ...values);

    const updated = result[0];

    // Sync update to portal
    await prisma.$executeRaw`
      UPDATE tcnbulletin.bulletin
      SET 
        title = ${updated.title},
        subject = ${updated.subject},
        content = ${updated.content},
        poster_url = ${updated.poster_url},
        category = ${updated.category}::"tcnbulletin"."Categories",
        updated = NOW()
      WHERE "sourceId" = ${id}
    `;

    // Revalidate bulletin board cache
    revalidatePath('/TCN_BulletinBoard');
    
    logApiAccess(request, 'comm:bulletin:PATCH', true, { bulletinId: id });

    return apiSuccess({
      id: updated.id,
      title: updated.title,
      updated: updated.updated,
      synced: true,
    }, 'Bulletin updated and synced to portal');

  } catch (error: any) {
    console.error('Bulletin update error:', error);
    return apiError('Failed to update bulletin', 500);
  }
}

// PUT - Update bulletin (alias for PATCH for compatibility)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return PATCH(request, { params });
}

// DELETE - Delete bulletin
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateAuth(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check bulletin exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id, title FROM msgmanager."BulletinApiLog" WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return apiError('Bulletin not found', 404);
    }

    // Delete from portal first
    await prisma.$executeRaw`
      DELETE FROM tcnbulletin.bulletin WHERE "sourceId" = ${id}
    `;

    // Delete from msgmanager
    await prisma.$executeRaw`
      DELETE FROM msgmanager."BulletinApiLog" WHERE id = ${id}
    `;

    logApiAccess(request, 'comm:bulletin:DELETE', true, { bulletinId: id, title: existing[0].title });

    return apiSuccess({ id }, 'Bulletin deleted from both systems');

  } catch (error: any) {
    console.error('Bulletin delete error:', error);
    return apiError('Failed to delete bulletin', 500);
  }
}
