/**
 * Admin Product Request Controller
 * 
 * Handles admin requests for stock from vendor.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import AdminProductRequestModel from '../models/adminProductRequest.model.js';
import AdminProductRequestAuditModel from '../models/adminProductRequestAudit.model.js';
import ProductModel from '../models/product.model.js';
import VendorModel from '../models/vendor.model.js';
import { sendEmail } from '../services/email.service.js';
import { generateAdminStockRequestEmail } from '../templates/adminStockRequestEmail.template.js';

/**
 * Generate Email Template
 */
const generateEmailTemplate = (request, product, vendor, adminEmail) => {
  const subject = `Stock Request - ${product.title} x${request.quantityRequested}`;
  
  const body = `Hello ${vendor.displayName || vendor.companyName || 'Vendor'},

Please supply ${request.quantityRequested} unit(s) of ${product.title}${product.sku ? ` (SKU: ${product.sku})` : ''} to Next Subscription.

${request.notes ? `Delivery notes: ${request.notes}\n\n` : ''}${request.deadline ? `Deadline: ${new Date(request.deadline).toLocaleDateString()}\n\n` : ''}Please upload account credentials to your vendor portal → Requests → Request #${request._id.toString().slice(-8)}.

Thanks,
Admin - ${adminEmail}`;

  return { subject, body };
};

/**
 * Generate WhatsApp Template
 */
const generateWhatsAppTemplate = (request, product, vendor, adminEmail) => {
  return `📦 *Stock Request - Next Subscription*

Hello ${vendor.displayName || vendor.companyName || 'Vendor'},

Please supply *${request.quantityRequested} unit(s)* of:
• *${product.title}*${product.sku ? ` (SKU: ${product.sku})` : ''}

${request.notes ? `📝 Notes: ${request.notes}\n` : ''}${request.deadline ? `⏰ Deadline: ${new Date(request.deadline).toLocaleDateString()}\n` : ''}
🔗 Upload credentials: Vendor Portal → Requests → #${request._id.toString().slice(-8)}

Thanks!
Admin - ${adminEmail}`;
};

/**
 * Create Admin Product Request
 * 
 * @route POST /api/admin/vendor/:vendorId/requests
 */
export const createAdminProductRequest = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const adminEmail = req.admin?.email || null;
    const { productId, quantityRequested, notes, deadline } = req.body;

    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Validation
    if (!productId || !quantityRequested || quantityRequested < 1) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and valid quantity are required'
      });
    }

    // Verify vendor exists
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Verify product exists and belongs to vendor
    const product = await ProductModel.findOne({
      _id: productId,
      vendorId: vendorId
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or does not belong to this vendor'
      });
    }

    // Check if product is approved
    const productRequest = await ProductModel.findOne({
      _id: productId,
      vendorId: vendorId
    });

    if (product.status !== 'active' && product.adminReviewStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Product must be approved before requesting stock'
      });
    }

    // Create request
    const request = new AdminProductRequestModel({
      adminId: adminEmail,
      vendorId: vendorId,
      productId: productId,
      quantityRequested: parseInt(quantityRequested),
      notes: notes || null,
      deadline: deadline ? new Date(deadline) : null,
      status: 'requested'
    });

    // Generate templates
    const emailTemplate = generateEmailTemplate(request, product, vendor, adminEmail);
    const whatsappTemplate = generateWhatsAppTemplate(request, product, vendor, adminEmail);

    request.emailTemplate = emailTemplate;
    request.whatsappTemplate = whatsappTemplate;

    await request.save();

    // Create audit entry
    await AdminProductRequestAuditModel.create({
      requestId: request._id,
      vendorId: vendorId,
      productId: productId,
      action: 'created',
      actorId: adminEmail,
      actorType: 'admin',
      details: {
        quantityRequested: request.quantityRequested,
        notes: request.notes,
        deadline: request.deadline
      },
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    // Send notification email to vendor
    try {
      const emailHtml = generateAdminStockRequestEmail({
        companyName: vendor.displayName || vendor.companyName,
        productTitle: product.title,
        quantityRequested: request.quantityRequested,
        requestId: request._id,
        notes: request.notes,
        deadline: request.deadline,
        adminEmail: adminEmail
      });
      
      await sendEmail(
        vendor.primaryEmail,
        `Stock Request - ${product.title} x${request.quantityRequested}`,
        emailHtml
      );
    } catch (emailError) {
      console.error('Failed to send notification email to vendor:', emailError);
      // Don't fail the request creation if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Stock request created successfully',
      request: {
        _id: request._id,
        productId: request.productId,
        quantityRequested: request.quantityRequested,
        status: request.status,
        createdAt: request.createdAt
      },
      templates: {
        email: emailTemplate,
        whatsapp: whatsappTemplate
      }
    });
  } catch (error) {
    console.error('Error creating admin product request:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create stock request'
    });
  }
};

