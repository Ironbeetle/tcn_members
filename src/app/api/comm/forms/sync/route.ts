/**
 * Form Sync API - Sync forms to/from member portal
 * 
 * Endpoint for the Tauri Communications desktop app to sync sign-up forms
 * with the member portal.
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

// GET - Get sync status for forms
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const formId = searchParams.get('formId');

    if (formId) {
      // Get sync status for specific form
      const forms = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          "portalFormId",
          title,
          "syncedAt",
          "updatedAt"
        FROM msgmanager."SignUpForm"
        WHERE id = ${formId}
      `;

      if (forms.length === 0) {
        return apiError('Form not found', 404);
      }

      const form = forms[0];

      return apiSuccess({
        formId: form.id,
        portalFormId: form.portalFormId,
        title: form.title,
        syncedAt: form.syncedAt,
        updatedAt: form.updatedAt,
        needsSync: !form.syncedAt || new Date(form.updatedAt) > new Date(form.syncedAt),
      });
    }

    // Get sync status for all forms
    const forms = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        "portalFormId",
        title,
        "syncedAt",
        "updatedAt",
        "isActive"
      FROM msgmanager."SignUpForm"
      ORDER BY "updatedAt" DESC
    `;

    return apiSuccess({
      forms: forms.map(f => ({
        formId: f.id,
        portalFormId: f.portalFormId,
        title: f.title,
        isActive: f.isActive,
        syncedAt: f.syncedAt,
        updatedAt: f.updatedAt,
        needsSync: !f.syncedAt || new Date(f.updatedAt) > new Date(f.syncedAt),
      })),
      count: forms.length,
      pendingSync: forms.filter(f => !f.syncedAt || new Date(f.updatedAt) > new Date(f.syncedAt)).length,
    });

  } catch (error: any) {
    console.error('Form sync status error:', error);
    return apiError('Failed to get sync status', 500);
  }
}

// POST - Sync a form to the member portal
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    const { formId, portalFormId } = body;

    if (!formId) {
      return apiError('formId is required', 400);
    }

    // Get form with fields
    const forms = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        "portalFormId",
        title,
        description,
        deadline,
        "maxEntries",
        "isActive",
        "createdBy"
      FROM msgmanager."SignUpForm"
      WHERE id = ${formId}
    `;

    if (forms.length === 0) {
      return apiError('Form not found', 404);
    }

    const form = forms[0];

    // Get fields
    const fields = await prisma.$queryRaw<any[]>`
      SELECT "fieldId", label, "fieldType", options, placeholder, required, "order"
      FROM msgmanager."FormField"
      WHERE "formId" = ${formId}
      ORDER BY "order"
    `;

    // Prepare sync payload for portal
    const syncPayload = {
      formId: form.id,
      title: form.title,
      description: form.description,
      deadline: form.deadline,
      maxEntries: form.maxEntries,
      isActive: form.isActive,
      createdBy: form.createdBy,
      fields: fields.map(f => ({
        fieldId: f.fieldId,
        label: f.label,
        fieldType: f.fieldType,
        options: f.options,
        placeholder: f.placeholder,
        required: f.required,
        order: f.order,
      })),
    };

    // Sync to portal via internal API (portal's /api/signup-forms endpoint)
    // This would typically be an HTTP call to the portal's API
    // For now, we'll sync directly to the tcnbulletin schema since we're on the same server

    const existingPortalForm = form.portalFormId ? 
      await prisma.$queryRaw<any[]>`
        SELECT id FROM tcnbulletin.signup_form WHERE tcn_form_id = ${form.id}
      ` : [];

    if (existingPortalForm.length > 0) {
      // Update existing portal form
      await prisma.$executeRaw`
        UPDATE tcnbulletin.signup_form
        SET 
          title = ${form.title},
          description = ${form.description},
          deadline = ${form.deadline},
          max_entries = ${form.maxEntries},
          is_active = ${form.isActive},
          created_by = ${form.createdBy},
          fields = ${JSON.stringify(syncPayload.fields)}::jsonb,
          updated = NOW()
        WHERE tcn_form_id = ${form.id}
      `;
    } else {
      // Create new portal form
      await prisma.$executeRaw`
        INSERT INTO tcnbulletin.signup_form (
          id, tcn_form_id, title, description, deadline, max_entries, is_active, created_by, fields, created, updated
        )
        VALUES (
          gen_random_uuid()::text,
          ${form.id},
          ${form.title},
          ${form.description},
          ${form.deadline},
          ${form.maxEntries},
          ${form.isActive},
          ${form.createdBy},
          ${JSON.stringify(syncPayload.fields)}::jsonb,
          NOW(),
          NOW()
        )
      `;
    }

    // Get portal form ID
    const portalForms = await prisma.$queryRaw<any[]>`
      SELECT id FROM tcnbulletin.signup_form WHERE tcn_form_id = ${form.id}
    `;

    const newPortalFormId = portalForms[0]?.id;

    // Update sync timestamp and portal form ID
    await prisma.$executeRaw`
      UPDATE msgmanager."SignUpForm"
      SET "syncedAt" = NOW(), "portalFormId" = ${newPortalFormId}
      WHERE id = ${formId}
    `;

    logApiAccess(request, 'comm:forms:sync:POST', true, { 
      formId, 
      portalFormId: newPortalFormId,
    });

    return apiSuccess({
      formId,
      portalFormId: newPortalFormId,
      syncedAt: new Date().toISOString(),
    }, 'Form synced to portal successfully');

  } catch (error: any) {
    console.error('Form sync error:', error);
    return apiError('Failed to sync form', 500);
  }
}
