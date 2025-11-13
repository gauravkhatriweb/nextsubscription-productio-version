/**
 * Vendor Model
 * 
 * Defines the Mongoose schema for vendor accounts.
 * All vendor accounts are created by admins only.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const vendorchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  displayName: {
    type: String,
    trim: true
  },
  
  // Contact Information
  primaryEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  additionalEmails: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  contactPhone: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  
  // Authentication
  passwordHash: {
    type: String,
    required: true
  },
  adminPasswordEncrypted: {
    type: String,
    default: null,
    select: true
  },
  initialPasswordSet: {
    type: Boolean,
    default: false
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'pending',
    index: true
  },
  
  // Admin Management
  createdBy: {
    type: String, // Admin email
    required: true
  },
  vendorManager: {
    type: String, // Admin email assigned as contact
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for efficient queries
vendorchema.index({ companyName: 'text', primaryEmail: 'text' });
vendorchema.index({ status: 1, createdAt: -1 });

// Instance method: Compare password
vendorchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Static method: Hash password
vendorchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};

const VendorModel = mongoose.model('Vendor', vendorchema);

export default VendorModel;

