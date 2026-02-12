/**
 * Bulletin Poster Upload API - Upload poster images
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:bulletin:poster:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const formData = await request.formData();
    const sourceId = formData.get('sourceId') as string;
    const file = formData.get('file') as File;

    if (!sourceId || !file) {
      return apiError('Missing sourceId or file', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type. Allowed: JPEG, PNG, GIF, WebP', 400);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return apiError('File too large. Maximum size: 10MB', 400);
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'bulletinboard');
    await mkdir(uploadDir, { recursive: true });

    // Generate filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${sourceId}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate URL - use relative path for consistency with sync/poster
    const posterUrl = `/bulletinboard/${filename}`;

    // Try to update the bulletin if it exists in comm_BulletinApiLog
    const existingApiLogBulletin = await prisma.comm_BulletinApiLog.findUnique({
      where: { id: sourceId }
    });
    
    if (existingApiLogBulletin) {
      await prisma.comm_BulletinApiLog.update({
        where: { id: sourceId },
        data: { poster_url: posterUrl }
      });
    }

    // Always try to update the portal bulletin - this handles cases where
    // the bulletin was synced but poster upload came later
    const portalBulletinUpdated = await prisma.bulletin.updateMany({
      where: { sourceId },
      data: { poster_url: posterUrl }
    });

    // If neither bulletin exists yet, the calling app should ensure the bulletin
    // is created/synced with this poster_url. Log this for debugging.
    const bulletinFound = existingApiLogBulletin || portalBulletinUpdated.count > 0;
    
    logApiAccess(request, 'comm:bulletin:poster:POST', true, { 
      sourceId, 
      filename,
      bulletinFound,
      portalUpdated: portalBulletinUpdated.count > 0
    });

    return apiSuccess({
      poster_url: posterUrl,
    }, 'Poster uploaded successfully');

  } catch (error: any) {
    console.error('Poster upload error:', error);
    logApiAccess(request, 'comm:bulletin:poster:POST', false, { error: error.message });
    return apiError('Failed to upload poster', 500);
  }
}
