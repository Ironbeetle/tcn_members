/**
 * Sync API - Batch Endpoint
 * Handles bulk sync operations from master database
 * 
 * POST /api/sync/batch - Process multiple sync operations in one request
 */

import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  validateApiKey,
  checkRateLimit,
  getClientIp,
  apiSuccess,
  apiError,
  logApiAccess,
} from '@/lib/api-auth';
import {
  batchSyncRequestSchema,
  fnmemberSyncSchema,
  profileSyncSchema,
  barcodeSyncSchema,
  familySyncSchema,
  type SyncItem,
} from '@/lib/sync-validation';
import { z } from 'zod';

const prisma = new PrismaClient();

// Process a single sync item
async function processSyncItem(item: SyncItem): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    switch (item.model) {
      case 'fnmember':
        return await processFnmemberSync(item);
      case 'Profile':
        return await processProfileSync(item);
      case 'Barcode':
        return await processBarcodeSync(item);
      case 'Family':
        return await processFamilySync(item);
      default:
        return { success: false, error: `Unknown model: ${item.model}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function processFnmemberSync(item: SyncItem) {
  switch (item.operation) {
    case 'CREATE':
    case 'UPSERT': {
      const data = fnmemberSyncSchema.parse(item.data);
      
      // First, try to find existing member by t_number (more reliable than id for syncing)
      const existingMember = await prisma.fnmember.findUnique({
        where: { t_number: data.t_number },
      });
      
      const memberId = existingMember?.id || data.id;
      
      const member = await prisma.fnmember.upsert({
        where: { t_number: data.t_number },
        create: {
          id: data.id,
          birthdate: new Date(data.birthdate),
          first_name: data.first_name,
          last_name: data.last_name,
          t_number: data.t_number,
          activated: data.activated || 'NONE',
          deceased: data.deceased,
          created: new Date(data.created),
          updated: new Date(data.updated),
        },
        update: {
          birthdate: new Date(data.birthdate),
          first_name: data.first_name,
          last_name: data.last_name,
          deceased: data.deceased,
          updated: new Date(),
        },
      });
      
      // Process nested Profile if provided (as per VPS_SYNC_REFERENCE.md)
      // Find by fnmemberId first to prevent duplicates when IDs differ between systems
      const rawData = item.data as any;
      if (rawData.profile) {
        const profileData = rawData.profile;
        const existingProfile = await prisma.profile.findFirst({
          where: { fnmemberId: member.id }
        });
        
        if (existingProfile) {
          // Update existing profile
          await prisma.profile.update({
            where: { id: existingProfile.id },
            data: {
              gender: profileData.gender,
              o_r_status: profileData.o_r_status,
              community: profileData.community,
              address: profileData.address,
              phone_number: profileData.phone_number,
              email: profileData.email,
              image_url: profileData.image_url,
              updated: new Date(),
            },
          });
        } else {
          // Create new profile
          await prisma.profile.create({
            data: {
              id: profileData.id,
              gender: profileData.gender,
              o_r_status: profileData.o_r_status,
              community: profileData.community,
              address: profileData.address,
              phone_number: profileData.phone_number,
              email: profileData.email,
              image_url: profileData.image_url,
              fnmemberId: member.id,
              created: profileData.created ? new Date(profileData.created) : new Date(),
              updated: profileData.updated ? new Date(profileData.updated) : new Date(),
            },
          });
        }
      }
      
      // Process nested Barcode if provided (as per VPS_SYNC_REFERENCE.md)
      if (rawData.barcode) {
        const barcodeData = rawData.barcode;
        await prisma.barcode.upsert({
          where: { id: barcodeData.id },
          create: {
            id: barcodeData.id,
            barcode: barcodeData.barcode,
            activated: barcodeData.activated ?? 2, // Default to assigned (2) when syncing
            fnmemberId: member.id,
            created: barcodeData.created ? new Date(barcodeData.created) : new Date(),
            updated: barcodeData.updated ? new Date(barcodeData.updated) : new Date(),
          },
          update: {
            barcode: barcodeData.barcode,
            activated: barcodeData.activated,
            fnmemberId: member.id,
            updated: new Date(),
          },
        });
      }
      
      // Process nested Family if provided (as per VPS_SYNC_REFERENCE.md)
      if (rawData.family) {
        const familyData = rawData.family;
        await prisma.family.upsert({
          where: { id: familyData.id },
          create: {
            id: familyData.id,
            spouse_fname: familyData.spouse_fname,
            spouse_lname: familyData.spouse_lname,
            dependents: familyData.dependents ?? 0,
            fnmemberId: member.id,
            created: familyData.created ? new Date(familyData.created) : new Date(),
            updated: familyData.updated ? new Date(familyData.updated) : new Date(),
          },
          update: {
            spouse_fname: familyData.spouse_fname,
            spouse_lname: familyData.spouse_lname,
            dependents: familyData.dependents,
            updated: new Date(),
          },
        });
      }
      
      // Return member with relations
      const fullMember = await prisma.fnmember.findUnique({
        where: { id: member.id },
        include: { profile: true, barcode: true, family: true },
      });
      
      return { success: true, data: fullMember };
    }
    
    case 'UPDATE': {
      const data = fnmemberSyncSchema.partial().extend({ id: z.string().cuid() }).parse(item.data);
      const member = await prisma.fnmember.update({
        where: { id: data.id },
        data: {
          ...(data.birthdate && { birthdate: new Date(data.birthdate) }),
          ...(data.first_name && { first_name: data.first_name }),
          ...(data.last_name && { last_name: data.last_name }),
          ...(data.t_number && { t_number: data.t_number }),
          ...(data.deceased !== undefined && { deceased: data.deceased }),
          updated: new Date(),
        },
      });
      return { success: true, data: member };
    }
    
    case 'DELETE': {
      if (!item.id) return { success: false, error: 'Missing id for DELETE operation' };
      // Soft delete - just mark as deceased with special marker
      const member = await prisma.fnmember.update({
        where: { id: item.id },
        data: {
          deceased: 'REMOVED_BY_MASTER',
          updated: new Date(),
        },
      });
      return { success: true, data: member };
    }
    
    default:
      return { success: false, error: `Unknown operation: ${item.operation}` };
  }
}

async function processProfileSync(item: SyncItem) {
  switch (item.operation) {
    case 'CREATE':
    case 'UPSERT': {
      const data = profileSyncSchema.parse(item.data);
      
      // Find by fnmemberId first to prevent duplicates when IDs differ between systems
      const existingProfile = data.fnmemberId 
        ? await prisma.profile.findFirst({ where: { fnmemberId: data.fnmemberId } })
        : null;
      
      let profile;
      if (existingProfile) {
        // Update existing profile
        profile = await prisma.profile.update({
          where: { id: existingProfile.id },
          data: {
            gender: data.gender,
            o_r_status: data.o_r_status,
            community: data.community,
            address: data.address,
            phone_number: data.phone_number,
            email: data.email,
            image_url: data.image_url,
            updated: new Date(),
          },
        });
      } else {
        // Create new profile
        profile = await prisma.profile.create({
          data: {
            id: data.id,
            gender: data.gender,
            o_r_status: data.o_r_status,
            community: data.community,
            address: data.address,
            phone_number: data.phone_number,
            email: data.email,
            image_url: data.image_url,
            fnmemberId: data.fnmemberId,
            created: new Date(data.created),
            updated: new Date(data.updated),
          },
        });
      }
      return { success: true, data: profile };
    }
    
    case 'UPDATE': {
      const data = profileSyncSchema.partial().extend({ id: z.string().cuid() }).parse(item.data);
      const profile = await prisma.profile.update({
        where: { id: data.id },
        data: {
          ...(data.gender !== undefined && { gender: data.gender }),
          ...(data.o_r_status && { o_r_status: data.o_r_status }),
          ...(data.community && { community: data.community }),
          ...(data.address && { address: data.address }),
          ...(data.phone_number && { phone_number: data.phone_number }),
          ...(data.email && { email: data.email }),
          ...(data.image_url !== undefined && { image_url: data.image_url }),
          updated: new Date(),
        },
      });
      return { success: true, data: profile };
    }
    
    case 'DELETE': {
      if (!item.id) return { success: false, error: 'Missing id for DELETE operation' };
      const profile = await prisma.profile.delete({ where: { id: item.id } });
      return { success: true, data: profile };
    }
    
    default:
      return { success: false, error: `Unknown operation: ${item.operation}` };
  }
}

async function processBarcodeSync(item: SyncItem) {
  switch (item.operation) {
    case 'CREATE':
    case 'UPSERT': {
      const data = barcodeSyncSchema.parse(item.data);
      const barcode = await prisma.barcode.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          barcode: data.barcode,
          activated: data.activated,
          fnmemberId: data.fnmemberId,
          created: new Date(data.created),
          updated: new Date(data.updated),
        },
        update: {
          barcode: data.barcode,
          activated: data.activated,
          fnmemberId: data.fnmemberId,
          updated: new Date(),
        },
      });
      return { success: true, data: barcode };
    }
    
    case 'UPDATE': {
      const data = barcodeSyncSchema.partial().extend({ id: z.string().cuid() }).parse(item.data);
      const barcode = await prisma.barcode.update({
        where: { id: data.id },
        data: {
          ...(data.barcode && { barcode: data.barcode }),
          ...(data.activated !== undefined && { activated: data.activated }),
          updated: new Date(),
        },
      });
      return { success: true, data: barcode };
    }
    
    case 'DELETE': {
      if (!item.id) return { success: false, error: 'Missing id for DELETE operation' };
      const barcode = await prisma.barcode.delete({ where: { id: item.id } });
      return { success: true, data: barcode };
    }
    
    default:
      return { success: false, error: `Unknown operation: ${item.operation}` };
  }
}

async function processFamilySync(item: SyncItem) {
  switch (item.operation) {
    case 'CREATE':
    case 'UPSERT': {
      const data = familySyncSchema.parse(item.data);
      const family = await prisma.family.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          spouse_fname: data.spouse_fname,
          spouse_lname: data.spouse_lname,
          dependents: data.dependents,
          fnmemberId: data.fnmemberId,
          created: new Date(data.created),
          updated: new Date(data.updated),
        },
        update: {
          spouse_fname: data.spouse_fname,
          spouse_lname: data.spouse_lname,
          dependents: data.dependents,
          fnmemberId: data.fnmemberId,
          updated: new Date(),
        },
      });
      return { success: true, data: family };
    }
    
    case 'UPDATE': {
      const data = familySyncSchema.partial().extend({ id: z.string().cuid() }).parse(item.data);
      const family = await prisma.family.update({
        where: { id: data.id },
        data: {
          ...(data.spouse_fname !== undefined && { spouse_fname: data.spouse_fname }),
          ...(data.spouse_lname !== undefined && { spouse_lname: data.spouse_lname }),
          ...(data.dependents !== undefined && { dependents: data.dependents }),
          updated: new Date(),
        },
      });
      return { success: true, data: family };
    }
    
    case 'DELETE': {
      if (!item.id) return { success: false, error: 'Missing id for DELETE operation' };
      const family = await prisma.family.delete({ where: { id: item.id } });
      return { success: true, data: family };
    }
    
    default:
      return { success: false, error: `Unknown operation: ${item.operation}` };
  }
}

// POST - Process batch sync
export async function POST(request: NextRequest) {
  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'sync/batch:POST', false, { error: authResult.error });
    return apiError(authResult.error!, 401);
  }

  // Rate limiting - more restrictive for batch operations
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`sync-batch:${clientIp}`, 10, 60000);
  if (!rateLimit.allowed) {
    logApiAccess(request, 'sync/batch:POST', false, { error: 'Rate limit exceeded' });
    return apiError('Rate limit exceeded', 429);
  }

  try {
    const body = await request.json();
    const validated = batchSyncRequestSchema.parse(body);

    const results: {
      index: number;
      success: boolean;
      error?: string;
      data?: any;
    }[] = [];

    let processed = 0;
    let failed = 0;

    // Process items sequentially to maintain order and handle dependencies
    for (let i = 0; i < validated.items.length; i++) {
      const item = validated.items[i];
      const result = await processSyncItem(item);
      
      if (result.success) {
        processed++;
      } else {
        failed++;
      }

      results.push({
        index: i,
        success: result.success,
        error: result.error,
        data: result.data,
      });
    }

    logApiAccess(request, 'sync/batch:POST', true, { 
      syncId: validated.syncId,
      processed,
      failed,
      total: validated.items.length 
    });

    return apiSuccess({
      syncId: validated.syncId,
      processed,
      failed,
      total: validated.items.length,
      results: failed > 0 ? results.filter(r => !r.success) : undefined,
    }, `Batch sync completed: ${processed} processed, ${failed} failed`);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logApiAccess(request, 'sync/batch:POST', false, { error: 'Validation error' });
      return apiError('Validation error', 400, error.issues);
    }

    console.error('Batch sync error:', error);
    logApiAccess(request, 'sync/batch:POST', false, { error: error.message });
    return apiError('Internal server error', 500);
  }
}
