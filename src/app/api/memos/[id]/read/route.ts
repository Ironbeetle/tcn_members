/**
 * Mark Memo as Read API
 * 
 * Tracks which users have read a memo.
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

const markReadSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// POST - Mark memo as read by user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'memos:id:read:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = markReadSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((e: { message: string }) => e.message).join(', ');
      return apiError(errorMessages, 400);
    }

    const { userId } = validationResult.data;

    // Find the memo
    const memo = await prisma.comm_OfficeMemo.findUnique({
      where: { id },
      select: { id: true, readBy: true }
    });

    if (!memo) {
      return apiError('Memo not found', 404);
    }

    // Parse current readBy array and add user if not already present
    const readBy: string[] = JSON.parse(memo.readBy || '[]');

    if (!readBy.includes(userId)) {
      readBy.push(userId);

      await prisma.comm_OfficeMemo.update({
        where: { id },
        data: { readBy: JSON.stringify(readBy) }
      });

      logApiAccess(request, 'memos:id:read:POST', true, { memoId: id, userId, action: 'marked_read' });
    } else {
      logApiAccess(request, 'memos:id:read:POST', true, { memoId: id, userId, action: 'already_read' });
    }

    return apiSuccess({ marked: true }, 'Memo marked as read');

  } catch (error: any) {
    console.error('Mark memo as read error:', error);
    logApiAccess(request, 'memos:id:read:POST', false, { error: error.message });
    return apiError('Failed to mark memo as read', 500);
  }
}
