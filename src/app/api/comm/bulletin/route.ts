/**
 * Bulletin API - Manage bulletins from the communications app
 * 
 * Endpoint for the Electron Communications desktop app to create and manage
 * bulletins that sync to the member portal.
 * Uses API key authentication only (no user auth).
 */

import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Prisma, comm_Categories } from '@prisma/client';
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
import { z } from 'zod';

// Bulletin categories (matching Prisma Categories enum)
const categories = BULLETIN_CATEGORIES;

// Bulletin schema - supports poster_url OR content (both optional/nullable)
const bulletinSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  poster_url: z.string().url().optional().nullable().or(z.literal('')),
  content: z
    .string()
    .max(MAX_BULLETIN_HTML_LENGTH, {
      message: `Content HTML is too large (max ${MAX_BULLETIN_HTML_LENGTH} characters)`,
    })
    .refine((value) => getBulletinPlainTextLength(value) <= MAX_BULLETIN_TEXT_LENGTH, {
      message: `Bulletin text is too long (max ${MAX_BULLETIN_TEXT_LENGTH} characters)`,
    })
    .optional()
    .nullable(),
  category: z.enum(categories).default('COMMUNITY_ADMIN'),
  userId: z.string().optional(), // Staff user ID
  logoId: z.string().optional(), // Logo ID for letterhead (e.g., 'tcn-main' -> /logos/tcn-main.png)
});

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

// GET - List bulletins
export async function GET(request: NextRequest) {
  const authResult = await validateAuth(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:bulletin:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const isValidCategory = !category || categories.includes(category as typeof categories[number]);
    if (!isValidCategory) {
      return apiError('Invalid category', 400);
    }

    const where: Prisma.comm_BulletinApiLogWhereInput = category
      ? { category: category as comm_Categories }
      : {};

    const [bulletins, totalCount] = await Promise.all([
      prisma.comm_BulletinApiLog.findMany({
        where,
        orderBy: { created: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          subject: true,
          content: true,
          poster_url: true,
          category: true,
          userId: true,
          created: true,
          updated: true,
        },
      }),
      prisma.comm_BulletinApiLog.count({ where }),
    ]);

    logApiAccess(request, 'comm:bulletin:GET', true, { count: bulletins.length });

    return apiSuccess({
      bulletins: bulletins.map(b => ({
        id: b.id,
        title: b.title,
        subject: b.subject,
        content: b.content,
        posterUrl: b.poster_url,
        category: b.category,
        userId: b.userId,
        created: b.created,
        updated: b.updated,
      })),
      count: bulletins.length,
      total: totalCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + bulletins.length < totalCount,
      },
    });

  } catch (error: any) {
    console.error('Bulletins list error:', error);
    return apiError('Failed to fetch bulletins', 500);
  }
}

// POST - Create bulletin and sync to portal
export async function POST(request: NextRequest) {
  const authResult = await validateAuth(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:bulletin:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const normalizedBody = typeof body?.content === 'string'
      ? { ...body, content: normalizeBulletinContent(body.content) }
      : body;
    
    const validation = bulletinSchema.safeParse(normalizedBody);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { title, subject, poster_url, content, userId, logoId } = validation.data;
    const category = validation.data.category;
    const effectiveUserId = authResult.authType === 'session' ? authResult.user?.id : userId;

    // Prepend letterhead to content if logoId is provided
    const finalContent = typeof content === 'string' && content.trim().length > 0
      ? createLetterheadHtml(logoId) + content
      : null;

    // Create bulletin in msgmanager schema
    const bulletinResult = await prisma.$queryRaw<any[]>`
      INSERT INTO msgmanager."BulletinApiLog" (
        id, title, subject, content, poster_url, category, "userId", created, updated
      )
      VALUES (
        gen_random_uuid()::text,
        ${title},
        ${subject},
        ${finalContent || null},
        ${poster_url || null},
        ${category}::"msgmanager"."Categories",
        ${effectiveUserId || 'api-user'},
        NOW(),
        NOW()
      )
      RETURNING id, title, created
    `;

    const bulletin = bulletinResult[0];

    // Sync to portal's tcnbulletin schema
    await prisma.$executeRaw`
      INSERT INTO tcnbulletin.bulletin (
        id, title, subject, content, poster_url, category, "sourceId", "userId", created, updated
      )
      VALUES (
        gen_random_uuid()::text,
        ${title},
        ${subject},
        ${finalContent || null},
        ${poster_url || null},
        ${category}::"tcnbulletin"."Categories",
        ${bulletin.id},
        ${effectiveUserId || null},
        NOW(),
        NOW()
      )
      ON CONFLICT ("sourceId") DO UPDATE SET
        title = EXCLUDED.title,
        subject = EXCLUDED.subject,
        content = EXCLUDED.content,
        poster_url = EXCLUDED.poster_url,
        category = EXCLUDED.category,
        updated = NOW()
    `;

    // Revalidate bulletin board cache
    revalidatePath('/TCN_BulletinBoard');
    
    logApiAccess(request, 'comm:bulletin:POST', true, { bulletinId: bulletin.id });

    return apiSuccess({
      id: bulletin.id,
      title: bulletin.title,
      created: bulletin.created,
      synced: true,
    }, 'Bulletin created and synced to portal');

  } catch (error: any) {
    console.error('Bulletin creation error:', error);
    return apiError('Failed to create bulletin', 500);
  }
}
