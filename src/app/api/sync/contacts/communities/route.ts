/**
 * Communities API - Get list of distinct communities
 * 
 * Returns a list of unique community names from member profiles
 * for filtering in the contact search.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  // Check if this is an external request (has API key header)
  const apiKey = request.headers.get('x-api-key');
  const isExternal = !!apiKey;

  // External requests (desktop app) must have valid API key
  if (isExternal) {
    const authResult = validateApiKey(request);
    if (!authResult.valid) {
      logApiAccess(request, 'contacts:communities:GET', false, { error: authResult.error });
      return apiError(authResult.error || 'Unauthorized', 401);
    }
  }

  try {
    // Get distinct communities from profiles
    const communities = await prisma.$queryRaw<{ community: string }[]>`
      SELECT DISTINCT community 
      FROM fnmemberlist."Profile" 
      WHERE community IS NOT NULL 
        AND community != ''
      ORDER BY community ASC
    `;

    const communityList = communities.map(c => c.community);

    logApiAccess(request, 'contacts:communities:GET', true, { count: communityList.length });

    // Return array directly as the frontend expects string[]
    return apiSuccess(communityList);

  } catch (error: any) {
    console.error('Communities GET error:', error);
    logApiAccess(request, 'contacts:communities:GET', false, { error: error.message });
    return apiError('Failed to fetch communities', 500);
  }
}
