/**
 * FILE: env.js
 * PURPOSE: Environment variable validation and configuration
 * AUTHOR: Next Subscription Engineering
 * UPDATED: 2025-11-14
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Validate critical environment variables
 * Exits process if required variables are missing
 */
export const validateEnvVars = () => {
  const required = ['JWT_SECRET', 'MONGOOSE_URL'];
  const warnings = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      console.error(`❌ CRITICAL: ${key} environment variable is not set!`);
      process.exit(1);
    }
  });
  
  // CONFIG: Enforce strong encryption key at startup to avoid runtime password failures
  const rawKey = process.env.ENCRYPTION_KEY;
  const keyError = (() => {
    if (!rawKey) {
      return 'ENCRYPTION_KEY environment variable is missing. Generate a 32-byte key (e.g. node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))") and add it to your .env file.';
    }

    const trimmed = rawKey.trim();
    let buffer;

    try {
      if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
        buffer = Buffer.from(trimmed, 'hex');
      } else if (/^[A-Za-z0-9+/]{43}=*$/.test(trimmed)) {
        buffer = Buffer.from(trimmed, 'base64');
      } else {
        buffer = Buffer.from(trimmed, 'utf8');
      }
    } catch (error) {
      return `ENCRYPTION_KEY could not be parsed: ${error.message}`;
    }

    if (!buffer || buffer.length < 32) {
      return 'ENCRYPTION_KEY must resolve to at least 32 bytes. Use 32 ASCII chars, a 64-character hex string, or a 44-character base64 value.';
    }

    return null;
  })();

  if (keyError) {
    console.error(`❌ CRITICAL: ${keyError}`);
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(w));
  }
};

/**
 * Get environment configuration
 */
export const getEnvConfig = () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGOOSE_URL: process.env.MONGOOSE_URL,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS
});

export default {
  validateEnvVars,
  getEnvConfig
};

