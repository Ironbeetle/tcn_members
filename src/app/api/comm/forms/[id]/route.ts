/**
 * Form by ID API - Get, update, delete specific form
 * 
 * Endpoint for the Tauri Communications desktop app to manage individual forms.
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Form field schema for updates
const formFieldSchema = z.object({
  id: z.string().optional(), // Existing field ID for updates
  fieldId: z.string().optional(),
  label: z.string().min(1),
  fieldType: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'DATE', 'NUMBER', 'EMAIL', 'PHONE']),
  options: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number(),
});

// GET - Get specific form with fields
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    const forms = await prisma.$queryRaw<any[]>`
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
        f."syncedAt"
      FROM msgmanager."SignUpForm" f
      WHERE f.id = ${id}
    `;

    if (forms.length === 0) {
      return apiError('Form not found', 404);
    }

    const form = forms[0];

    // Get fields
    const fields = await prisma.$queryRaw<any[]>`
      SELECT id, "fieldId", label, "fieldType", options, placeholder, required, "order"
      FROM msgmanager."FormField"
      WHERE "formId" = ${id}
      ORDER BY "order"
    `;

    // Get submission count
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM msgmanager."FormSubmission" WHERE "formId" = ${id}
    `;

    return apiSuccess({
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
      submissionCount: Number(countResult[0]?.count || 0),
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
    });

  } catch (error: any) {
    console.error('Form fetch error:', error);
    return apiError('Failed to fetch form', 500);
  }
}

// PATCH - Update form
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, deadline, maxEntries, isActive, fields } = body;

    // Check form exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM msgmanager."SignUpForm" WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return apiError('Form not found', 404);
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push(`title = $${values.length + 1}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${values.length + 1}`);
      values.push(description);
    }

    if (deadline !== undefined) {
      updates.push(`deadline = $${values.length + 1}`);
      values.push(deadline ? new Date(deadline) : null);
    }

    if (maxEntries !== undefined) {
      updates.push(`"maxEntries" = $${values.length + 1}`);
      values.push(maxEntries);
    }

    if (isActive !== undefined) {
      updates.push(`"isActive" = $${values.length + 1}`);
      values.push(isActive);
    }

    if (updates.length > 0) {
      updates.push(`"updatedAt" = NOW()`);
      values.push(id);

      await prisma.$queryRawUnsafe(`
        UPDATE msgmanager."SignUpForm"
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
      `, ...values);
    }

    // Update fields if provided
    if (fields && Array.isArray(fields)) {
      // Delete existing fields and recreate
      await prisma.$executeRaw`
        DELETE FROM msgmanager."FormField" WHERE "formId" = ${id}
      `;

      for (const field of fields) {
        const validatedField = formFieldSchema.parse(field);
        await prisma.$executeRaw`
          INSERT INTO msgmanager."FormField" (
            id, "formId", "fieldId", label, "fieldType", options, placeholder, required, "order"
          )
          VALUES (
            gen_random_uuid()::text,
            ${id},
            ${validatedField.fieldId || null},
            ${validatedField.label},
            ${validatedField.fieldType}::"msgmanager"."FieldType",
            ${validatedField.options || null},
            ${validatedField.placeholder || null},
            ${validatedField.required},
            ${validatedField.order}
          )
        `;
      }
    }

    logApiAccess(request, 'comm:forms:PATCH', true, { formId: id });

    return apiSuccess({ id }, 'Form updated successfully');

  } catch (error: any) {
    console.error('Form update error:', error);
    return apiError('Failed to update form', 500);
  }
}

// DELETE - Delete form
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const { id } = await params;

    // Check form exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id, title FROM msgmanager."SignUpForm" WHERE id = ${id}
    `;

    if (existing.length === 0) {
      return apiError('Form not found', 404);
    }

    // Delete form (cascades to fields and submissions)
    await prisma.$executeRaw`
      DELETE FROM msgmanager."SignUpForm" WHERE id = ${id}
    `;

    logApiAccess(request, 'comm:forms:DELETE', true, { formId: id, title: existing[0].title });

    return apiSuccess({ id }, 'Form deleted successfully');

  } catch (error: any) {
    console.error('Form delete error:', error);
    return apiError('Failed to delete form', 500);
  }
}
