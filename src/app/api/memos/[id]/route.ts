/**
 * Inter-Office Memo by ID API - Get, Update, Delete individual memos
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  validateApiKey, 
  apiSuccess, 
  apiError, 
  logApiAccess 
} from '@/lib/api-auth';
import { z } from 'zod';

const updateMemoSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  department: z.string().nullable().optional(),
  isPinned: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  expiryDate: z.string().datetime().nullable().optional(),
});

// GET - Get single memo by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'memos:id:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    const memo = await prisma.comm_OfficeMemo.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            department: true,
          }
        }
      }
    });

    if (!memo) {
      return apiError('Memo not found', 404);
    }

    logApiAccess(request, 'memos:id:GET', true, { memoId: id });

    return apiSuccess({
      ...memo,
      readBy: JSON.parse(memo.readBy || '[]')
    });

  } catch (error: any) {
    console.error('Get memo error:', error);
    logApiAccess(request, 'memos:id:GET', false, { error: error.message });
    return apiError('Failed to fetch memo', 500);
  }
}

// PUT - Update memo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'memos:id:PUT', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check if memo exists
    const existing = await prisma.comm_OfficeMemo.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      return apiError('Memo not found', 404);
    }

    // Validate update data
    const validationResult = updateMemoSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((e: { message: string }) => e.message).join(', ');
      return apiError(errorMessages, 400);
    }

    const updates = validationResult.data;

    // Build update data - only include fields that were provided
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.isPinned !== undefined) updateData.isPinned = updates.isPinned;
    if (updates.isPublished !== undefined) updateData.isPublished = updates.isPublished;
    if (updates.expiryDate !== undefined) {
      updateData.expiryDate = updates.expiryDate ? new Date(updates.expiryDate) : null;
    }

    const memo = await prisma.comm_OfficeMemo.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            department: true,
          }
        }
      }
    });

    logApiAccess(request, 'memos:id:PUT', true, { memoId: id });

    return apiSuccess({
      ...memo,
      readBy: JSON.parse(memo.readBy || '[]')
    }, 'Memo updated successfully');

  } catch (error: any) {
    console.error('Update memo error:', error);
    logApiAccess(request, 'memos:id:PUT', false, { error: error.message });
    return apiError('Failed to update memo', 500);
  }
}

// DELETE - Delete memo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'memos:id:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check if memo exists
    const existing = await prisma.comm_OfficeMemo.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      return apiError('Memo not found', 404);
    }

    await prisma.comm_OfficeMemo.delete({
      where: { id }
    });

    logApiAccess(request, 'memos:id:DELETE', true, { memoId: id });

    return apiSuccess({ deleted: true }, 'Memo deleted successfully');

  } catch (error: any) {
    console.error('Delete memo error:', error);
    logApiAccess(request, 'memos:id:DELETE', false, { error: error.message });
    return apiError('Failed to delete memo', 500);
  }
}
