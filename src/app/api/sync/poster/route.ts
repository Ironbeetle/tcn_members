/**
 * Poster Upload API - Receive poster images from messaging app
 * 
 * This endpoint handles multipart/form-data uploads for bulletin poster images.
 * Images are saved to /public/bulletinboard/ directory.
 * 
 * Sync Direction: Messaging App → Portal
 */

import { NextRequest } from 'next/server';
import { validateApiKey, apiSuccess, apiError, logApiAccess } from '@/lib/api-auth';
import { posterUploadSchema } from '@/lib/bulletin-validation';

// Allowed MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
];

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'poster:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    // Use dynamic imports to avoid Turbopack static file analysis
    const { writeFile, mkdir } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const path = await import('path');
    const POSTER_DIR = path.join(process.cwd(), 'public', 'bulletinboard');

    // Ensure poster directory exists
    if (!existsSync(POSTER_DIR)) {
      await mkdir(POSTER_DIR, { recursive: true });
    }

    const formData = await request.formData();
    
    // Get the file
    const file = formData.get('file') as File | null;
    if (!file) {
      return apiError('No file provided', 400);
    }

    // Get metadata
    const sourceId = formData.get('sourceId') as string;
    const filename = formData.get('filename') as string || file.name;

    // Validate metadata
    const metaValidation = posterUploadSchema.safeParse({
      sourceId,
      filename,
      contentType: file.type,
    });

    if (!metaValidation.success) {
      return apiError('Invalid upload metadata', 400, metaValidation.error.issues);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(
        `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`,
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Generate unique filename using sourceId
    const ext = path.extname(filename) || `.${file.type.split('/')[1]}`;
    const safeFilename = `${sourceId}${ext}`.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(POSTER_DIR, safeFilename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the URL path for the poster
    const posterUrl = `/bulletinboard/${safeFilename}`;

    logApiAccess(request, 'poster:POST', true, { 
      sourceId, 
      filename: safeFilename,
      size: file.size,
    });

    return apiSuccess({
      sourceId,
      filename: safeFilename,
      poster_url: posterUrl,
      size: file.size,
      contentType: file.type,
    }, 'Poster uploaded successfully');

  } catch (error: any) {
    console.error('Poster upload error:', error);
    logApiAccess(request, 'poster:POST', false, { error: error.message });
    return apiError('Failed to upload poster', 500);
  }
}

// DELETE - Remove a poster file
export async function DELETE(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'poster:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { filename, sourceId } = body;

    if (!filename && !sourceId) {
      return apiError('Either filename or sourceId must be provided', 400);
    }

    // Use dynamic imports to avoid Turbopack static file analysis
    const { unlink } = await import('fs/promises');
    const { readdirSync, existsSync } = await import('fs');
    const path = await import('path');
    const POSTER_DIR = path.join(process.cwd(), 'public', 'bulletinboard');

    let fileToDelete: string | undefined;

    if (filename) {
      fileToDelete = path.join(POSTER_DIR, filename);
    } else if (sourceId) {
      // Find file by sourceId prefix
      const files = readdirSync(POSTER_DIR);
      const match = files.find(f => f.startsWith(sourceId));
      if (match) {
        fileToDelete = path.join(POSTER_DIR, match);
      }
    }

    if (!fileToDelete || !existsSync(fileToDelete)) {
      return apiError('Poster file not found', 404);
    }

    await unlink(fileToDelete);

    logApiAccess(request, 'poster:DELETE', true, { filename: fileToDelete });
    return apiSuccess({ deleted: fileToDelete }, 'Poster deleted successfully');

  } catch (error: any) {
    console.error('Poster delete error:', error);
    logApiAccess(request, 'poster:DELETE', false, { error: error.message });
    return apiError('Failed to delete poster', 500);
  }
}

// GET - Check if a poster exists
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceId = searchParams.get('sourceId');
    const filename = searchParams.get('filename');

    // Use dynamic imports to avoid Turbopack static file analysis
    const { readdirSync, statSync, existsSync } = await import('fs');
    const path = await import('path');
    const POSTER_DIR = path.join(process.cwd(), 'public', 'bulletinboard');

    if (!sourceId && !filename) {
      // List all posters
      if (!existsSync(POSTER_DIR)) {
        return apiSuccess({ posters: [], count: 0 });
      }

      const files = readdirSync(POSTER_DIR);
      const posters = files.map(f => {
        const filePath = path.join(POSTER_DIR, f);
        const stats = statSync(filePath);
        return {
          filename: f,
          poster_url: `/bulletinboard/${f}`,
          size: stats.size,
          modified: stats.mtime,
        };
      });

      return apiSuccess({ posters, count: posters.length });
    }

    // Check specific file
    let filePath: string | undefined;
    
    if (filename) {
      filePath = path.join(POSTER_DIR, filename);
    } else if (sourceId) {
      const files = readdirSync(POSTER_DIR);
      const match = files.find(f => f.startsWith(sourceId));
      if (match) {
        filePath = path.join(POSTER_DIR, match);
      }
    }

    if (!filePath || !existsSync(filePath)) {
      return apiSuccess({ exists: false });
    }

    const stats = statSync(filePath);

    return apiSuccess({
      exists: true,
      filename: path.basename(filePath),
      poster_url: `/bulletinboard/${path.basename(filePath)}`,
      size: stats.size,
      modified: stats.mtime,
    });

  } catch (error: any) {
    console.error('Poster check error:', error);
    return apiError('Failed to check poster', 500);
  }
}
