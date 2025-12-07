import { logger } from './logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple client-side rate limiter
 * Prevents abuse of API endpoints
 */
class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if action is allowed
   * @param key - Unique identifier for the action (e.g., 'create-product', 'send-message')
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  checkLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    // No previous entry or window expired
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Within window, check count
    if (entry.count < config.maxRequests) {
      entry.count++;
      return true;
    }

    // Rate limited
    const remainingMs = entry.resetTime - now;
    logger.warn('Rate limit exceeded', {
      key,
      remainingMs,
      maxRequests: config.maxRequests,
    });
    
    return false;
  }

  /**
   * Get remaining time until reset (in seconds)
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const now = Date.now();
    const remainingMs = Math.max(0, entry.resetTime - now);
    return Math.ceil(remainingMs / 1000);
  }

  /**
   * Reset limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limits
export const RATE_LIMITS = {
  // Product creation: 5 per hour
  CREATE_PRODUCT: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Message sending: 20 per minute
  SEND_MESSAGE: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Comment posting: 10 per minute
  POST_COMMENT: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Like action: 30 per minute
  LIKE_ACTION: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Search queries: 30 per minute
  SEARCH_QUERY: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // File upload: 10 per hour
  FILE_UPLOAD: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // Purchase attempt: 5 per minute
  PURCHASE_ATTEMPT: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Helper function to check rate limit with predefined config
 */
export function checkRateLimit(
  action: keyof typeof RATE_LIMITS,
  userId?: string
): { allowed: boolean; resetTime?: number } {
  const key = userId ? `${action}:${userId}` : action;
  const config = RATE_LIMITS[action];
  
  const allowed = rateLimiter.checkLimit(key, config);
  
  if (!allowed) {
    const resetTime = rateLimiter.getResetTime(key);
    return { allowed: false, resetTime };
  }
  
  return { allowed: true };
}

/**
 * Format reset time for user display
 */
export function formatResetTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
