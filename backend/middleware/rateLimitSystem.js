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

// SECURITY: Rate limit configuration for vendor password viewing
// Admins get unlimited access (whitelisted), non-admins get strict limits
const MAX_VENDOR_PASSWORD_REQUESTS = 1; // Max 1 password access per window for non-admins
const MAX_VENDOR_PASSWORD_REQUESTS_ADMIN = 1000; // Very high limit for admins (effectively unlimited)
const VENDOR_PASSWORD_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

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

/**
 * Rate Limiting Middleware for Vendor Password Viewing
 * 
 * SECURITY: Whitelists authenticated admins for unlimited password views.
 * Non-admin users (if they somehow reach this endpoint) get strict rate limits.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const rateLimitVendorPassword = (req, res, next) => {
  // RATE-LIMIT: Check if request is from authenticated admin
  const isAdmin = req.admin && req.admin.role === 'admin';
  
  // SECURITY: Whitelist authenticated admins - skip rate limiting
  if (isAdmin) {
    // Set headers indicating unlimited access for admin
    res.setHeader('X-RateLimit-Limit', MAX_VENDOR_PASSWORD_REQUESTS_ADMIN);
    res.setHeader('X-RateLimit-Remaining', MAX_VENDOR_PASSWORD_REQUESTS_ADMIN);
    res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + VENDOR_PASSWORD_WINDOW_MS) / 1000));
    return next(); // Skip rate limiting for admins
  }

  // RATE-LIMIT: Apply strict limits for non-admin users (fallback protection)
  const clientId = getClientId(req);
  const key = `vendor_password:${clientId}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || entry.expiresAt < now) {
    entry = {
      count: 0,
      expiresAt: now + VENDOR_PASSWORD_WINDOW_MS
    };
    rateLimitStore.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > MAX_VENDOR_PASSWORD_REQUESTS) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Password view rate limit exceeded. Please wait before trying again.',
      retryAfter,
      cooldownSeconds: retryAfter
    });
  }

  res.setHeader('X-RateLimit-Limit', MAX_VENDOR_PASSWORD_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_VENDOR_PASSWORD_REQUESTS - entry.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expiresAt / 1000));

  next();
};

