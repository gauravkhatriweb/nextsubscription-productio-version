/**
 * Vendor Order Controller
 * 
 * Handles order management for vendors.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import OrderModel from '../models/order.model.js';

/**
 * Get Orders List
 * 
 * @route GET /api/vendor/orders
 */
export const getOrders = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const query = { vendorId: req.vendor._id };

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await OrderModel.find(query)
      .populate('customerId', 'email firstName lastName')
      .populate('items.productId', 'title provider')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await OrderModel.countDocuments(query);
    const pending = await OrderModel.countDocuments({ ...query, status: 'pending' });
    
    // Calculate total revenue
    const revenueOrders = await OrderModel.find({ ...query, paymentStatus: 'paid' });
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return res.status(200).json({
      success: true,
      orders,
      total,
      pending,
      totalRevenue,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

/**
 * Get Order by ID
 * 
 * @route GET /api/vendor/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.findOne({
      _id: req.params.id,
      vendorId: req.vendor._id
    })
      .populate('customerId', 'email firstName lastName')
      .populate('items.productId', 'title provider serviceType');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

/**
 * Update Order Status (Fulfillment)
 * 
 * @route PUT /api/vendor/orders/:id/fulfill
 */
export const fulfillOrder = async (req, res) => {
  try {
    const { status, fulfillmentNotes, trackingInfo } = req.body;
    const order = await OrderModel.findOne({
      _id: req.params.id,
      vendorId: req.vendor._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status || 'in_progress';
    order.fulfillmentStatus = 'completed';
    order.fulfillmentNotes = fulfillmentNotes || '';
    order.trackingInfo = trackingInfo || '';
    order.fulfilledAt = new Date();
    order.fulfilledBy = req.vendor._id;

    if (status === 'fulfilled') {
      order.status = 'fulfilled';
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order fulfilled successfully',
      order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fulfill order'
    });
  }
};

