/**
 * Forms API - Manage sign-up forms
 * 
 * Endpoint for the Tauri Communications desktop app to create and manage
 * sign-up forms that sync to the member portal.
 * Uses API key authentication only (no user auth).
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
  options: z.string().optional(), // JSON string for select options
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number(),
});

// Form schema
const formSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  maxEntries: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  createdBy: z.string().optional(), // Staff user ID
  fields: z.array(formFieldSchema).min(1),
});

// GET - List all forms
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:forms:GET', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Query forms from msgmanager schema
    const whereClause = includeInactive ? '' : 'WHERE "isActive" = true';

    const forms = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        f.id,
        f."portalFormId",
        f.title,
        f.description,
        f.deadline,
        f."maxEntries",
        f."isActive",
        f."createdBy",
        f."createdAt",
        f."updatedAt",
        f."syncedAt",
        (SELECT COUNT(*) FROM msgmanager."FormSubmission" s WHERE s."formId" = f.id) as submission_count
      FROM msgmanager."SignUpForm" f
      ${whereClause}
      ORDER BY f."createdAt" DESC
    `);

    // Get fields for each form
    const formsWithFields = await Promise.all(forms.map(async (form) => {
      const fields = await prisma.$queryRaw<any[]>`
        SELECT id, "fieldId", label, "fieldType", options, placeholder, required, "order"
        FROM msgmanager."FormField"
        WHERE "formId" = ${form.id}
        ORDER BY "order"
      `;

      return {
        id: form.id,
        portalFormId: form.portalFormId,
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        maxEntries: form.maxEntries,
        isActive: form.isActive,
        createdBy: form.createdBy,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
        syncedAt: form.syncedAt,
        submissionCount: Number(form.submission_count),
        fields: fields.map(f => ({
          id: f.id,
          fieldId: f.fieldId,
          label: f.label,
          fieldType: f.fieldType,
          options: f.options ? JSON.parse(f.options) : null,
          placeholder: f.placeholder,
          required: f.required,
          order: f.order,
        })),
      };
    }));

    logApiAccess(request, 'comm:forms:GET', true, { count: forms.length });

    return apiSuccess({
      forms: formsWithFields,
      count: forms.length,
    });

  } catch (error: any) {
    console.error('Forms list error:', error);
    logApiAccess(request, 'comm:forms:GET', false, { error: error.message });
    return apiError('Failed to fetch forms', 500);
  }
}

// POST - Create new form
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = formSchema.safeParse(body);
    if (!validation.success) {
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { title, description, deadline, maxEntries, isActive, createdBy, fields } = validation.data;

    // Create form
    const formResult = await prisma.$queryRaw<any[]>`
      INSERT INTO msgmanager."SignUpForm" (
        id, title, description, deadline, "maxEntries", "isActive", "createdBy", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${title},
        ${description || null},
        ${deadline ? new Date(deadline) : null},
        ${maxEntries || null},
        ${isActive},
        ${createdBy || 'api-user'},
        NOW(),
        NOW()
      )
      RETURNING id, title, "createdAt"
    `;

    const form = formResult[0];

    // Create fields
    for (const field of fields) {
      await prisma.$executeRaw`
        INSERT INTO msgmanager."FormField" (
          id, "formId", "fieldId", label, "fieldType", options, placeholder, required, "order"
        )
        VALUES (
          gen_random_uuid()::text,
          ${form.id},
          ${field.fieldId || null},
          ${field.label},
          ${field.fieldType}::"msgmanager"."FieldType",
          ${field.options || null},
          ${field.placeholder || null},
          ${field.required},
          ${field.order}
        )
      `;
    }

    logApiAccess(request, 'comm:forms:POST', true, { formId: form.id });

    return apiSuccess({
      id: form.id,
      title: form.title,
      createdAt: form.createdAt,
      fieldsCount: fields.length,
    }, 'Form created successfully');

  } catch (error: any) {
    console.error('Form creation error:', error);
    return apiError('Failed to create form', 500);
  }
}
