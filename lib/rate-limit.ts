// Simple in-memory rate limiter (suitable for Vercel serverless)
// Use a proper Redis backend for production scale.

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimitRecord>();

// Clean up expired entries every 60 seconds to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Array.from(cache.entries()).forEach(([key, record]) => {
      if (now > record.resetAt) {
        cache.delete(key);
      }
    });
  }, 60000);
}

/**
 * Check if a request from the given IP is within the rate limit.
 *
 * @param ip          Request IP or identifier
 * @param limit       Max requests allowed per window (default 60)
 * @param windowMs    Time window in milliseconds (default 60_000)
 * @returns true if allowed, false if rate-limited
 */
export function rateLimit(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const record = cache.get(ip);

  if (!record || now > record.resetAt) {
    cache.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get remaining requests and reset time for an IP.
 */
export function getRateLimitInfo(ip: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const record = cache.get(ip);

  if (!record || now > record.resetAt) {
    return { remaining: limit, resetAt: now + windowMs };
  }

  return { remaining: Math.max(0, limit - record.count), resetAt: record.resetAt };
}

/**
 * Create a standard 429 Too Many Requests response.
 */
export function tooManyRequestsResponse(resetAt: number) {
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  );
}
