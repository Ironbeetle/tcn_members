/**
 * Bulletin Sync Validation Schemas
 * Zod schemas for validating bulletin data from messaging app
 */

import { z } from 'zod';

// Categories enum matching Prisma
export const categoriesSchema = z.enum([
  'CHIEFNCOUNCIL',
  'HEALTH',
  'EDUCATION',
  'RECREATION',
  'EMPLOYMENT',
  'PROGRAM_EVENTS',
  'ANNOUNCEMENTS',
]);

// Bulletin sync schema - for receiving bulletins from messaging app
export const bulletinSyncSchema = z.object({
  sourceId: z.string().cuid(),           // The BulletinApiLog.id from messaging app
  title: z.string().min(1),
  subject: z.string().min(1),
  poster_url: z.string().min(1),          // URL/path where poster will be saved
  category: categoriesSchema.default('CHIEFNCOUNCIL'),
  userId: z.string().optional(),          // User who created it in messaging app
  created: z.string().datetime().or(z.date()).optional(),
  updated: z.string().datetime().or(z.date()).optional(),
});

// For updating existing bulletins
export const bulletinUpdateSchema = z.object({
  sourceId: z.string().cuid(),            // Required to identify which bulletin
  title: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  poster_url: z.string().min(1).optional(),
  category: categoriesSchema.optional(),
});

// For deleting bulletins
export const bulletinDeleteSchema = z.object({
  sourceId: z.string().cuid().optional(),
  id: z.string().cuid().optional(),
}).refine(data => data.sourceId || data.id, {
  message: 'Either sourceId or id must be provided',
});

// Batch bulletin sync
export const bulletinBatchSyncSchema = z.object({
  syncId: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
  source: z.string().default('messaging'),
  items: z.array(z.object({
    operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'UPSERT']),
    data: z.any(),
  })).min(1).max(100),
});

// Poster upload metadata
export const posterUploadSchema = z.object({
  sourceId: z.string().cuid(),            // BulletinApiLog.id this poster belongs to
  filename: z.string().min(1),            // Original filename
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/i, {
    message: 'Only image files (jpeg, png, gif, webp) are allowed',
  }),
});

// Type exports
export type Categories = z.infer<typeof categoriesSchema>;
export type BulletinSync = z.infer<typeof bulletinSyncSchema>;
export type BulletinUpdate = z.infer<typeof bulletinUpdateSchema>;
export type BulletinDelete = z.infer<typeof bulletinDeleteSchema>;
export type BulletinBatchSync = z.infer<typeof bulletinBatchSyncSchema>;
export type PosterUpload = z.infer<typeof posterUploadSchema>;
