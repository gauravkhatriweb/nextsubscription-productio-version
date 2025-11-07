/**
 * Rate Limiting Middleware for System Monitoring Actions
 * 
 * Prevents abuse of system maintenance endpoints.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

// In-memory store for rate limiting
const rateLimitStore = new Map();

// Configuration
const MAX_ACTIONS_PER_MINUTE = 5; // Max 5 actions per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Get client identifier (IP address)
 */
const getClientId = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
};

/**
 * Rate Limiting Middleware for System Actions
 */
export const rateLimitSystemActions = (req, res, next) => {
  const clientId = getClientId(req);
  const key = `system_action:${clientId}`;
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.expiresAt < now) {
    entry = {
      count: 0,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
      firstRequest: now
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment count
  entry.count += 1;
  
  // Check if limit exceeded
  if (entry.count > MAX_ACTIONS_PER_MINUTE) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    return res.status(429).json({
      success: false,
      message: 'Too many system actions. Please wait before trying again.',
      retryAfter
    });
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_ACTIONS_PER_MINUTE);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_ACTIONS_PER_MINUTE - entry.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expiresAt / 1000));
  
  next();
};

