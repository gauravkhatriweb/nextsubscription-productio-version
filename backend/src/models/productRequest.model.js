/**
 * Product Request Model
 * 
 * Stores vendor product proposals that require admin approval before becoming products.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  durationDays: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' }
}, { _id: true });

const productRequestSchema = new mongoose.Schema({
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
  provider: {
    type: String,
    enum: ['netflix', 'spotify', 'adobe', 'disney', 'hulu', 'amazon', 'apple', 'microsoft', 'other'],
    required: true
  },
  serviceType: {
    type: String,
    enum: ['account_share', 'email_invite', 'license_key', 'other'],
    required: true
  },
  plans: {
    type: [planSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one plan is required'
    }
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  warrantyDays: {
    type: Number,
    default: 0,
    min: 0
  },
  replacementPolicy: {
    type: String,
    default: '',
    trim: true
  },
  rules: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  attachments: [{
    url: String,
    filename: String,
    mimetype: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected', 'changes_requested'],
    default: 'pending_review',
    index: true
  },
  adminComment: {
    type: String,
    default: null,
    trim: true
  },
  reviewedBy: {
    type: String, // Admin email
    default: null
  },
  reviewedAt: {
    type: Date,
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
productRequestSchema.index({ vendorId: 1, status: 1 });
productRequestSchema.index({ status: 1, createdAt: -1 });
productRequestSchema.index({ provider: 1, status: 1 });

// Update updatedAt on save
productRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ProductRequest', productRequestSchema);

