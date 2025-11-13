/**
 * Vendor Audit Model
 * 
 * Audit trail for all vendor-related admin actions.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const vendorAuditSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  adminId: {
    type: String, // Admin email
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created',
      'updated',
      'status_changed',
      'credentials_sent',
      'password_reset',
      'password_generated',
      'password_viewed',
      'suspended',
      'activated',
      'rejected',
      'note_added',
      'manager_assigned',
      'whatsapp_template_copied'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
vendorAuditSchema.index({ vendorId: 1, createdAt: -1 });
vendorAuditSchema.index({ adminId: 1, createdAt: -1 });
vendorAuditSchema.index({ action: 1, createdAt: -1 });

const VendorAuditModel = mongoose.model('VendorAudit', vendorAuditSchema);

export default VendorAuditModel;

