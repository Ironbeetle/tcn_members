/**
 * Sync Pull API - Master DB pulls Profile & Family updates FROM portal
 * 
 * This endpoint allows the master database manager to retrieve
 * Profile and Family data that members have updated on the portal.
 * 
 * Sync Direction: Portal → Master (Master pulls from Portal)
 * Models: Profile, Family (member-editable data)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApiKey } from '@/lib/api-auth';
import { portalPullRequestSchema } from '@/lib/sync-validation';

// Helper function to create API responses
function createApiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(request: NextRequest) {
  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return createApiResponse({
      success: false,
      error: authResult.error || 'Unauthorized',
    }, 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const params = {
      since: searchParams.get('since') || undefined,
      models: searchParams.get('models')?.split(',').filter(m => ['Profile', 'Family'].includes(m)) || ['Profile', 'Family'],
      limit: parseInt(searchParams.get('limit') || '100'),
      cursor: searchParams.get('cursor') || undefined,
    };

    // Validate
    const validation = portalPullRequestSchema.safeParse(params);
    if (!validation.success) {
      return createApiResponse({
        success: false,
        error: 'Invalid request parameters',
        details: validation.error.issues,
      }, 400);
    }

    const { since, models, limit, cursor } = validation.data;
    const sinceDate = since ? new Date(since) : undefined;

    const results: {
      profiles?: any[];
      families?: any[];
      pagination: {
        hasMore: boolean;
        nextCursor?: string;
        totalReturned: number;
      };
    } = {
      pagination: {
        hasMore: false,
        totalReturned: 0,
      },
    };

    // Fetch Profiles if requested
    if (models.includes('Profile')) {
      const profiles = await prisma.profile.findMany({
        where: {
          ...(sinceDate && { updated: { gte: sinceDate } }),
          ...(cursor && { id: { gt: cursor } }),
        },
        include: {
          fnmember: {
            select: {
              id: true,
              t_number: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { id: 'asc' },
        take: limit + 1, // Take one extra to check if there's more
      });

      const hasMoreProfiles = profiles.length > limit;
      if (hasMoreProfiles) {
        profiles.pop(); // Remove the extra one
      }

      results.profiles = profiles.map(p => ({
        id: p.id,
        created: p.created.toISOString(),
        updated: p.updated.toISOString(),
        gender: p.gender,
        o_r_status: p.o_r_status,
        community: p.community,
        address: p.address,
        phone_number: p.phone_number,
        email: p.email,
        image_url: p.image_url,
        fnmemberId: p.fnmemberId,
        // Include member reference for easy lookup
        member: p.fnmember ? {
          id: p.fnmember.id,
          t_number: p.fnmember.t_number,
          name: `${p.fnmember.first_name} ${p.fnmember.last_name}`,
        } : null,
      }));

      results.pagination.hasMore = hasMoreProfiles;
      results.pagination.totalReturned += profiles.length;
      if (hasMoreProfiles && profiles.length > 0) {
        results.pagination.nextCursor = profiles[profiles.length - 1].id;
      }
    }

    // Fetch Families if requested
    if (models.includes('Family')) {
      const families = await prisma.family.findMany({
        where: {
          ...(sinceDate && { updated: { gte: sinceDate } }),
          ...(cursor && { id: { gt: cursor } }),
        },
        include: {
          fnmember: {
            select: {
              id: true,
              t_number: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { id: 'asc' },
        take: limit + 1,
      });

      const hasMoreFamilies = families.length > limit;
      if (hasMoreFamilies) {
        families.pop();
      }

      results.families = families.map(f => ({
        id: f.id,
        created: f.created.toISOString(),
        updated: f.updated.toISOString(),
        spouse_fname: f.spouse_fname,
        spouse_lname: f.spouse_lname,
        dependents: f.dependents,
        fnmemberId: f.fnmemberId,
        // Include member reference
        member: f.fnmember ? {
          id: f.fnmember.id,
          t_number: f.fnmember.t_number,
          name: `${f.fnmember.first_name} ${f.fnmember.last_name}`,
        } : null,
      }));

      results.pagination.hasMore = results.pagination.hasMore || hasMoreFamilies;
      results.pagination.totalReturned += families.length;
    }

    return createApiResponse({
      success: true,
      message: 'Portal data retrieved successfully',
      data: results,
      query: {
        since: since || 'all time',
        models,
        limit,
      },
    });

  } catch (error: any) {
    console.error('Sync pull error:', error);
    return createApiResponse({
      success: false,
      error: 'Failed to retrieve portal data',
      details: error.message,
    }, 500);
  }
}

// POST endpoint for more complex pull requests
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return createApiResponse({
      success: false,
      error: authResult.error || 'Unauthorized',
    }, 401);
  }

  try {
    const body = await request.json();
    
    const validation = portalPullRequestSchema.safeParse(body);
    if (!validation.success) {
      return createApiResponse({
        success: false,
        error: 'Invalid request body',
        details: validation.error.issues,
      }, 400);
    }

    const { since, models, limit, cursor } = validation.data;
    const sinceDate = since ? new Date(since) : undefined;

    const results: Record<string, any[]> = {};
    let totalReturned = 0;
    let nextCursor: string | undefined;

    // Fetch each requested model
    for (const model of models) {
      if (model === 'Profile') {
        const profiles = await prisma.profile.findMany({
          where: {
            ...(sinceDate && { updated: { gte: sinceDate } }),
            ...(cursor && { id: { gt: cursor } }),
          },
          include: {
            fnmember: {
              select: {
                id: true,
                t_number: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: { updated: 'desc' },
          take: limit,
        });

        results.profiles = profiles.map(p => ({
          ...p,
          created: p.created.toISOString(),
          updated: p.updated.toISOString(),
          memberTNumber: p.fnmember?.t_number,
        }));
        totalReturned += profiles.length;
        
        if (profiles.length > 0) {
          nextCursor = profiles[profiles.length - 1].id;
        }
      }

      if (model === 'Family') {
        const families = await prisma.family.findMany({
          where: {
            ...(sinceDate && { updated: { gte: sinceDate } }),
            ...(cursor && { id: { gt: cursor } }),
          },
          include: {
            fnmember: {
              select: {
                id: true,
                t_number: true,
                first_name: true,
                last_name: true,
              },
            },
          },
          orderBy: { updated: 'desc' },
          take: limit,
        });

        results.families = families.map(f => ({
          ...f,
          created: f.created.toISOString(),
          updated: f.updated.toISOString(),
          memberTNumber: f.fnmember?.t_number,
        }));
        totalReturned += families.length;
      }
    }

    return createApiResponse({
      success: true,
      message: 'Portal data retrieved',
      data: {
        ...results,
        pagination: {
          totalReturned,
          nextCursor,
          hasMore: totalReturned >= limit,
        },
      },
    });

  } catch (error: any) {
    console.error('Sync pull POST error:', error);
    return createApiResponse({
      success: false,
      error: 'Failed to process pull request',
      details: error.message,
    }, 500);
  }
}
