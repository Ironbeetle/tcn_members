/**
 * Sign-Up Form by ID API - Get, Update, Delete individual forms
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

// Form field schema for updates
const formFieldSchema = z.object({
  fieldId: z.string().optional(),
  label: z.string().min(1),
  fieldType: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'DATE', 'NUMBER', 'EMAIL', 'PHONE']),
  options: z.array(z.string()).nullable().optional(),
  placeholder: z.string().nullable().optional(),
  required: z.boolean().default(false),
  order: z.number().default(0),
});

// Update form schema
const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  category: z.enum(['BAND_OFFICE', 'J_W_HEALTH_CENTER', 'CSCMEC', 'COUNCIL', 'RECREATION', 'UTILITIES', 'TRSC']).optional(),
  deadline: z.string().datetime().nullable().optional(),
  maxEntries: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  allowResubmit: z.boolean().optional(),
  resubmitMessage: z.string().nullable().optional(),
  fields: z.array(formFieldSchema).optional(),
});

// GET - Get single form with fields and submissions count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:id:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    const form = await prisma.comm_SignUpForm.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            department: true,
          }
        },
        _count: {
          select: { submissions: true }
        }
      }
    });

    if (!form) {
      return apiError('Form not found', 404);
    }

    logApiAccess(request, 'comm:signup-forms:id:GET', true, { formId: id });

    return apiSuccess({
      ...form,
      submissionCount: form._count.submissions,
      _count: undefined,
    });

  } catch (error: any) {
    console.error('Sign-up form get error:', error);
    logApiAccess(request, 'comm:signup-forms:id:GET', false, { error: error.message });
    return apiError('Failed to fetch sign-up form', 500);
  }
}

// PUT - Update form (replaces fields)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:id:PUT', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = updateFormSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { fields, ...updateData } = validation.data;

    // Prepare update data
    const data: any = {};
    if (updateData.title !== undefined) data.title = updateData.title;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.category !== undefined) data.category = updateData.category;
    if (updateData.deadline !== undefined) data.deadline = updateData.deadline ? new Date(updateData.deadline) : null;
    if (updateData.maxEntries !== undefined) data.maxEntries = updateData.maxEntries;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if (updateData.allowResubmit !== undefined) data.allowResubmit = updateData.allowResubmit;
    if (updateData.resubmitMessage !== undefined) data.resubmitMessage = updateData.resubmitMessage;

    // Update form
    const form = await prisma.comm_SignUpForm.update({
      where: { id },
      data,
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            department: true,
          }
        },
      }
    });

    // If fields provided, replace all fields
    if (fields && fields.length > 0) {
      // Delete existing fields
      await prisma.comm_FormField.deleteMany({
        where: { formId: id }
      });

      // Create new fields
      await prisma.comm_FormField.createMany({
        data: fields.map((field, index) => ({
          formId: id,
          fieldId: field.fieldId || `field_${index}`,
          label: field.label,
          fieldType: field.fieldType,
          options: field.options ? JSON.stringify(field.options) : null,
          placeholder: field.placeholder || null,
          required: field.required,
          order: field.order ?? index,
        }))
      });
    }

    // Also update the portal's signup_form table
    const categoryMap: Record<string, string> = {
      'BAND_OFFICE': 'BAND_OFFICE',
      'J_W_HEALTH_CENTER': 'J_W_HEALTH_CENTER',
      'CSCMEC': 'CSCMEC',
      'COUNCIL': 'COUNCIL',
      'RECREATION': 'RECREATION',
      'UTILITIES': 'UTILITIES',
      'TRSC': 'TRSC',
    };

    const portalUpdateData: any = { updated: new Date() };
    if (updateData.title !== undefined) portalUpdateData.title = updateData.title;
    if (updateData.description !== undefined) portalUpdateData.description = updateData.description;
    if (updateData.category !== undefined) portalUpdateData.category = categoryMap[updateData.category];
    if (updateData.deadline !== undefined) portalUpdateData.deadline = updateData.deadline ? new Date(updateData.deadline) : null;
    if (updateData.maxEntries !== undefined) portalUpdateData.max_entries = updateData.maxEntries;
    if (updateData.isActive !== undefined) portalUpdateData.is_active = updateData.isActive;
    if (updateData.allowResubmit !== undefined) portalUpdateData.allow_resubmit = updateData.allowResubmit;
    if (updateData.resubmitMessage !== undefined) portalUpdateData.resubmit_message = updateData.resubmitMessage;
    if (fields) {
      portalUpdateData.fields = fields.map((field, index) => ({
        fieldId: field.fieldId || `field_${index}`,
        label: field.label,
        fieldType: field.fieldType,
        options: field.options || null,
        placeholder: field.placeholder || null,
        required: field.required,
        order: field.order ?? index,
      }));
    }

    await prisma.signup_form.updateMany({
      where: { tcn_form_id: id },
      data: portalUpdateData,
    });

    // Fetch updated form with new fields
    const updatedForm = await prisma.comm_SignUpForm.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            department: true,
          }
        },
      }
    });

    logApiAccess(request, 'comm:signup-forms:id:PUT', true, { formId: id });

    return apiSuccess(updatedForm, 'Sign-up form updated');

  } catch (error: any) {
    console.error('Sign-up form update error:', error);
    logApiAccess(request, 'comm:signup-forms:id:PUT', false, { error: error.message });
    return apiError('Failed to update sign-up form', 500);
  }
}

// DELETE - Delete form (cascades to fields and submissions)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:id:DELETE', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Delete from comm_SignUpForm (cascade deletes fields and submissions)
    await prisma.comm_SignUpForm.delete({
      where: { id }
    });

    // Also delete from portal's signup_form table
    await prisma.signup_form.deleteMany({
      where: { tcn_form_id: id }
    });

    logApiAccess(request, 'comm:signup-forms:id:DELETE', true, { formId: id });

    return apiSuccess({ deleted: true }, 'Sign-up form deleted');

  } catch (error: any) {
    console.error('Sign-up form delete error:', error);
    logApiAccess(request, 'comm:signup-forms:id:DELETE', false, { error: error.message });
    return apiError('Failed to delete sign-up form', 500);
  }
}
