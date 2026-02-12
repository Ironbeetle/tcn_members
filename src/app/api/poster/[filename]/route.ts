/**
 * Bulletin Poster Image API
 * Serves poster images dynamically (bypasses Next.js static file build caching)
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;
    
    // Sanitize filename to prevent directory traversal
    const sanitized = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'bulletinboard', sanitized);
    
    if (!existsSync(filePath)) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageBuffer = await readFile(filePath);
    
    // Determine content type from extension
    const ext = path.extname(sanitized).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    const contentType = contentTypes[ext] || 'image/jpeg';
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving poster image:', error);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
