/**
 * Vendor Report Controller
 * 
 * Handles reports and payouts for vendor.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import OrderModel from '../models/order.model.js';
import ProductModel from '../models/product.model.js';

/**
 * Get Sales Report
 * 
 * @route GET /api/vendor/reports/sales
 */
export const getSalesReport = async (req, res) => {
  try {
    const { range = '30d', startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
      dateFilter.createdAt = {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      };
    }

    const orders = await OrderModel.find({
      vendorId: req.vendor._id,
      paymentStatus: 'paid',
      ...dateFilter
    }).populate('items.productId', 'title provider');

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const platformFee = totalSales * 0.15; // 15% platform fee
    const netPayout = totalSales - platformFee;

    // Group by product
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productTitle = item.productId?.title || 'Unknown';
        if (!productSales[productTitle]) {
          productSales[productTitle] = { quantity: 0, revenue: 0 };
        }
        productSales[productTitle].quantity += item.quantity;
        productSales[productTitle].revenue += item.price * item.quantity;
      });
    });

    return res.status(200).json({
      success: true,
      report: {
        period: range,
        totalSales,
        totalOrders,
        platformFee,
        netPayout,
        productSales: Object.entries(productSales).map(([product, data]) => ({
          product,
          quantity: data.quantity,
          revenue: data.revenue
        })),
        orders: orders.map(order => ({
          orderNumber: order.orderNumber,
          date: order.createdAt,
          amount: order.totalAmount,
          status: order.status
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate sales report'
    });
  }
};

/**
 * Get Payouts
 * 
 * @route GET /api/vendor/reports/payouts
 */
export const getPayouts = async (req, res) => {
  try {
    // In production, this would query a payouts table
    // For now, calculate from orders
    const orders = await OrderModel.find({
      vendorId: req.vendor._id,
      paymentStatus: 'paid'
    }).sort({ createdAt: -1 });

    const totalEarnings = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const platformFees = totalEarnings * 0.15;
    const totalPayouts = totalEarnings - platformFees;

    // Simulate payout schedule (daily/weekly/monthly)
    const payoutSchedule = 'weekly'; // Would come from vendor settings

    return res.status(200).json({
      success: true,
      payouts: {
        totalEarnings,
        platformFees,
        totalPayouts,
        pendingPayout: totalPayouts, // Simplified
        payoutSchedule,
        nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        payoutHistory: [] // Would come from payouts table
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payouts'
    });
  }
};

/**
 * Export Report (CSV/PDF)
 * 
 * @route GET /api/vendor/reports/export
 */
export const exportReport = async (req, res) => {
  try {
    const { format = 'csv', range = '30d' } = req.query;
    
    // Get sales data
    const reportRes = await getSalesReport(req, res);
    // Note: In production, generate actual CSV/PDF file
    // For now, return JSON that frontend can convert
    
    return res.status(200).json({
      success: true,
      message: 'Report export initiated',
      format,
      downloadUrl: `/api/vendor/reports/download/${Date.now()}.${format}`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to export report'
    });
  }
};

