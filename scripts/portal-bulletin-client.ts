/**
 * TCN Portal Bulletin Sync Client
 * 
 * Copy this file to your Messaging App project.
 * Use these functions to sync bulletins and posters to the TCN Member Portal.
 * 
 * Required Environment Variables:
 * - PORTAL_API_KEY: Your API key for the portal
 * - PORTAL_API_URL: Base URL of the portal API (e.g., https://portal.tcn.ca/api/sync)
 */

// Types matching the portal's bulletin model
export type Categories = 
  | 'CHIEFNCOUNCIL'
  | 'HEALTH'
  | 'EDUCATION'
  | 'RECREATION'
  | 'EMPLOYMENT'
  | 'PROGRAM_EVENTS'
  | 'ANNOUNCEMENTS';

export interface BulletinData {
  sourceId: string;        // Your BulletinApiLog.id
  title: string;
  subject: string;
  poster_url: string;      // Will be set after uploading poster
  category: Categories;
  userId?: string;         // Your User.id who created it
  created?: string;        // ISO timestamp
}

export interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  timestamp: string;
}

// Configuration
const getConfig = () => {
  const apiKey = process.env.PORTAL_API_KEY;
  const apiUrl = process.env.PORTAL_API_URL;

  if (!apiKey) {
    throw new Error('PORTAL_API_KEY environment variable is not set');
  }
  if (!apiUrl) {
    throw new Error('PORTAL_API_URL environment variable is not set');
  }

  return { apiKey, apiUrl };
};

// Base fetch function for JSON requests
async function syncFetch<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE',
  body?: any
): Promise<SyncResponse & { data?: T }> {
  const { apiKey, apiUrl } = getConfig();

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Sync fetch error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
      timestamp: new Date().toISOString(),
    };
  }
}

// ==================== POSTER UPLOAD ====================

/**
 * Upload a poster image to the portal
 * Call this FIRST before syncing the bulletin
 * 
 * @param sourceId - Your BulletinApiLog.id
 * @param file - The image file (File, Blob, or Buffer)
 * @param filename - Original filename with extension
 * @returns The poster_url to use in the bulletin
 */
