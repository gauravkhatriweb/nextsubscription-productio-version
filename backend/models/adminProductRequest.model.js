/**
 * Admin Product Request Model
 * 
 * Tracks admin requests for stock/credentials from vendors.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const adminProductRequestSchema = new mongoose.Schema({
  adminId: {
    type: String, // Admin email
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
    required: true,
    index: true
  },
  quantityRequested: {
    type: Number,
    required: true,
    min: 1
  },
  quantityFulfilled: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['requested', 'fulfilled', 'partially_fulfilled', 'rejected', 'cancelled'],
    default: 'requested',
    index: true
  },
  notes: {
    type: String,
    default: null,
    trim: true
  },
  deadline: {
    type: Date,
    default: null
  },
  // Template storage
  emailTemplate: {
    subject: String,
    body: String
  },
  whatsappTemplate: {
    type: String
  },
  // Fulfillment tracking
  fulfilledAt: {
    type: Date,
    default: null
  },
  fulfilledBy: {
    type: String, // Vendor email
    default: null
  },
  credentialIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCredential'
  }],
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
adminProductRequestSchema.index({ adminId: 1, createdAt: -1 });
adminProductRequestSchema.index({ vendorId: 1, status: 1 });
adminProductRequestSchema.index({ productId: 1, status: 1 });
adminProductRequestSchema.index({ status: 1, createdAt: -1 });

// Update status based on fulfillment
adminProductRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-update status based on fulfillment
  if (this.quantityFulfilled >= this.quantityRequested) {
    this.status = 'fulfilled';
    if (!this.fulfilledAt) {
      this.fulfilledAt = new Date();
    }
  } else if (this.quantityFulfilled > 0 && this.quantityFulfilled < this.quantityRequested) {
    this.status = 'partially_fulfilled';
  }
  
  next();
});

export default mongoose.model('AdminProductRequest', adminProductRequestSchema);

