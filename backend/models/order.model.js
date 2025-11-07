/**
 * Order Model
 * 
 * Schema for customer orders and vendor fulfillment tracking.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productTitle: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  currency: { type: String, required: true }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'fulfilled', 'disputed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  // Fulfillment details
  fulfillmentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  fulfillmentNotes: { type: String, default: '' },
  trackingInfo: { type: String, default: '' },
  fulfilledAt: { type: Date, default: null },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: '' },
  // Dispute/Refund
  disputeReason: { type: String, default: null },
  refundAmount: { type: Number, default: null },
  refundedAt: { type: Date, default: null },
  // Metadata
  customerEmail: { type: String, required: true },
  customerNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber && this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Order', orderSchema);

