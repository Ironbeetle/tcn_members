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
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { z } from 'zod';

// Bulletin categories (matching schema)
const categories = ['CHIEFNCOUNCIL', 'HEALTH', 'EDUCATION', 'RECREATION', 'EMPLOYMENT', 'PROGRAM_EVENTS', 'ANNOUNCEMENTS'] as const;

// Bulletin schema - supports poster_url OR content (both optional/nullable)
const bulletinSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  poster_url: z.string().url().optional().nullable().or(z.literal('')),
  content: z.string().max(10000).optional().nullable(),
  category: z.enum(categories).default('ANNOUNCEMENTS'),
  userId: z.string().optional(), // Staff user ID
  logoId: z.string().optional(), // Logo ID for letterhead (e.g., 'tcn-main' -> /logos/tcn-main.png)
});

// Create letterhead HTML for text-only bulletins with logo
function createLetterheadHtml(logoId: string | undefined): string {
  if (!logoId) return '';
  
  const logoUrl = `/logos/${logoId}.png`;
  return `<div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #00d9ff;">
    <img src="${logoUrl}" alt="TCN" style="width: 120px; height: auto; display: block; margin: 0 auto 10px auto;" />
    <div style="color: #1a1a2e; font-size: 18px; font-weight: bold;">Tataskweyak Cree Nation</div>
  </div>`;
}

// GET - List bulletins
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:bulletin:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const whereClause = category ? `WHERE category = '${category}'` : '';

    const bulletins = await prisma.$queryRawUnsafe<any[]>(`
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
      ${whereClause}
      ORDER BY created DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(*) as count FROM msgmanager."BulletinApiLog" ${whereClause}
    `);

    const totalCount = Number(countResult[0]?.count || 0);

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
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = bulletinSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { title, subject, poster_url, content, category, userId, logoId } = validation.data;

    // Prepend letterhead to content if logoId is provided
    const finalContent = content ? createLetterheadHtml(logoId) + content : null;

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
        ${userId || 'api-user'},
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
        ${userId || null},
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
