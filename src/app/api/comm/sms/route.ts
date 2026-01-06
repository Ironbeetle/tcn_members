/**
 * SMS API - Send SMS messages via Twilio
 * 
 * Endpoint for the Tauri Communications desktop app to send SMS messages.
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
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Request body schema
const smsSchema = z.object({
  message: z.string().min(1).max(1600),
  recipients: z.array(z.string()).min(1).max(500),
  userId: z.string().optional(), // Optional staff user ID for logging
});

// POST - Send SMS to recipients
export async function POST(request: NextRequest) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    logApiAccess(request, 'comm:sms:POST', false, { error: authResult.error });
    return apiError(authResult.error || 'Unauthorized', 401);
  }

  try {
    const body = await request.json();
    
    const validation = smsSchema.safeParse(body);
    if (!validation.success) {
      logApiAccess(request, 'comm:sms:POST', false, { error: 'Validation error' });
      return apiError('Validation error', 400, validation.error.issues);
    }

    const { message, recipients, userId } = validation.data;

    // Send SMS to each recipient
    const results: Array<{ phone: string; success: boolean; messageId?: string; error?: string }> = [];
    const successfulIds: string[] = [];
    const failedRecipients: string[] = [];

    for (const phone of recipients) {
      try {
        // Format phone number (ensure E.164 format)
        const formattedPhone = formatPhoneNumber(phone);
        
        const twilioMessage = await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });

        results.push({
          phone,
          success: true,
          messageId: twilioMessage.sid,
        });
        successfulIds.push(twilioMessage.sid);
      } catch (err: any) {
        results.push({
          phone,
          success: false,
          error: err.message,
        });
        failedRecipients.push(phone);
      }
    }

    // Log to database (msgmanager schema)
    const smsLog = await prisma.$executeRaw`
      INSERT INTO msgmanager."SmsLog" (id, created, updated, message, recipients, status, "messageIds", error, "userId")
      VALUES (
        gen_random_uuid()::text,
        NOW(),
        NOW(),
        ${message},
        ${recipients},
        ${failedRecipients.length === 0 ? 'SUCCESS' : failedRecipients.length === recipients.length ? 'FAILED' : 'PARTIAL'},
        ${successfulIds},
        ${failedRecipients.length > 0 ? `Failed: ${failedRecipients.join(', ')}` : null},
        ${userId || 'api-user'}
      )
    `;

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    logApiAccess(request, 'comm:sms:POST', true, { 
      total: recipients.length,
      success: successCount,
      failed: failedCount,
    });

    return apiSuccess({
      sent: successCount,
      failed: failedCount,
      total: recipients.length,
      results,
    }, `SMS sent: ${successCount}/${recipients.length} successful`);

  } catch (error: any) {
    console.error('SMS send error:', error);
    logApiAccess(request, 'comm:sms:POST', false, { error: error.message });
    return apiError('Failed to send SMS', 500);
  }
}

// GET - Get SMS history
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
      SELECT * FROM msgmanager."SmsLog"
      ${since ? prisma.$queryRaw`WHERE created >= ${new Date(since)}` : prisma.$queryRaw``}
      ORDER BY created DESC
      LIMIT ${Math.min(limit, 100)}
    `;

    return apiSuccess({
      logs,
      count: logs.length,
    });
  } catch (error: any) {
    console.error('SMS history error:', error);
    return apiError('Failed to fetch SMS history', 500);
  }
}

// Helper function to format phone numbers to E.164
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 1 and is 11 digits, it's likely a US/Canada number
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // If it's 10 digits, assume US/Canada and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Otherwise, assume it already has country code or add +1
  if (!phone.startsWith('+')) {
    return `+1${digits}`;
  }
  
  return phone;
}