/**
 * Get Admin Product Requests
 * 
 * @route GET /api/admin/vendor/:vendorId/requests
 * @route GET /api/admin/stock-requests (all requests across all vendor)
 */
export const getAdminProductRequests = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, limit = 50, page = 1 } = req.query;

    const query = {};
    // If vendorId is provided, filter by vendor. Otherwise, get all requests
    if (vendorId && vendorId !== 'all') {
      query.vendorId = vendorId;
    }
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const requests = await AdminProductRequestModel.find(query)
      .populate('vendorId', 'companyName displayName primaryEmail')
      .populate('productId', 'title sku provider serviceType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await AdminProductRequestModel.countDocuments(query);
    const requested = await AdminProductRequestModel.countDocuments({ ...query, status: 'requested' });
    const fulfilled = await AdminProductRequestModel.countDocuments({ ...query, status: 'fulfilled' });
    const partiallyFulfilled = await AdminProductRequestModel.countDocuments({ ...query, status: 'partially_fulfilled' });

    return res.status(200).json({
      success: true,
      requests,
      total,
      requested,
      fulfilled,
      partially_fulfilled: partiallyFulfilled,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch requests'
    });
  }
};

/**
 * Get Admin Product Request by ID
 * 
 * @route GET /api/admin/vendor/:vendorId/requests/:id
 */
export const getAdminProductRequestById = async (req, res) => {
  try {
    const { vendorId, id } = req.params;

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

    return res.status(200).json({
      success: true,
      request,
      templates: {
        email: request.emailTemplate,
        whatsapp: request.whatsappTemplate
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch request'
    });
  }
};

/**
 * Get Vendor Products (Admin)
 * 
 * @route GET /api/admin/vendor/:vendorId/products
 */
export const getVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Verify vendor exists
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get approved products for this vendor
    const products = await ProductModel.find({
      vendorId: vendorId,
      $or: [
        { status: 'active' },
        { adminReviewStatus: 'approved' }
      ]
    })
      .select('-accountPassword')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor products'
    });
  }
};

/**
 * Get Templates for Request
 * 
 * @route GET /api/admin/vendor/:vendorId/requests/:id/templates
 */
export const getRequestTemplates = async (req, res) => {
  try {
    const { vendorId, id } = req.params;

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

    // Regenerate templates if needed
    const emailTemplate = request.emailTemplate || generateEmailTemplate(
      request,
      request.productId,
      request.vendorId,
      request.adminId
    );
    const whatsappTemplate = request.whatsappTemplate || generateWhatsAppTemplate(
      request,
      request.productId,
      request.vendorId,
      request.adminId
    );

    return res.status(200).json({
      success: true,
      templates: {
        email: emailTemplate,
        whatsapp: whatsappTemplate
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
};

/**
 * Cancel Admin Product Request
 * 
 * @route POST /api/admin/vendor/:vendorId/requests/:id/cancel
 */
export const cancelAdminProductRequest = async (req, res) => {
  try {
    const { vendorId, id } = req.params;
    const adminEmail = req.admin?.email || null;

    const request = await AdminProductRequestModel.findOne({
      _id: id,
      vendorId: vendorId,
      adminId: adminEmail
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status === 'fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a fulfilled request'
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Create audit entry
    await AdminProductRequestAuditModel.create({
      requestId: request._id,
      vendorId: vendorId,
      productId: request.productId,
      action: 'cancelled',
      actorId: adminEmail,
      actorType: 'admin',
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    return res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel request'
    });
  }
};