export async function uploadPoster(
  sourceId: string,
  file: File | Blob | Buffer,
  filename: string
): Promise<SyncResponse & { data?: { poster_url: string; filename: string } }> {
  const { apiKey, apiUrl } = getConfig();

  try {
    const formData = new FormData();
    
    // Handle different file types
    if (Buffer.isBuffer(file)) {
      // Convert Buffer to Blob for FormData
      const blob = new Blob([new Uint8Array(file)]);
      formData.append('file', blob, filename);
    } else {
      formData.append('file', file, filename);
    }
    
    formData.append('sourceId', sourceId);
    formData.append('filename', filename);

    const response = await fetch(`${apiUrl}/poster`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        // Don't set Content-Type - let browser set it with boundary
      },
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Poster upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Upload a poster from a file path (Node.js only)
 */
export async function uploadPosterFromPath(
  sourceId: string,
  filePath: string
): Promise<SyncResponse & { data?: { poster_url: string; filename: string } }> {
  const { readFileSync } = await import('fs');
  const { basename } = await import('path');
  
  const buffer = readFileSync(filePath);
  const filename = basename(filePath);
  
  return uploadPoster(sourceId, buffer, filename);
}

/**
 * Delete a poster from the portal
 */
export async function deletePoster(
  identifier: { sourceId?: string; filename?: string }
): Promise<SyncResponse> {
  return syncFetch('/poster', 'DELETE', identifier);
}

/**
 * Check if a poster exists
 */
export async function checkPoster(
  identifier: { sourceId?: string; filename?: string }
): Promise<SyncResponse & { data?: { exists: boolean; poster_url?: string } }> {
  const { apiKey, apiUrl } = getConfig();
  const params = new URLSearchParams();
  
  if (identifier.sourceId) params.append('sourceId', identifier.sourceId);
  if (identifier.filename) params.append('filename', identifier.filename);

  try {
    const response = await fetch(`${apiUrl}/poster?${params}`, {
      headers: { 'x-api-key': apiKey },
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// ==================== BULLETIN SYNC ====================

/**
 * Sync a bulletin to the portal
 * Make sure to upload the poster first and use the returned poster_url
 */
export async function syncBulletin(bulletin: BulletinData): Promise<SyncResponse> {
  return syncFetch('/bulletin', 'POST', bulletin);
}

/**
 * Update an existing bulletin
 */
export async function updateBulletin(
  sourceId: string,
  updates: Partial<Omit<BulletinData, 'sourceId'>>
): Promise<SyncResponse> {
  return syncFetch('/bulletin', 'POST', { sourceId, ...updates });
}

/**
 * Delete a bulletin from the portal
 */
export async function deleteBulletin(
  identifier: { sourceId?: string; id?: string }
): Promise<SyncResponse> {
  return syncFetch('/bulletin', 'DELETE', identifier);
}

/**
 * Get bulletins from the portal (for verification)
 */
export async function getBulletins(options: {
  category?: Categories;
  limit?: number;
  since?: Date;
} = {}): Promise<SyncResponse & { data?: { bulletins: any[]; count: number } }> {
  const { apiKey, apiUrl } = getConfig();
  const params = new URLSearchParams();
  
  if (options.category) params.append('category', options.category);
  if (options.limit) params.append('limit', String(options.limit));
  if (options.since) params.append('since', options.since.toISOString());

  try {
    const response = await fetch(`${apiUrl}/bulletin?${params}`, {
      headers: { 'x-api-key': apiKey },
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Batch sync multiple bulletins
 */
export async function batchSyncBulletins(
  items: Array<{
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPSERT';
    data: BulletinData | { sourceId: string } | { id: string };
  }>
): Promise<SyncResponse & { data?: { processed: number; failed: number } }> {
  return syncFetch('/bulletin', 'POST', {
    syncId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source: 'messaging',
    items,
  });
}

// ==================== COMPLETE WORKFLOW ====================

/**
 * Complete workflow: Upload poster + Create bulletin in one call
 * 
 * @param bulletin - Bulletin data (poster_url will be set automatically)
 * @param posterFile - The poster image file
 * @param posterFilename - Filename for the poster
 */
export async function createBulletinWithPoster(
  bulletin: Omit<BulletinData, 'poster_url'>,
  posterFile: File | Blob | Buffer,
  posterFilename: string
): Promise<SyncResponse & { data?: { bulletin: any; poster_url: string } }> {
  // Step 1: Upload poster
  const uploadResult = await uploadPoster(bulletin.sourceId, posterFile, posterFilename);
  
  if (!uploadResult.success || !uploadResult.data?.poster_url) {
    return {
      success: false,
      error: uploadResult.error || 'Failed to upload poster',
      timestamp: new Date().toISOString(),
    };
  }

  const poster_url = uploadResult.data.poster_url;

  // Step 2: Sync bulletin with poster URL
  const bulletinResult = await syncBulletin({
    ...bulletin,
    poster_url,
  });

  if (!bulletinResult.success) {
    // Optionally delete the uploaded poster if bulletin sync fails
    await deletePoster({ sourceId: bulletin.sourceId });
    return bulletinResult;
  }

  return {
    success: true,
    message: 'Bulletin created with poster',
    data: {
      bulletin: bulletinResult.data,
      poster_url,
    },
    timestamp: new Date().toISOString(),
  };
}

// ==================== EXAMPLE USAGE ====================
/*
import {
  uploadPoster,
  syncBulletin,
  createBulletinWithPoster,
  deleteBulletin,
} from './portal-bulletin-client';

// Option 1: Complete workflow (recommended)
const result = await createBulletinWithPoster(
  {
    sourceId: 'clx123...',  // Your BulletinApiLog.id
    title: 'Community Meeting',
    subject: 'Monthly community meeting this Saturday',
    category: 'CHIEFNCOUNCIL',
    userId: 'user123',       // Optional: your User.id
  },
  posterImageFile,           // File, Blob, or Buffer
  'community-meeting.jpg'
);

// Option 2: Manual two-step process
// Step 1: Upload poster first
const upload = await uploadPoster('clx123...', imageFile, 'poster.jpg');
console.log('Poster URL:', upload.data?.poster_url);

// Step 2: Sync bulletin with poster URL
const bulletin = await syncBulletin({
  sourceId: 'clx123...',
  title: 'Community Meeting',
  subject: 'Monthly community meeting',
  poster_url: upload.data?.poster_url!,
  category: 'CHIEFNCOUNCIL',
});

// Delete a bulletin (also deletes from portal)
await deleteBulletin({ sourceId: 'clx123...' });
*/
