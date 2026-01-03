/**
 * Validation schemas for Chief & Council sync operations
 */

import { z } from 'zod';

// Position enum matching Prisma schema
export const positionEnum = z.enum(['CHIEF', 'COUNCILLOR']);

// Portfolio enum matching Prisma schema
export const portfolioEnum = z.enum([
  'TREATY',
  'HEALTH',
  'EDUCATION',
  'HOUSING',
  'ECONOMIC_DEVELOPMENT',
  'ENVIRONMENT',
  'PUBLIC_SAFETY',
  'LEADERSHIP'
]);

// Schema for syncing a council member from master database
export const councilMemberSyncSchema = z.object({
  sourceId: z.string().cuid(),           // The id from master database
  position: positionEnum,
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  portfolios: z.array(portfolioEnum).default([]),  // Array of portfolios
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required'),
  bio: z.string().optional().nullable(),
  image_url: z.string().url('Invalid image URL').optional().nullable(),
  created: z.string().datetime().optional(),  // ISO date string
});

// Schema for updating an existing council member
export const councilMemberUpdateSchema = z.object({
  sourceId: z.string().cuid(),            // Required to identify which member
  position: positionEnum.optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  portfolios: z.array(portfolioEnum).optional(),  // Array of portfolios
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  bio: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

// Schema for deleting a council member
export const councilMemberDeleteSchema = z.object({
  sourceId: z.string().cuid().optional(),
  id: z.string().cuid().optional(),
}).refine(data => data.sourceId || data.id, {
  message: 'Either sourceId or id must be provided',
});

// Batch operation types
export const councilBatchOperationSchema = z.object({
  operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'UPSERT']),
  data: z.record(z.string(), z.any()),
});

// Batch sync schema
export const councilBatchSyncSchema = z.object({
  items: z.array(councilBatchOperationSchema).min(1).max(50),
  syncId: z.string().optional(),  // Optional sync batch ID for tracking
});

// Types
export type CouncilMemberSync = z.infer<typeof councilMemberSyncSchema>;
export type CouncilMemberUpdate = z.infer<typeof councilMemberUpdateSchema>;
export type CouncilMemberDelete = z.infer<typeof councilMemberDeleteSchema>;
export type CouncilBatchSync = z.infer<typeof councilBatchSyncSchema>;
