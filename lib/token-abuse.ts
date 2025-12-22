import { TokenAbuseCheck } from '@/types';
import crypto from 'crypto';

// In-memory rate limit store (stateless by design, resets on server restart)
// For production, consider using a lightweight cache like Upstash Redis
interface RateLimitEntry {
  count: number;
  resetAt: number;
  fingerprint?: string;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit: 100 requests per hour per token
const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate a soft fingerprint from request headers
 * This adds friction but is not perfect security
 */
export function generateFingerprint(userAgent?: string, acceptLanguage?: string): string {
  const data = `${userAgent || ''}|${acceptLanguage || ''}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Check if token is being abused
 * Goal: Prevent infinite abuse, not perfect piracy prevention
 */
export function checkTokenAbuse(
  token: string,
  userAgent?: string,
  acceptLanguage?: string
): TokenAbuseCheck {
  const now = Date.now();
  const fingerprint = generateFingerprint(userAgent, acceptLanguage);
  
  let entry = rateLimitStore.get(token);

  // Clean up expired entries
  if (entry && entry.resetAt < now) {
    rateLimitStore.delete(token);
    entry = undefined;
  }

  // Create new entry if needed
  if (!entry) {
    entry = {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW,
      fingerprint,
    };
    rateLimitStore.set(token, entry);
  }

  // Check fingerprint mismatch (soft detection of token sharing)
  if (entry.fingerprint && entry.fingerprint !== fingerprint) {
    // Allow but log - this is just friction, not blocking
    // In production, you might want to log this for monitoring
  }

  // Check rate limit
  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${RATE_LIMIT_REQUESTS} requests per hour. Please try again later.`,
    };
  }

  // Increment count
  entry.count++;
  entry.fingerprint = fingerprint; // Update fingerprint

  return {
    allowed: true,
  };
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [token, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(token);
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

