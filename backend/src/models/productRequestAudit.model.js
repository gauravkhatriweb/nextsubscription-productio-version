/**
 * Product Request Audit Model
 * 
 * Tracks all admin actions on product requests (approve, reject, request changes).
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const productRequestAuditSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductRequest',
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
    enum: ['submitted', 'approved', 'rejected', 'changes_requested', 'comment_added'],
    required: true
  },
  adminId: {
    type: String, // Admin email
    required: true
  },
  comment: {
    type: String,
    default: null,
    trim: true
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    default: null
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
productRequestAuditSchema.index({ requestId: 1, createdAt: -1 });
productRequestAuditSchema.index({ vendorId: 1, createdAt: -1 });
productRequestAuditSchema.index({ adminId: 1, createdAt: -1 });

export default mongoose.model('ProductRequestAudit', productRequestAuditSchema);

