/**
 * Rate Limiting Middleware for Vendor Endpoints
 * 
 * Protects vendor endpoints from abuse and brute force attacks.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map();

// Configuration
const VENDOR_LOGIN_MAX_ATTEMPTS = parseInt(process.env.VENDOR_LOGIN_MAX_ATTEMPTS) || 5; // Per 15 minutes
const VENDOR_API_MAX_REQUESTS = parseInt(process.env.VENDOR_API_MAX_REQUESTS) || 100; // Per minute
const FILE_UPLOAD_MAX_REQUESTS = parseInt(process.env.FILE_UPLOAD_MAX_REQUESTS) || 10; // Per minute

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const API_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Get client identifier (IP address or vendor ID)
 */
const getClientId = (req) => {
  if (req.vendor?._id) {
    return `vendor:${req.vendor._id}`;
  }
  return req.ip || 
         req.connection.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
};

/**
 * Cleanup expired entries
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
 * Rate Limiting Middleware for Vendor Login
 */
export const rateLimitVendorLogin = (req, res, next) => {
  const clientId = getClientId(req);
  const key = `vendor_login:${clientId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.expiresAt < now) {
    entry = {
      count: 0,
      expiresAt: now + LOGIN_WINDOW_MS,
      firstRequest: now
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count += 1;
  
  if (entry.count > VENDOR_LOGIN_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfter
    });
  }
  
  res.setHeader('X-RateLimit-Limit', VENDOR_LOGIN_MAX_ATTEMPTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, VENDOR_LOGIN_MAX_ATTEMPTS - entry.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expiresAt / 1000));
  
  next();
};

/**
 * Rate Limiting Middleware for Vendor API Requests
 */
export const rateLimitVendorAPI = (req, res, next) => {
  const clientId = getClientId(req);
  const key = `vendor_api:${clientId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.expiresAt < now) {
    entry = {
      count: 0,
      expiresAt: now + API_WINDOW_MS,
      firstRequest: now
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count += 1;
  
  if (entry.count > VENDOR_API_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please slow down.',
      retryAfter
    });
  }
  
  res.setHeader('X-RateLimit-Limit', VENDOR_API_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, VENDOR_API_MAX_REQUESTS - entry.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expiresAt / 1000));
  
  next();
};

/**
 * Rate Limiting Middleware for File Uploads
 */
export const rateLimitFileUpload = (req, res, next) => {
  const clientId = getClientId(req);
  const key = `vendor_upload:${clientId}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.expiresAt < now) {
    entry = {
      count: 0,
      expiresAt: now + API_WINDOW_MS,
      firstRequest: now
    };
    rateLimitStore.set(key, entry);
  }
  
  entry.count += 1;
  
  if (entry.count > FILE_UPLOAD_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    
    return res.status(429).json({
      success: false,
      message: 'Too many file uploads. Please try again later.',
      retryAfter
    });
  }
  
  res.setHeader('X-RateLimit-Limit', FILE_UPLOAD_MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, FILE_UPLOAD_MAX_REQUESTS - entry.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.expiresAt / 1000));
  
  next();
};

