/**
 * Product Credential Audit Model
 * 
 * Tracks all actions on product credentials (upload, view, decrypt, assign).
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const productCredentialAuditSchema = new mongoose.Schema({
  credentialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCredential',
    required: true,
    index: true
  },
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
  action: {
    type: String,
    enum: ['uploaded', 'viewed', 'decrypted', 'assigned', 'invalidated', 'updated'],
    required: true
  },
  actorId: {
    type: String, // Admin email or vendor email
    required: true
  },
  actorType: {
    type: String,
    enum: ['admin', 'vendor', 'system'],
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
productCredentialAuditSchema.index({ credentialId: 1, createdAt: -1 });
productCredentialAuditSchema.index({ productId: 1, createdAt: -1 });
productCredentialAuditSchema.index({ vendorId: 1, createdAt: -1 });
productCredentialAuditSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.model('ProductCredentialAudit', productCredentialAuditSchema);

