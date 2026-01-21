/**
 * Rate limiting utility for API endpoints to prevent brute-force attacks
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
}

interface RateLimitStore {
  [key: string]: {
    attempts: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore: RateLimitStore = {};

/**
 * Default rate limit configurations for different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  ADMIN_LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  ADMIN_FEEDBACK_UPDATE: { maxAttempts: 30, windowMs: 60 * 1000 }, // 30 updates per minute
  ADMIN_REPLY: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 replies per minute
  FEEDBACK_SUBMISSION: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
};

/**
 * Check if request is rate limited
 * @param key - Unique identifier for rate limiting (e.g., email, IP)
 * @param config - Rate limit configuration
 * @returns Object with isLimited flag and retry info
 */
export const checkRateLimit = (key: string, config: RateLimitConfig): {
  isLimited: boolean;
  attempts: number;
  retryAfter: number;
} => {
  const now = Date.now();
  const record = rateLimitStore[key];

  // Initialize or reset if window expired
  if (!record || now > record.resetTime) {
    rateLimitStore[key] = {
      attempts: 1,
      resetTime: now + config.windowMs
    };
    return {
      isLimited: false,
      attempts: 1,
      retryAfter: 0
    };
  }

  // Increment attempts
  record.attempts++;

  const isLimited = record.attempts > config.maxAttempts;
  const retryAfter = Math.ceil((record.resetTime - now) / 1000);

  return {
    isLimited,
    attempts: record.attempts,
    retryAfter
  };
};

/**
 * Reset rate limit for a key
 * @param key - Unique identifier to reset
 */
export const resetRateLimit = (key: string) => {
  delete rateLimitStore[key];
};

/**
 * Middleware function to check rate limit and throw error if exceeded
 * @param key - Unique identifier for rate limiting
 * @param config - Rate limit configuration
 * @throws Error if rate limit exceeded
 */
export const enforceRateLimit = (key: string, config: RateLimitConfig) => {
  const limit = checkRateLimit(key, config);
  
  if (limit.isLimited) {
    const error = new Error(`Rate limit exceeded. Retry after ${limit.retryAfter} seconds`);
    (error as any).retryAfter = limit.retryAfter;
    (error as any).statusCode = 429; // Too Many Requests
    throw error;
  }
};

/**
 * Clean up expired rate limit records periodically
 * Call this function in a cleanup interval
 */
export const cleanupExpiredRateLimits = () => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  }
};

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
}
