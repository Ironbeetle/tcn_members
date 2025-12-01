/**
 * Sync API Validation Schemas
 * Zod schemas for validating sync data from master database
 */

import { z } from 'zod';

// Activation status enum matching Prisma
export const activationStatusSchema = z.enum(['NONE', 'PENDING', 'ACTIVATED']);

// Base fnmember schema for sync (excludes auth - that's portal-only)
export const fnmemberSyncSchema = z.object({
  id: z.string().cuid(),
  created: z.string().datetime().or(z.date()),
  updated: z.string().datetime().or(z.date()),
  birthdate: z.string().datetime().or(z.date()),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  t_number: z.string().min(1),
  activated: activationStatusSchema.optional(),
  deceased: z.string().nullable().optional(),
});

// Profile schema for sync
export const profileSyncSchema = z.object({
  id: z.string().cuid(),
  created: z.string().datetime().or(z.date()),
  updated: z.string().datetime().or(z.date()),
  gender: z.string().nullable().optional(),
  o_r_status: z.string(),
  community: z.string(),
  address: z.string(),
  phone_number: z.string(),
  email: z.string().email(),
  image_url: z.string().nullable().optional(),
  fnmemberId: z.string().cuid().nullable().optional(),
});

// Barcode schema for sync
export const barcodeSyncSchema = z.object({
  id: z.string().cuid(),
  created: z.string().datetime().or(z.date()),
  updated: z.string().datetime().or(z.date()),
  barcode: z.string(),
  activated: z.number().int().default(1),
  fnmemberId: z.string().cuid().nullable().optional(),
});

// Family schema for sync
export const familySyncSchema = z.object({
  id: z.string().cuid(),
  created: z.string().datetime().or(z.date()),
  updated: z.string().datetime().or(z.date()),
  spouse_fname: z.string().nullable().optional(),
  spouse_lname: z.string().nullable().optional(),
  dependents: z.number().int().default(0),
  fnmemberId: z.string().cuid().nullable().optional(),
});

// Full member with relations for sync
export const memberFullSyncSchema = fnmemberSyncSchema.extend({
  profile: z.array(profileSyncSchema).optional(),
  barcode: z.array(barcodeSyncSchema).optional(),
  family: z.array(familySyncSchema).optional(),
});

// Sync operation types
export const syncOperationSchema = z.enum([
  'CREATE',
  'UPDATE',
  'DELETE',
  'UPSERT',
]);

// Single sync item
export const syncItemSchema = z.object({
  operation: syncOperationSchema,
  model: z.enum(['fnmember', 'Profile', 'Barcode', 'Family']),
  data: z.any(), // Will be validated based on model type
  id: z.string().optional(), // For delete operations
});

// Batch sync request
export const batchSyncRequestSchema = z.object({
  syncId: z.string().uuid().optional(), // For tracking/idempotency
  timestamp: z.string().datetime(),
  source: z.string().default('master'),
  items: z.array(syncItemSchema).min(1).max(1000),
});

// Sync response
export const syncResponseSchema = z.object({
  success: z.boolean(),
  syncId: z.string().optional(),
  processed: z.number(),
  failed: z.number(),
  errors: z.array(z.object({
    index: z.number(),
    error: z.string(),
    item: z.any().optional(),
  })).optional(),
});

// Delta sync request (for incremental updates)
export const deltaSyncRequestSchema = z.object({
  since: z.string().datetime(), // Get all changes since this timestamp
  models: z.array(z.enum(['fnmember', 'Profile', 'Barcode', 'Family'])).optional(),
  limit: z.number().int().min(1).max(1000).default(100),
  cursor: z.string().optional(), // For pagination
});

// Single member update from master
export const memberUpdateSchema = z.object({
  id: z.string().cuid(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  birthdate: z.string().datetime().or(z.date()).optional(),
  t_number: z.string().min(1).optional(),
  deceased: z.string().nullable().optional(),
  // Note: activated is NOT included - portal manages its own activation status
});

// New member from master (without auth)
export const newMemberFromMasterSchema = z.object({
  id: z.string().cuid().optional(), // Master can provide ID or let portal generate
  birthdate: z.string().datetime().or(z.date()),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  t_number: z.string().min(1),
  deceased: z.string().nullable().optional(),
  profile: profileSyncSchema.omit({ id: true, created: true, updated: true, fnmemberId: true }).optional(),
  barcode: barcodeSyncSchema.omit({ id: true, created: true, updated: true, fnmemberId: true }).optional(),
  family: familySyncSchema.omit({ id: true, created: true, updated: true, fnmemberId: true }).optional(),
});

// Mark deceased request
export const markDeceasedSchema = z.object({
  memberId: z.string().cuid().optional(),
  t_number: z.string().optional(),
  deceasedDate: z.string(),
}).refine(data => data.memberId || data.t_number, {
  message: 'Either memberId or t_number must be provided',
});

// Schema for PULLING portal-updated data (Profile & Family) - Master pulls FROM portal
export const portalPullRequestSchema = z.object({
  since: z.string().datetime().optional(), // ISO timestamp for delta sync
  models: z.array(z.enum(['Profile', 'Family'])).optional().default(['Profile', 'Family']),
  limit: z.number().min(1).max(500).optional().default(100),
  cursor: z.string().optional(),
});

// Type exports
export type FnmemberSync = z.infer<typeof fnmemberSyncSchema>;
export type ProfileSync = z.infer<typeof profileSyncSchema>;
export type BarcodeSync = z.infer<typeof barcodeSyncSchema>;
export type FamilySync = z.infer<typeof familySyncSchema>;
export type MemberFullSync = z.infer<typeof memberFullSyncSchema>;
export type SyncOperation = z.infer<typeof syncOperationSchema>;
export type SyncItem = z.infer<typeof syncItemSchema>;
export type BatchSyncRequest = z.infer<typeof batchSyncRequestSchema>;
export type SyncResponse = z.infer<typeof syncResponseSchema>;
export type DeltaSyncRequest = z.infer<typeof deltaSyncRequestSchema>;
export type MemberUpdate = z.infer<typeof memberUpdateSchema>;
export type NewMemberFromMaster = z.infer<typeof newMemberFromMasterSchema>;
export type MarkDeceased = z.infer<typeof markDeceasedSchema>;
export type PortalPullRequest = z.infer<typeof portalPullRequestSchema>;
