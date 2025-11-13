/**
 * Product Credential Model
 * 
 * Stores encrypted credentials for approved products.
 * Supports account_share, email_invite, and license_key types.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const profileMetadataSchema = new mongoose.Schema({
  profileName: { type: String, required: true },
  pin: { type: String, default: null },
  isAssigned: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedAt: { type: Date, default: null }
}, { _id: true });

const productCredentialSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  credentialType: {
    type: String,
    enum: ['account_share', 'email_invite', 'license_key'],
    required: true
  },
  // Encrypted payload - structure depends on credentialType
  // account_share: { accountEmail, accountPassword, profiles: [{ profileName, pin }] }
  // email_invite: { email, available: true/false }
  // license_key: { key: string }
  payloadEncrypted: {
    type: String,
    required: true
  },
  // Metadata for quick access without decryption
  profiles: [profileMetadataSchema],
  accountEmail: { type: String, default: null }, // Stored in plaintext for identification (masked in UI)
  // Counts
  totalCount: {
    type: Number,
    required: true,
    default: 0
  },
  assignedCount: {
    type: Number,
    default: 0
  },
  availableCount: {
    type: Number,
    default: 0
  },
  // Tracking
  createdBy: {
    type: String, // Vendor email
    required: true
  },
  batchNumber: {
    type: Number,
    default: 1
  },
  adminRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminProductRequest',
    default: null,
    index: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
productCredentialSchema.index({ productId: 1, isValid: 1 });
productCredentialSchema.index({ vendorId: 1, createdAt: -1 });
productCredentialSchema.index({ credentialType: 1, isValid: 1 });

// Update updatedAt on save
productCredentialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Calculate available count
  if (this.credentialType === 'account_share' && this.profiles) {
    this.availableCount = this.profiles.filter(p => !p.isAssigned).length;
  } else {
    this.availableCount = this.totalCount - this.assignedCount;
  }
  next();
});

export default mongoose.model('ProductCredential', productCredentialSchema);

