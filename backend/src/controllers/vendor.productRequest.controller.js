/**
 * Vendor Product Request Controller
 * 
 * Handles product request submission and management for vendor.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import ProductRequestModel from '../models/productRequest.model.js';
import ProductRequestAuditModel from '../models/productRequestAudit.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer configuration for file uploads
const upload = multer({
  dest: 'uploads/product-requests/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max per file
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
    }
  }
});

/**
 * Create Product Request
 * 
 * @route POST /api/vendor/products/requests
 */
export const createProductRequest = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { title, provider, serviceType, plans, stock, warrantyDays, replacementPolicy, rules, description } = req.body;

    // Validation
    if (!title || !provider || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'Title, provider, and service type are required'
      });
    }

    // Parse plans if string (from form-data)
    let parsedPlans = plans;
    if (typeof plans === 'string') {
      try {
        parsedPlans = JSON.parse(plans);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid plans format'
        });
      }
    }

    if (!parsedPlans || !Array.isArray(parsedPlans) || parsedPlans.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one plan is required'
      });
    }

    // Validate each plan
    for (const plan of parsedPlans) {
      if (!plan.durationDays || !plan.price || !plan.currency) {
        return res.status(400).json({
          success: false,
          message: 'Each plan must have durationDays, price, and currency'
        });
      }
      if (plan.durationDays < 1 || plan.price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan values'
        });
      }
    }

    // Handle file uploads
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          url: `/uploads/product-requests/${file.filename}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
      }
    }

    // Create product request
    const productRequest = new ProductRequestModel({
      vendorId,
      title: title.trim(),
      provider,
      serviceType,
      plans: parsedPlans,
      stock: parseInt(stock) || 0,
      warrantyDays: parseInt(warrantyDays) || 0,
      replacementPolicy: replacementPolicy?.trim() || '',
      rules: rules?.trim() || '',
      description: description?.trim() || '',
      attachments,
      status: 'pending_review'
    });

    await productRequest.save();

    // Create audit entry
    await ProductRequestAuditModel.create({
      requestId: productRequest._id,
      vendorId,
      action: 'submitted',
      adminId: 'system',
      comment: 'Product request submitted by vendor',
      newStatus: 'pending_review',
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    // TODO: Send admin notification email

    return res.status(201).json({
      success: true,
      message: 'Product request submitted successfully. Awaiting admin review.',
      request: productRequest
    });
  } catch (error) {
    console.error('Error creating product request:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit product request'
    });
  }
};

/**
 * Get Product Requests (Vendor's own requests)
 * 
 * @route GET /api/vendor/products/requests
 */
export const getProductRequests = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { status, limit = 50, page = 1 } = req.query;

    const query = { vendorId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await ProductRequestModel.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ProductRequestModel.countDocuments(query);
    const pending = await ProductRequestModel.countDocuments({ ...query, status: 'pending_review' });
    const approved = await ProductRequestModel.countDocuments({ ...query, status: 'approved' });
    const rejected = await ProductRequestModel.countDocuments({ ...query, status: 'rejected' });

    return res.status(200).json({
      success: true,
      requests,
      total,
      pending,
      approved,
      rejected,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product requests'
    });
  }
};

/**
 * Get Product Request by ID
 * 
 * @route GET /api/vendor/products/requests/:id
 */
export const getProductRequestById = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { id } = req.params;

    const request = await ProductRequestModel.findOne({ _id: id, vendorId });
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Product request not found'
      });
    }

    return res.status(200).json({
      success: true,
      request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product request'
    });
  }
};

// Export multer middleware for use in routes
export const uploadProductRequestFiles = upload.array('attachments', 5);

