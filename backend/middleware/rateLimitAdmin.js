/**
 * Rate Limiting Middleware for Admin Endpoints
 * 
 * Protects admin endpoints from brute force and enumeration attacks.
 * Uses in-memory store for rate limiting (consider Redis for production).
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map();

// Configuration
const ADMIN_MAX_REQUESTS_PER_HOUR = parseInt(process.env.ADMIN_MAX_REQUESTS_PER_HOUR) || 6;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Get client identifier (IP address)
 * 
 * @param {Request} req - Express request object
 * @returns {string} Client IP address
 */
const getClientId = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
};

/**
 * Cleanup expired entries from rate limit store
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.expiresAt < now) {
      rateLimitStore.delete(key);
    }
  }
};

// Cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Rate Limiting Middleware for Admin Code Requests
 * 
 * Limits the number of admin code requests per IP address per hour.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const rateLimitAdminCodeRequest = (req, res, next) => {
  const clientId = getClientId(req);
  const key = `admin_code_request:${clientId}`;
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.expiresAt < now) {
    // Create new entry
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
  if (entry.count > ADMIN_MAX_REQUESTS_PER_HOUR) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter
    });
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', ADMIN_MAX_REQUESTS_PER_HOUR);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, ADMIN_MAX_REQUESTS_PER_HOUR - entry.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expiresAt / 1000));
  
  next();
};

/**
 * Rate Limiting Middleware for Admin Code Verification
 * 
 * Limits verification attempts per IP to prevent brute force attacks.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const rateLimitAdminCodeVerify = (req, res, next) => {
  const clientId = getClientId(req);
  const key = `admin_code_verify:${clientId}`;
  const now = Date.now();
  
  // More lenient limit for verification (since code is long)
  const MAX_VERIFY_ATTEMPTS = 20; // Per hour
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.expiresAt < now) {
    entry = {
      count: 0,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
      firstRequest: now
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count += 1;
  
  if (entry.count > MAX_VERIFY_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    
    return res.status(429).json({
      success: false,
      message: 'Too many verification attempts. Please try again later.',
      retryAfter
    });
  }
  
  next();
};

