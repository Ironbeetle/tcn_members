/**
 * Server-side rate limiting for authentication endpoints
 * Uses in-memory storage (for single-server deployments)
 * For multi-server deployments, consider using Redis
 */

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil: number | null;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  // Login attempts
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
  },
  // Password reset requests
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  // Registration attempts
  register: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  // Member verification (birthdate + treaty number)
  verify: {
    maxAttempts: 4,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hour block
  },
  // API requests (general)
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
};

type RateLimitType = keyof typeof RATE_LIMIT_CONFIG;

/**
 * Get client identifier from request
 * Uses IP address, falls back to a combination of headers
 */
export function getClientIdentifier(request: Request): string {
  const headers = request.headers;
  
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback - use user agent hash (less reliable but better than nothing)
  const userAgent = headers.get('user-agent') || 'unknown';
  return `ua-${hashString(userAgent)}`;
}

/**
 * Simple string hash function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if a client is rate limited
 */
export function checkRateLimit(
  clientId: string,
  type: RateLimitType
): { 
  allowed: boolean; 
  remaining: number; 
  resetIn: number; 
  retryAfter?: number;
} {
  const config = RATE_LIMIT_CONFIG[type];
  const key = `${type}:${clientId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetIn: retryAfter,
      retryAfter,
    };
  }
  
  // Reset if window has passed or if block has expired
  if (!entry || (now - entry.firstRequest) > config.windowMs || (entry.blockedUntil && entry.blockedUntil <= now)) {
    entry = {
      count: 0,
      firstRequest: now,
      blockedUntil: null,
    };
  }
  
  // Calculate remaining
  const remaining = Math.max(0, config.maxAttempts - entry.count);
  const resetIn = Math.ceil((entry.firstRequest + config.windowMs - now) / 1000);
  
  return {
    allowed: remaining > 0,
    remaining,
    resetIn: Math.max(0, resetIn),
  };
}

/**
 * Record a request attempt
 */
export function recordRequest(
  clientId: string,
  type: RateLimitType,
  success: boolean = false
): void {
  const config = RATE_LIMIT_CONFIG[type];
  const key = `${type}:${clientId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (!entry || (now - entry.firstRequest) > config.windowMs) {
    entry = {
      count: 0,
      firstRequest: now,
      blockedUntil: null,
    };
  }
  
  if (success) {
    // Reset on success (for login attempts)
    entry.count = 0;
    entry.blockedUntil = null;
  } else {
    // Increment count on failure
    entry.count += 1;
    
    // Block if exceeded max attempts
    if (entry.count >= config.maxAttempts) {
      entry.blockedUntil = now + config.blockDurationMs;
    }
  }
  
  rateLimitStore.set(key, entry);
}

/**
 * Clear rate limit for a client (e.g., after successful authentication)
 */
export function clearRateLimit(clientId: string, type: RateLimitType): void {
  const key = `${type}:${clientId}`;
  rateLimitStore.delete(key);
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries that are older than 2 hours
    if (now - entry.firstRequest > 2 * 60 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 10 * 60 * 1000);
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Please try again in ${Math.ceil(retryAfter / 60)} minute(s)`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}
