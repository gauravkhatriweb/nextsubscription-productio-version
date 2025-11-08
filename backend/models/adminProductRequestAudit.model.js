/**
 * Admin Product Request Audit Model
 * 
 * Tracks all actions on admin product requests.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const adminProductRequestAuditSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminProductRequest',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'fulfilled', 'partially_fulfilled', 'rejected', 'cancelled', 'viewed', 'template_generated'],
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
adminProductRequestAuditSchema.index({ requestId: 1, createdAt: -1 });
adminProductRequestAuditSchema.index({ vendorId: 1, createdAt: -1 });
adminProductRequestAuditSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.model('AdminProductRequestAudit', adminProductRequestAuditSchema);

