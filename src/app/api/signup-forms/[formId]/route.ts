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

// GET - Get single form by tcn_form_id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: formId },
      include: {
        _count: {
          select: { submissions: true }
        }
      },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      form: {
        ...form,
        submissionCount: form._count.submissions,
      },
    });
  } catch (error: any) {
    console.error('Error fetching signup form:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update form from TCN_COMM
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { formId } = await params;
    const body = await request.json();

    // Check if form exists
    const existingForm = await prisma.signup_form.findUnique({
      where: { tcn_form_id: formId },
    });

    if (!existingForm) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = { updated: new Date() };
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.maxEntries !== undefined) updateData.max_entries = body.maxEntries;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.category !== undefined) updateData.category = normalizeCategory(body.category);
    if (body.createdBy !== undefined) updateData.created_by = body.createdBy;
    if (body.fields !== undefined) updateData.fields = body.fields;
    if (body.allowResubmit !== undefined) updateData.allow_resubmit = body.allowResubmit;
    if (body.resubmitMessage !== undefined) updateData.resubmit_message = body.resubmitMessage;

    // Log update for debugging
    console.log(`[SignupForm Update] Updating form: ${formId}, changes:`, Object.keys(updateData).filter(k => k !== 'updated'));

    const form = await prisma.signup_form.update({
      where: { tcn_form_id: formId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Form updated successfully',
      form,
    });
  } catch (error: any) {
    console.error('Error updating signup form:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete form from TCN_COMM
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { formId } = await params;

    // Check if form exists
    const existingForm = await prisma.signup_form.findUnique({
      where: { tcn_form_id: formId },
    });

    if (!existingForm) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Delete the form (cascades to submissions)
    await prisma.signup_form.delete({
      where: { tcn_form_id: formId },
    });

    return NextResponse.json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting signup form:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
