/**
 * API Authentication Utilities
 * Handles API key validation for secure sync between master database and portal
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Get valid API keys from environment
function getValidApiKeys(): string[] {
  const keys = process.env.API_KEYS || '';
  return keys.split(',').map(key => key.trim()).filter(Boolean);
}

// Validate API key from request headers
export function validateApiKey(request: NextRequest): {
  valid: boolean;
  error?: string;
} {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return { valid: false, error: 'Missing API key' };
  }

  const validKeys = getValidApiKeys();
  
  if (validKeys.length === 0) {
    console.error('No API keys configured in environment');
    return { valid: false, error: 'Server configuration error' };
  }

  // Use timing-safe comparison to prevent timing attacks
  const isValid = validKeys.some(validKey => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(apiKey),
        Buffer.from(validKey)
      );
    } catch {
      return false;
    }
  });

  if (!isValid) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
}

// Generate a new API key (utility function for admin use)
export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate request signature (optional extra security layer)
export function validateRequestSignature(
  request: NextRequest,
  body: string,
  secret: string
): boolean {
  const signature = request.headers.get('x-signature');
  if (!signature) return false;

  const timestamp = request.headers.get('x-timestamp');
  if (!timestamp) return false;

  // Check timestamp is within 5 minutes
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    return false;
  }

  // Verify HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Rate limiting helper (simple in-memory, consider Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Get client IP for rate limiting
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Standard API response helpers
export function apiSuccess<T>(data: T, message?: string) {
  return Response.json({
    success: true,
    message: message || 'Operation successful',
    data,
    timestamp: new Date().toISOString(),
  });
}

export function apiError(error: string, status: number = 400, details?: any) {
  return Response.json(
    {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Logging helper for audit trail
export function logApiAccess(
  request: NextRequest,
  action: string,
  success: boolean,
  details?: any
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: getClientIp(request),
    action,
    success,
    userAgent: request.headers.get('user-agent'),
    details,
  };
  
  // In production, you'd want to write this to a proper log system
  console.log('[API ACCESS]', JSON.stringify(logEntry));
}
