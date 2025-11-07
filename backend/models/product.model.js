/**
 * Product Model
 * 
 * Universal product schema supporting multiple product types and fulfillment modes.
 * Supports Netflix/Spotify/Adobe/etc. account sharing, email invites, license keys.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  profileName: { type: String, required: true },
  pin: { type: String, default: null },
  isAssigned: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedAt: { type: Date, default: null }
}, { _id: true });

const productSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  serviceType: {
    type: String,
    enum: ['account_share', 'email_invite', 'license_key', 'other'],
    required: true,
    default: 'account_share'
  },
  provider: {
    type: String,
    enum: ['netflix', 'spotify', 'adobe', 'disney', 'hulu', 'amazon', 'apple', 'microsoft', 'other'],
    required: true
  },
  planDurationDays: {
    type: Number,
    required: true,
    min: 1
  },
  priceDecimal: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  // For account_share type
  profiles: [profileSchema],
  accountEmail: { type: String, default: null },
  accountPassword: { type: String, default: null }, // Encrypted
  // Warranty & Policies
  warrantyDays: {
    type: Number,
    default: 0,
    min: 0
  },
  warrantyType: {
    type: String,
    enum: ['full', 'limited', 'none'],
    default: 'none'
  },
  replacementPolicy: {
    type: String,
    default: ''
  },
  rules: {
    type: String,
    default: ''
  },
  // Product Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  autoActivate: {
    type: Boolean,
    default: false
  },
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  thumbnail: { type: String, default: null },
  // Admin Review
  adminReviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminReviewNotes: { type: String, default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  reviewedAt: { type: Date, default: null },
  // Metadata
  description: { type: String, default: '' },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ vendorId: 1, status: 1 });
productSchema.index({ provider: 1, status: 1 });
productSchema.index({ sku: 1 });

// Auto-generate SKU if not provided
productSchema.pre('save', async function(next) {
  if (!this.sku && this.isNew) {
    const count = await mongoose.model('Product').countDocuments();
    this.sku = `PRD-${Date.now()}-${count + 1}`;
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Product', productSchema);

