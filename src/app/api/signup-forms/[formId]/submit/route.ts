'use server'

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Submit a form response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.memberId || !body.responses) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: memberId, responses' },
        { status: 400 }
      );
    }

    // Get the form by tcn_form_id
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: formId },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Check if form is active
    if (!form.is_active) {
      return NextResponse.json(
        { success: false, error: 'This form is no longer accepting submissions' },
        { status: 400 }
      );
    }

    // Check deadline
    if (form.deadline && new Date(form.deadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'The deadline for this form has passed' },
        { status: 400 }
      );
    }

    // Check max entries
    if (form.max_entries && form._count.submissions >= form.max_entries) {
      return NextResponse.json(
        { success: false, error: 'This form has reached its maximum number of entries' },
        { status: 400 }
      );
    }

    // Get member info for webhook
    const member = await prisma.fnmember.findUnique({
      where: { id: body.memberId },
      include: { profile: true }
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if member already submitted
    const existingSubmission = await prisma.signup_submission.findUnique({
      where: {
        formId_fnmemberId: {
          formId: form.id,
          fnmemberId: body.memberId
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted this form' },
        { status: 400 }
      );
    }

    // Create the submission
    const submission = await prisma.signup_submission.create({
      data: {
        formId: form.id,
        fnmemberId: body.memberId,
        responses: body.responses,
      },
    });

    // Send webhook to TCN_COMM
    let webhookSuccess = false;
    let webhookError: string | null = null;

    const webhookUrl = process.env.TCN_COMM_WEBHOOK_URL;
    const webhookApiKey = process.env.TCN_COMM_API_KEY;

    if (webhookUrl && webhookApiKey) {
      try {
        const profile = member.profile?.[0];
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': webhookApiKey,
          },
          body: JSON.stringify({
            formId: form.tcn_form_id,
            submittedAt: submission.created.toISOString(),
            submitter: {
              memberId: member.t_number,
              name: `${member.first_name} ${member.last_name}`,
              email: profile?.email || '',
              phone: profile?.phone_number || '',
            },
            responses: body.responses,
          }),
        });

        if (webhookResponse.ok) {
          webhookSuccess = true;
          
          // Update submission to mark as synced
          await prisma.signup_submission.update({
            where: { id: submission.id },
            data: { synced_to_tcn: true },
          });
        } else {
          const errorData = await webhookResponse.json().catch(() => ({}));
          webhookError = errorData.error || `HTTP ${webhookResponse.status}`;
        }
      } catch (err: any) {
        webhookError = err.message;
      }

      // Update sync status if failed
      if (!webhookSuccess) {
        await prisma.signup_submission.update({
          where: { id: submission.id },
          data: {
            sync_attempts: 1,
            last_sync_error: webhookError,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission.id,
      webhookSynced: webhookSuccess,
      webhookError: webhookError,
    });
  } catch (error: any) {
    console.error('Error submitting signup form:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check if member has submitted this form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'memberId is required' },
        { status: 400 }
      );
    }

    // Get the form
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: formId },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Check for existing submission
    const submission = await prisma.signup_submission.findUnique({
      where: {
        formId_fnmemberId: {
          formId: form.id,
          fnmemberId: memberId
        }
      }
    });

    return NextResponse.json({
      success: true,
      hasSubmitted: !!submission,
      submission: submission ? {
        id: submission.id,
        submittedAt: submission.created,
      } : null,
    });
  } catch (error: any) {
    console.error('Error checking submission status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
