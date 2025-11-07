/**
 * Admin Code Service - Secure Code Generation and Verification
 * 
 * Handles generation, hashing, storage, and verification of admin access codes.
 * Uses cryptographically secure random generation and bcrypt for hashing.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import AdminCodeModel from '../models/adminCode.model.js';

// Configuration from environment variables
const ADMIN_CODE_LENGTH_MIN = parseInt(process.env.ADMIN_CODE_LENGTH_MIN) || 20;
const ADMIN_CODE_LENGTH_MAX = parseInt(process.env.ADMIN_CODE_LENGTH_MAX) || 30;
const ADMIN_CODE_TTL_MINUTES = parseInt(process.env.ADMIN_CODE_TTL_MINUTES) || 10;

/**
 * Character sets for code generation
 */
const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Combined character set
const ALL_CHARS = 
  CHARACTER_SETS.uppercase + 
  CHARACTER_SETS.lowercase + 
  CHARACTER_SETS.digits + 
  CHARACTER_SETS.special;

/**
 * Generate a cryptographically secure random secret code
 * 
 * Uses crypto.randomBytes for secure randomness and ensures
 * the code includes characters from all character sets.
 * 
 * @param {number} length - Desired code length (between min and max)
 * @returns {string} Generated secret code
 */
export const generateSecret = (length = null) => {
  // Random length between min and max if not specified
  const codeLength = length || 
    Math.floor(Math.random() * (ADMIN_CODE_LENGTH_MAX - ADMIN_CODE_LENGTH_MIN + 1)) + 
    ADMIN_CODE_LENGTH_MIN;
  
  // Ensure minimum length
  const finalLength = Math.max(codeLength, ADMIN_CODE_LENGTH_MIN);
  
  // Generate secure random bytes
  const randomBytes = crypto.randomBytes(finalLength);
  
  // Map bytes to characters ensuring diversity
  let code = '';
  let hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
  
  // First pass: ensure at least one character from each set
  const firstChar = CHARACTER_SETS.uppercase[randomBytes[0] % CHARACTER_SETS.uppercase.length];
  code += firstChar;
  hasUpper = true;
  
  const secondChar = CHARACTER_SETS.lowercase[randomBytes[1] % CHARACTER_SETS.lowercase.length];
  code += secondChar;
  hasLower = true;
  
  const thirdChar = CHARACTER_SETS.digits[randomBytes[2] % CHARACTER_SETS.digits.length];
  code += thirdChar;
  hasDigit = true;
  
  const fourthChar = CHARACTER_SETS.special[randomBytes[3] % CHARACTER_SETS.special.length];
  code += fourthChar;
  hasSpecial = true;
  
  // Fill remaining length with random characters
  for (let i = 4; i < finalLength; i++) {
    const randomIndex = randomBytes[i] % ALL_CHARS.length;
    const char = ALL_CHARS[randomIndex];
    code += char;
    
    // Track character types
    if (CHARACTER_SETS.uppercase.includes(char)) hasUpper = true;
    if (CHARACTER_SETS.lowercase.includes(char)) hasLower = true;
    if (CHARACTER_SETS.digits.includes(char)) hasDigit = true;
    if (CHARACTER_SETS.special.includes(char)) hasSpecial = true;
  }
  
  // Shuffle the code to avoid predictable patterns
  const codeArray = code.split('');
  for (let i = codeArray.length - 1; i > 0; i--) {
    const j = randomBytes[i % randomBytes.length] % (i + 1);
    [codeArray[i], codeArray[j]] = [codeArray[j], codeArray[i]];
  }
  
  return codeArray.join('');
};

/**
 * Hash a secret code using bcrypt
 * 
 * @param {string} secret - Plain text secret code
 * @returns {Promise<string>} Hashed secret
 */
export const hashSecret = async (secret) => {
  return await bcrypt.hash(secret, 12); // Higher salt rounds for admin codes
};

/**
 * Save admin code to database
 * 
 * @param {Object} params - Code parameters
 * @param {string} params.email - Admin email
 * @param {string} params.codeHash - Hashed code
 * @param {Date} params.expiresAt - Expiration timestamp
 * @param {string} params.ipAddress - Request IP address
 * @param {string} params.userAgent - User agent string
 * @returns {Promise<Object>} Saved admin code document
 */
export const saveAdminCode = async ({ email, codeHash, expiresAt, ipAddress, userAgent }) => {
  // Invalidate any existing codes for this email
  await AdminCodeModel.updateMany(
    { email: email.toLowerCase().trim(), used: false },
    { used: true }
  );
  
  // Create new code
  const adminCode = new AdminCodeModel({
    email: email.toLowerCase().trim(),
    codeHash,
    expiresAt,
    ipAddress,
    userAgent,
    attempts: 0,
    used: false
  });
  
  return await adminCode.save();
};

/**
 * Verify a submitted secret code
 * 
 * @param {string} email - Admin email
 * @param {string} candidateCode - Submitted code to verify
 * @returns {Promise<Object|null>} Admin code document if valid, null otherwise
 */
export const verifySecret = async (email, candidateCode) => {
  // Find valid code for email
  const adminCode = await AdminCodeModel.findValidCode(email.toLowerCase().trim());
  
  if (!adminCode) {
    return null;
  }
  
  // Verify code hash
  const isValid = await bcrypt.compare(candidateCode, adminCode.codeHash);
  
  if (!isValid) {
    // Increment attempts on failure
    await adminCode.incrementAttempts();
    return null;
  }
  
  // Mark as used on success
  await adminCode.markAsUsed();
  return adminCode;
};

/**
 * Create expiration date based on TTL
 * 
 * @returns {Date} Expiration timestamp
 */
export const createExpirationDate = () => {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + ADMIN_CODE_TTL_MINUTES);
  return expiresAt;
};

/**
 * Invalidate all codes for an email
 * 
 * @param {string} email - Admin email
 * @returns {Promise<Object>} Update result
 */
export const invalidateAllCodes = async (email) => {
  return await AdminCodeModel.updateMany(
    { email: email.toLowerCase().trim(), used: false },
    { used: true }
  );
};

