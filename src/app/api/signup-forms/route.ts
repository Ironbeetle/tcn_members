'use server'

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Valid categories that match the FormCategory enum in Prisma schema
const VALID_CATEGORIES = [
  // Legacy values
  'GENERAL', 'HEALTH', 'EDUCATION', 'HOUSING', 'EMPLOYMENT', 
  'SOCIAL_SERVICES', 'CHIEFNCOUNCIL', 'PROGRAM_EVENTS', 'ANNOUNCEMENTS',
  // TCN_COMM desktop app values
  'BAND_OFFICE', 'J_W_HEALTH_CENTER', 'CSCMEC', 'COUNCIL', 
  'RECREATION', 'UTILITIES', 'TRSC'
] as const;

type FormCategory = typeof VALID_CATEGORIES[number];

// Map legacy/alternative category names to valid enum values
function normalizeCategory(category: string | undefined | null): FormCategory {
  if (!category) return 'GENERAL';
  
  const upperCategory = category.toUpperCase().trim();
  
  // Check if it's already a valid category
  if (VALID_CATEGORIES.includes(upperCategory as FormCategory)) {
    return upperCategory as FormCategory;
  }
  
  // Map alternative names to valid categories
  const categoryMap: Record<string, FormCategory> = {
    'CHIEF_AND_COUNCIL': 'COUNCIL',
    'CHIEF_N_COUNCIL': 'CHIEFNCOUNCIL',
    'BAND OFFICE': 'BAND_OFFICE',
    'HEALTH CENTER': 'J_W_HEALTH_CENTER',
    'HEALTH_CENTER': 'J_W_HEALTH_CENTER',
    'JW_HEALTH_CENTER': 'J_W_HEALTH_CENTER',
    'LAND_USE_PROGRAMS': 'TRSC',
    'LAND USE PROGRAMS': 'TRSC',
  };
  
  return categoryMap[upperCategory] || 'GENERAL';
}

// Validate API key
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validKeys = process.env.API_KEYS?.split(',') || [];
  return apiKey !== null && validKeys.includes(apiKey);
}

// POST - Receive form from TCN_COMM
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.formId || !body.title || !body.fields) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: formId, title, fields' },
        { status: 400 }
      );
    }

    // Normalize the category to a valid enum value
    const normalizedCategory = normalizeCategory(body.category);
    
    // Log sync attempt for debugging
    console.log(`[SignupForm Sync] Received form: ${body.formId}, title: "${body.title}", category: "${body.category}" -> "${normalizedCategory}"`);

    // Upsert the form (create or update)
    const form = await prisma.signup_form.upsert({
      where: { tcn_form_id: body.formId },
      update: {
        title: body.title,
        description: body.description || null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        max_entries: body.maxEntries || null,
        is_active: body.isActive ?? true,
        category: normalizedCategory,
        created_by: body.createdBy || null,
        fields: body.fields,
        allow_resubmit: body.allowResubmit ?? false,
        resubmit_message: body.resubmitMessage || null,
        updated: new Date(),
      },
      create: {
        tcn_form_id: body.formId,
        title: body.title,
        description: body.description || null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        max_entries: body.maxEntries || null,
        is_active: body.isActive ?? true,
        category: normalizedCategory,
        created_by: body.createdBy || null,
        fields: body.fields,
        allow_resubmit: body.allowResubmit ?? false,
        resubmit_message: body.resubmitMessage || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Form synced successfully',
      portalFormId: form.id,
    });
  } catch (error: any) {
    console.error('Error syncing signup form:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List active signup forms
export async function GET(request: NextRequest) {
  try {
    // Validate API key for external requests
    const apiKey = request.headers.get('x-api-key');
    const isInternal = !apiKey; // Internal requests from the app won't have API key

    if (!isInternal && !validateApiKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const forms = await prisma.signup_form.findMany({
      where: includeInactive ? {} : { 
        is_active: true,
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } }
        ]
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { created: 'desc' },
    });

    return NextResponse.json({
      success: true,
      forms: forms.map((form: typeof forms[number]) => ({
        ...form,
        submissionCount: form._count.submissions,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching signup forms:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
