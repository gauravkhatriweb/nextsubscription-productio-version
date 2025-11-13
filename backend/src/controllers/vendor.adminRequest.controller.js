/**
 * Vendor Admin Request Controller
 * 
 * Handles vendor viewing and fulfilling admin product requests.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import AdminProductRequestModel from '../models/adminProductRequest.model.js';
import AdminProductRequestAuditModel from '../models/adminProductRequestAudit.model.js';
import ProductCredentialModel from '../models/productCredential.model.js';
import ProductModel from '../models/product.model.js';
import mongoose from 'mongoose';
import { uploadCredentials } from './vendor.productCredential.controller.js';

/**
 * Get Admin Requests for Vendor
 * 
 * @route GET /api/vendor/admin-requests
 */
export const getAdminRequests = async (req, res) => {
  try {
    // Check if vendor is authenticated
    if (!req.vendor || !req.vendor._id) {
      console.error('Vendor authentication error: req.vendor is missing');
      return res.status(401).json({
        success: false,
        message: 'Vendor authentication required'
      });
    }

    const vendorId = req.vendor._id;
    const { status, limit = 50, page = 1 } = req.query;

    console.log('Fetching admin requests for vendor:', vendorId, 'Status filter:', status);
    console.log('Vendor ID type:', typeof vendorId, 'Value:', vendorId);

    // Ensure vendorId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      console.error('Invalid vendorId format:', vendorId);
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID format'
      });
    }

    // Convert to ObjectId if it's a string
    const vendorObjectId = typeof vendorId === 'string' ? new mongoose.Types.ObjectId(vendorId) : vendorId;

    const query = { vendorId: vendorObjectId };
    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('Query:', JSON.stringify(query));

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find requests with proper error handling
    // Use populate with null handling in case product is deleted
    const requests = await AdminProductRequestModel.find(query)
      .populate({
        path: 'productId',
        select: 'title sku provider serviceType',
        options: { lean: true }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Use lean() for better performance

    // Filter out requests with null productId (in case product was deleted)
    const validRequests = requests.filter(req => req.productId !== null);

    // Get counts
    const total = await AdminProductRequestModel.countDocuments(query);
    const pending = await AdminProductRequestModel.countDocuments({ ...query, status: 'requested' });
    const fulfilled = await AdminProductRequestModel.countDocuments({ ...query, status: 'fulfilled' });

    console.log(`Found ${validRequests.length} valid requests out of ${total} total for vendor ${vendorId}`);

    // Always return success with empty array if no requests found
    return res.status(200).json({
      success: true,
      requests: validRequests || [],
      total: total || 0,
      pending: pending || 0,
      fulfilled: fulfilled || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      vendorId: req.vendor?._id
    });
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin requests',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get Admin Request by ID
 * 
 * @route GET /api/vendor/admin-requests/:id
 */
export const getAdminRequestById = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { id } = req.params;

    const request = await AdminProductRequestModel.findOne({
      _id: id,
      vendorId: vendorId
    })
      .populate('productId')
      .populate('vendorId', 'companyName displayName primaryEmail');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Get audit history
    const auditLog = await AdminProductRequestAuditModel.find({ requestId: id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      request,
      auditLog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch request'
    });
  }
};

/**
 * Fulfill Admin Request
 * 
 * This endpoint redirects to the credential upload endpoint with requestId
 * The actual fulfillment happens in uploadCredentials when requestId is provided
 * 
 * @route POST /api/vendor/admin-requests/:id/fulfill
 */
export const fulfillAdminRequest = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const vendorEmail = req.vendor.primaryEmail;
    const { id } = req.params;

    // Find request
    const request = await AdminProductRequestModel.findOne({
      _id: id,
      vendorId: vendorId,
      status: { $in: ['requested', 'partially_fulfilled'] }
    })
      .populate('productId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or already fulfilled'
      });
    }

    // Verify product exists and is approved
    const product = await ProductModel.findOne({
      _id: request.productId._id,
      vendorId: vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active' && product.adminReviewStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Product must be approved before fulfilling requests'
      });
    }

    // Calculate remaining quantity needed
    const remainingQuantity = request.quantityRequested - request.quantityFulfilled;
    if (remainingQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Request is already fully fulfilled'
      });
    }

    // Return request details for UI to use credential upload endpoint
    return res.status(200).json({
      success: true,
      request: {
        _id: request._id,
        productId: request.productId._id,
        productTitle: request.productId.title,
        quantityRequested: request.quantityRequested,
        quantityFulfilled: request.quantityFulfilled,
        remainingQuantity: remainingQuantity,
        status: request.status,
        notes: request.notes,
        deadline: request.deadline
      },
      product: {
        _id: product._id,
        title: product.title,
        serviceType: product.serviceType,
        provider: product.provider
      }
    });

  } catch (error) {
    console.error('Error getting admin request for fulfillment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get request details'
    });
  }
};

/**
 * Reject Admin Request
 * 
 * @route POST /api/vendor/admin-requests/:id/reject
 */
export const rejectAdminRequest = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const vendorEmail = req.vendor.primaryEmail;
    const { id } = req.params;
    const { reason } = req.body;

    const request = await AdminProductRequestModel.findOne({
      _id: id,
      vendorId: vendorId,
      status: 'requested'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or cannot be rejected'
      });
    }

    request.status = 'rejected';
    await request.save();

    // Create audit entry
    await AdminProductRequestAuditModel.create({
      requestId: request._id,
      vendorId: vendorId,
      productId: request.productId,
      action: 'rejected',
      actorId: vendorEmail,
      actorType: 'vendor',
      details: {
        reason: reason || null
      },
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    // TODO: Notify admin

    return res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject request'
    });
  }
};

