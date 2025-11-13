/**
 * Vendor Team Model
 * 
 * Schema for vendor team members (loaders, support, managers).
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const vendorTeamSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  role: {
    type: String,
    enum: ['loader', 'support', 'manager', 'owner'],
    required: true,
    default: 'loader'
  },
  passwordHash: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  permissions: {
    canAddStock: { type: Boolean, default: false },
    canViewOrders: { type: Boolean, default: false },
    canFulfillOrders: { type: Boolean, default: false },
    canManageProducts: { type: Boolean, default: false },
    canManageTeam: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  initialPasswordSet: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Static method to hash password
vendorTeamSchema.statics.hashPassword = async function(password) {
  const bcrypt = (await import('bcryptjs')).default;
  return await bcrypt.hash(password, 10);
};

// Indexes
vendorTeamSchema.index({ vendorId: 1, email: 1 }, { unique: true });
vendorTeamSchema.index({ email: 1 });

export default mongoose.model('VendorTeam', vendorTeamSchema);

