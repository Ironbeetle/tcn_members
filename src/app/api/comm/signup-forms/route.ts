/**
 * Sign-Up Forms API - Manage sign-up forms from the communications app
 * 
 * Endpoint for the TCN Communications desktop app to create and manage
 * sign-up forms that are displayed on the member portal.
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

// Form field schema
const formFieldSchema = z.object({
  fieldId: z.string().optional(),
  label: z.string().min(1),
  fieldType: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'DATE', 'NUMBER', 'EMAIL', 'PHONE']),
  options: z.array(z.string()).nullable().optional(),
  placeholder: z.string().nullable().optional(),
  required: z.boolean().default(false),
  order: z.number().default(0),
});

// Form schema
const formSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  category: z.enum(['BAND_OFFICE', 'J_W_HEALTH_CENTER', 'CSCMEC', 'COUNCIL', 'RECREATION', 'UTILITIES', 'TRSC']).default('BAND_OFFICE'),
  deadline: z.string().datetime().nullable().optional(),
  maxEntries: z.number().positive().nullable().optional(),
  isActive: z.boolean().default(true),
  allowResubmit: z.boolean().default(false),
  resubmitMessage: z.string().nullable().optional(),
  createdBy: z.string(), // Staff user ID
  fields: z.array(formFieldSchema).min(1),
});

// GET - List all forms
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const category = searchParams.get('category');

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    if (category) {
      where.category = category;
    }

    const forms = await prisma.comm_SignUpForm.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    const formsWithCount = forms.map(form => ({
      ...form,
      submissionCount: form._count.submissions,
      _count: undefined,
    }));

    logApiAccess(request, 'comm:signup-forms:GET', true, { count: forms.length });

    return apiSuccess({
      forms: formsWithCount,
      count: forms.length,
    });

  } catch (error: any) {
    console.error('Sign-up forms list error:', error);
    logApiAccess(request, 'comm:signup-forms:GET', false, { error: error.message });
    return apiError('Failed to fetch sign-up forms', 500);
  }
}

// POST - Create new form
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:signup-forms:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = formSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { 
      title, 
      description, 
      category, 
      deadline, 
      maxEntries, 
      isActive, 
      allowResubmit, 
      resubmitMessage, 
      createdBy, 
      fields 
    } = validation.data;

    // Create form with fields
    const form = await prisma.comm_SignUpForm.create({
      data: {
        title,
        description: description || null,
        category,
        deadline: deadline ? new Date(deadline) : null,
        maxEntries: maxEntries || null,
        isActive,
        allowResubmit,
        resubmitMessage: resubmitMessage || null,
        createdBy,
        fields: {
          create: fields.map((field, index) => ({
            fieldId: field.fieldId || `field_${index}`,
            label: field.label,
            fieldType: field.fieldType,
            options: field.options ? JSON.stringify(field.options) : null,
            placeholder: field.placeholder || null,
            required: field.required,
            order: field.order ?? index,
          }))
        }
      },
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

    // Also sync to the portal's signup_form table (tcnbulletin schema)
    // Map comm_FormCategory to FormCategory
    const categoryMap: Record<string, string> = {
      'BAND_OFFICE': 'BAND_OFFICE',
      'J_W_HEALTH_CENTER': 'J_W_HEALTH_CENTER',
      'CSCMEC': 'CSCMEC',
      'COUNCIL': 'COUNCIL',
      'RECREATION': 'RECREATION',
      'UTILITIES': 'UTILITIES',
      'TRSC': 'TRSC',
    };

    await prisma.signup_form.create({
      data: {
        tcn_form_id: form.id,
        title,
        description: description || null,
        deadline: deadline ? new Date(deadline) : null,
        max_entries: maxEntries || null,
        is_active: isActive,
        category: categoryMap[category] as any,
        created_by: createdBy,
        fields: fields.map((field, index) => ({
          fieldId: field.fieldId || `field_${index}`,
          label: field.label,
          fieldType: field.fieldType,
          options: field.options || null,
          placeholder: field.placeholder || null,
          required: field.required,
          order: field.order ?? index,
        })),
        allow_resubmit: allowResubmit,
        resubmit_message: resubmitMessage || null,
      }
    });

    logApiAccess(request, 'comm:signup-forms:POST', true, { formId: form.id });

    return apiSuccess(form, 'Sign-up form created');

  } catch (error: any) {
    console.error('Sign-up form create error:', error);
    logApiAccess(request, 'comm:signup-forms:POST', false, { error: error.message });
    return apiError('Failed to create sign-up form', 500);
  }
}
