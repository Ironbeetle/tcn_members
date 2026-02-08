/**
 * Inter-Office Memos API - List and Create memos
 * 
 * Endpoint for the TCN Communications desktop app to manage inter-office memos.
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

const createMemoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  priority: z.enum(['low', 'medium', 'high']).default('low'),
  department: z.string().nullable().optional(),
  isPinned: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  expiryDate: z.string().datetime().nullable().optional(),
  authorId: z.string().min(1, 'Author ID is required'),
});

// GET - Get all memos (with optional department filter)
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'memos:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');

    // Build where clause
    const baseWhere: any = {
      isPublished: true,
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    };

    // If department specified, get memos for that dept OR all-department memos
    if (department) {
      baseWhere.AND = {
        OR: [
          { department: department },
          { department: null }
        ]
      };
    }

    const memos = await prisma.comm_OfficeMemo.findMany({
      where: baseWhere,
      include: {
        author: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            department: true,
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { created: 'desc' }
      ]
    });

    // Parse readBy JSON for each memo
    const memosWithParsedReadBy = memos.map((memo: any) => ({
      ...memo,
      readBy: JSON.parse(memo.readBy || '[]')
    }));

    logApiAccess(request, 'memos:GET', true, { count: memos.length });

    return apiSuccess(memosWithParsedReadBy);

  } catch (error: any) {
    console.error('Get memos error:', error);
    logApiAccess(request, 'memos:GET', false, { error: error.message });
    return apiError('Failed to fetch memos', 500);
  }
}

// POST - Create new memo
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'memos:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createMemoSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map((e: { message: string }) => e.message).join(', ');
      return apiError(errorMessages, 400);
    }

    const { 
      title, 
      content, 
      priority, 
      department, 
      isPinned, 
      isPublished, 
      expiryDate, 
      authorId 
    } = validationResult.data;

    // Verify author exists
    const author = await prisma.comm_User.findUnique({
      where: { id: authorId },
      select: { id: true }
    });

    if (!author) {
      return apiError('Author not found', 404);
    }

    const memo = await prisma.comm_OfficeMemo.create({
      data: {
        title,
        content,
        priority: priority || 'low',
        department: department || null,
        isPinned: isPinned || false,
        isPublished: isPublished !== false,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        authorId,
        readBy: '[]'
      },
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

    logApiAccess(request, 'memos:POST', true, { memoId: memo.id });

    return apiSuccess({
      ...memo,
      readBy: []
    }, 'Memo created successfully');

  } catch (error: any) {
    console.error('Create memo error:', error);
    logApiAccess(request, 'memos:POST', false, { error: error.message });
    return apiError('Failed to create memo', 500);
  }
}
