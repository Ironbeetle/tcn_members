/**
 * Security utilities for input sanitization and validation
 */

// Sanitize string input - remove potentially dangerous characters
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove SQL injection patterns
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi, '')
    // Remove common XSS patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Trim whitespace
    .trim();
}

// Validate username - only alphanumeric and underscore
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  
  // Length check: 3-30 characters
  if (username.length < 3 || username.length > 30) return false;
  
  // Only allow alphanumeric and underscore
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
}

// Validate password format (basic check, server does full validation)
export function isValidPasswordFormat(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  
  // Length check: 8-128 characters
  if (password.length < 8 || password.length > 128) return false;
  
  return true;
}

// Check for suspicious patterns that might indicate an attack
export function containsSuspiciousPatterns(input: string): boolean {
  if (!input) return false;
  
  const suspiciousPatterns = [
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--)|(;)|(\/\*)|(\*\/)/,
    /('|")\s*(OR|AND)\s*('|"|\d)/i,
    
    // XSS patterns
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    
    // Path traversal
    /\.\.\//,
    /\.\.\\/, 
    
    // Null bytes
    /\0/,
    
    // Command injection
    /[;&|`$]/,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Rate limiter for client-side (tracks attempts in memory/localStorage)
const RATE_LIMIT_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

export function checkRateLimit(): { allowed: boolean; remainingAttempts: number; lockoutRemaining: number } {
  if (typeof window === 'undefined') {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockoutRemaining: 0 };
  }
  
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const now = Date.now();
  
  let data: RateLimitData = stored 
    ? JSON.parse(stored) 
    : { attempts: 0, firstAttempt: now, lockedUntil: null };
  
  // Check if locked out
  if (data.lockedUntil && data.lockedUntil > now) {
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      lockoutRemaining: Math.ceil((data.lockedUntil - now) / 1000 / 60) 
    };
  }
  
  // Reset if lockout expired or window passed (1 hour)
  if (data.lockedUntil && data.lockedUntil <= now) {
    data = { attempts: 0, firstAttempt: now, lockedUntil: null };
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  }
  
  // Reset if first attempt was more than 1 hour ago
  if (now - data.firstAttempt > 60 * 60 * 1000) {
    data = { attempts: 0, firstAttempt: now, lockedUntil: null };
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  }
  
  return { 
    allowed: true, 
    remainingAttempts: MAX_ATTEMPTS - data.attempts,
    lockoutRemaining: 0 
  };
}

export function recordLoginAttempt(success: boolean): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const now = Date.now();
  
  let data: RateLimitData = stored 
    ? JSON.parse(stored) 
    : { attempts: 0, firstAttempt: now, lockedUntil: null };
  
  if (success) {
    // Reset on successful login
    data = { attempts: 0, firstAttempt: now, lockedUntil: null };
  } else {
    // Increment failed attempts
    data.attempts += 1;
    
    // Lock if exceeded max attempts
    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = now + LOCKOUT_DURATION;
    }
  }
  
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

export function clearRateLimit(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RATE_LIMIT_KEY);
}
