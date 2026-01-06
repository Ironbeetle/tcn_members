/**
 * Email API - Send emails via Resend
 * 
 * Endpoint for the Tauri Communications desktop app to send emails.
 * Supports attachments via FormData.
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
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST - Send email to recipients
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:email:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || '';
    
    let subject: string;
    let message: string;
    let recipients: string[];
    let userId: string | undefined;
    let attachments: Array<{ filename: string; content: Buffer }> = [];

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with attachments)
      const formData = await request.formData();
      
      subject = formData.get('subject') as string;
      message = formData.get('message') as string;
      const recipientsJson = formData.get('recipients') as string;
      userId = formData.get('userId') as string | undefined;
      
      try {
        recipients = JSON.parse(recipientsJson);
      } catch {
        return apiError('Invalid recipients format', 400);
      }

      // Process attachments
      const files = formData.getAll('attachments') as File[];
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        attachments.push({
          filename: file.name,
          content: buffer,
        });
      }
    } else {
      // Handle JSON (no attachments)
      const body = await request.json();
      subject = body.subject;
      message = body.message;
      recipients = body.recipients;
      userId = body.userId;
    }

    // Validate required fields
    if (!subject || !message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return apiError('Missing required fields: subject, message, recipients', 400);
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return apiError(`Invalid email addresses: ${invalidEmails.join(', ')}`, 400);
    }

    // Build HTML email
    const htmlMessage = buildHtmlEmail(subject, message);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'TCN Communications'} <${process.env.RESEND_FROM_EMAIL}>`,
      to: recipients,
      subject: subject,
      html: htmlMessage,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      
      // Log failed attempt
      await logEmailToDatabase({
        subject,
        message,
        recipients,
        status: 'FAILED',
        error: error.message,
        attachments,
        userId,
      });

      logApiAccess(request, 'comm:email:POST', false, { error: error.message });
      return apiError(`Failed to send email: ${error.message}`, 500);
    }

    // Log successful send
    await logEmailToDatabase({
      subject,
      message,
      recipients,
      status: 'SUCCESS',
      messageId: data?.id,
      attachments,
      userId,
    });

    logApiAccess(request, 'comm:email:POST', true, { 
      recipients: recipients.length,
      messageId: data?.id,
    });

    return apiSuccess({
      messageId: data?.id,
      recipients: recipients.length,
    }, 'Email sent successfully');

  } catch (error: any) {
    console.error('Email send error:', error);
    logApiAccess(request, 'comm:email:POST', false, { error: error.message });
    return apiError('Failed to send email', 500);
  }
}

// GET - Get email history
export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const since = searchParams.get('since');

    const logs = await prisma.$queryRaw<any[]>`
      SELECT id, created, subject, recipients, status, "messageId", error
      FROM msgmanager."EmailLog"
      ${since ? prisma.$queryRaw`WHERE created >= ${new Date(since)}` : prisma.$queryRaw``}
      ORDER BY created DESC
      LIMIT ${Math.min(limit, 100)}
    `;

    return apiSuccess({
      logs,
      count: logs.length,
    });
  } catch (error: any) {
    console.error('Email history error:', error);
    return apiError('Failed to fetch email history', 500);
  }
}

// Helper to build HTML email template
function buildHtmlEmail(subject: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background: linear-gradient(135deg, #b45309 0%, #78350f 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
          }
          .content { 
            background: #ffffff; 
            padding: 30px; 
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .footer { 
            background: #f9fafb; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280; 
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">${escapeHtml(subject)}</h1>
          </div>
          <div class="content">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} Tataskweyak Cree Nation. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This message was sent via TCN Communications.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Helper to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to log email to database
async function logEmailToDatabase(data: {
  subject: string;
  message: string;
  recipients: string[];
  status: string;
  messageId?: string;
  error?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
  userId?: string;
}) {
  try {
    const attachmentsMeta = data.attachments?.map(a => ({ 
      filename: a.filename, 
      size: a.content.length 
    })) || null;

    await prisma.$executeRaw`
      INSERT INTO msgmanager."EmailLog" (id, created, updated, subject, message, recipients, status, "messageId", error, attachments, "userId")
      VALUES (
        gen_random_uuid()::text,
        NOW(),
        NOW(),
        ${data.subject},
        ${data.message},
        ${data.recipients},
        ${data.status},
        ${data.messageId || null},
        ${data.error || null},
        ${attachmentsMeta ? JSON.stringify(attachmentsMeta) : null}::jsonb,
        ${data.userId || 'api-user'}
      )
    `;
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}
