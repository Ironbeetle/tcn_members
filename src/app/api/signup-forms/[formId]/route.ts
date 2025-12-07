'use server'

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    if (body.category !== undefined) updateData.category = body.category;
    if (body.createdBy !== undefined) updateData.created_by = body.createdBy;
    if (body.fields !== undefined) updateData.fields = body.fields;

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
