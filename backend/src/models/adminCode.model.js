/**
 * Admin Code Model - One-Time Admin Access Codes
 * 
 * Stores hashed admin access codes with expiration and attempt tracking.
 * Used for secure admin authentication via email-delivered one-time codes.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

/**
 * Admin Code Schema
 * 
 * Stores hashed secret codes for admin authentication.
 * Codes are hashed before storage and have a short TTL.
 */
const adminCodeSchema = new mongoose.Schema({
  // Admin email (should match ADMIN_EMAIL env var)
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  // Hashed secret code (never store plaintext)
  codeHash: { 
    type: String, 
    required: true 
  },
  
  // Expiration timestamp
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  
  // Number of failed verification attempts
  attempts: { 
    type: Number, 
    default: 0 
  },
  
  // Maximum allowed attempts before invalidation
  maxAttempts: { 
    type: Number, 
    default: 5 
  },
  
  // Whether code has been used successfully
  used: { 
    type: Boolean, 
    default: false 
  },
  
  // IP address of request (for logging/security)
  ipAddress: { 
    type: String 
  },
  
  // User agent (for logging/security)
  userAgent: { 
    type: String 
  },
  
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Index for efficient queries
adminCodeSchema.index({ email: 1, expiresAt: 1, used: 1 });

// Method to check if code is valid (not expired, not used, within attempt limit)
adminCodeSchema.methods.isValid = function() {
  return !this.used && 
         this.expiresAt > new Date() && 
         this.attempts < this.maxAttempts;
};

// Method to increment attempts
adminCodeSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  if (this.attempts >= this.maxAttempts) {
    this.used = true; // Invalidate if max attempts reached
  }
  return await this.save();
};

// Method to mark as used
adminCodeSchema.methods.markAsUsed = async function() {
  this.used = true;
  return await this.save();
};

// Static method to find valid code for email
adminCodeSchema.statics.findValidCode = async function(email) {
  return await this.findOne({
    email: email.toLowerCase().trim(),
    used: false,
    expiresAt: { $gt: new Date() },
    $expr: { $lt: ['$attempts', '$maxAttempts'] }
  }).sort({ createdAt: -1 }); // Get most recent
};

// Static method to cleanup expired codes (optional, TTL index handles this)
adminCodeSchema.statics.cleanupExpired = async function() {
  return await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { used: true }
    ]
  });
};

const AdminCodeModel = mongoose.model('AdminCode', adminCodeSchema);

export default AdminCodeModel;

