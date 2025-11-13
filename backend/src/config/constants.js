/**
 * FILE: constants.js
 * PURPOSE: Centralized constants and configuration values for the Next Subscription backend
 * AUTHOR: Next Subscription Engineering
 * UPDATED: 2025-11-14
 */

// SYSTEM STATUS CONSTANTS
export const SYSTEM_STATUS = {
  OK: 'ok',
  ERROR: 'error',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

// HTTP STATUS CODES
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// USER ROLES
export const USER_ROLES = {
  USER: 'user',
  VENDOR: 'vendor',
  ADMIN: 'admin'
};

// VENDOR STATUS
export const VENDOR_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected'
};

// PRODUCT REQUEST STATUS
export const PRODUCT_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FULFILLED: 'fulfilled'
};

// LOG LEVELS
export const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug'
};

// RATE LIMIT CONFIGURATION
export const RATE_LIMITS = {
  SYSTEM_ACTIONS_PER_MINUTE: 5,
  VENDOR_PASSWORD_REQUESTS: 1,
  VENDOR_PASSWORD_REQUESTS_ADMIN: 1000,
  WINDOW_MS: 60 * 1000,
  VENDOR_PASSWORD_WINDOW_MS: 2 * 60 * 1000
};

// FILE UPLOAD LIMITS
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
  JSON_BODY_LIMIT: '16kb',
  URL_ENCODED_LIMIT: '16kb'
};

// PAGINATION DEFAULTS
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// TOKEN EXPIRATION
export const TOKEN_EXPIRATION = {
  USER_TOKEN: '1d',
  ADMIN_TOKEN: '1d',
  VENDOR_TOKEN: '1d'
};

// DATABASE QUERY OPTIONS
export const DB_OPTIONS = {
  DEFAULT_SORT: { createdAt: -1 },
  LEAN_OPTIONS: { lean: true }
};

