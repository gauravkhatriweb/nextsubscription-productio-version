/**
 * Admin Product Credential Controller
 * 
 * Handles admin operations on product credentials (decrypt, approve, reject).
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import ProductCredentialModel from '../models/productCredential.model.js';
import ProductCredentialAuditModel from '../models/productCredentialAudit.model.js';
import AdminProductRequestModel from '../models/adminProductRequest.model.js';
import ProductModel from '../models/product.model.js';
import VendorModel from '../models/vendor.model.js';
import { decryptCredentials } from '../controllers/vendor.productCredential.controller.js';
import { sendEmail } from '../services/email.service.js';

/**
 * Get Credentials for Admin Product Request
 * 
 * @route GET /api/admin/product-requests/:requestId/credentials
 */
export const getRequestCredentials = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminEmail = req.admin?.email || null;

    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Find the admin request
    const adminRequest = await AdminProductRequestModel.findById(requestId);
    if (!adminRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Get credentials linked to this request
    const credentials = await ProductCredentialModel.find({
      adminRequestId: requestId,
      isValid: true
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      credentials: credentials.map(c => ({
        _id: c._id,
        credentialType: c.credentialType,
        totalCount: c.totalCount,
        assignedCount: c.assignedCount,
        availableCount: c.availableCount,
        batchNumber: c.batchNumber,
        accountEmail: c.accountEmail,
        profiles: c.profiles,
        createdAt: c.createdAt,
        createdBy: c.createdBy
      })),
      request: {
        _id: adminRequest._id,
        quantityRequested: adminRequest.quantityRequested,
        quantityFulfilled: adminRequest.quantityFulfilled,
        status: adminRequest.status
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials'
    });
  }
};

/**
 * Decrypt Credential (Admin Only)
 * 
 * @route GET /api/admin/product-requests/:requestId/credentials/:credentialId/decrypt
 */
export const decryptCredential = async (req, res) => {
  try {
    const { requestId, credentialId } = req.params;
    const adminEmail = req.admin?.email || null;

    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Find credential
    const credential = await ProductCredentialModel.findOne({
      _id: credentialId,
      adminRequestId: requestId,
      isValid: true
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Decrypt the credential
    const decryptedData = decryptCredentials(credential.payloadEncrypted);

    // Create audit entry
    await ProductCredentialAuditModel.create({
      credentialId: credential._id,
      productId: credential.productId,
      vendorId: credential.vendorId,
      action: 'decrypted',
      actorId: adminEmail,
      actorType: 'admin',
      details: {
        adminRequestId: requestId,
        credentialType: credential.credentialType
      },
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    return res.status(200).json({
      success: true,
      credential: {
        _id: credential._id,
        credentialType: credential.credentialType,
        decryptedData,
        totalCount: credential.totalCount,
        assignedCount: credential.assignedCount,
        availableCount: credential.availableCount,
        batchNumber: credential.batchNumber,
        createdAt: credential.createdAt
      }
    });
  } catch (error) {
    console.error('Error decrypting credential:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to decrypt credential'
    });
  }
};

/**
 * Approve Credentials for Admin Request
 * 
 * @route POST /api/admin/product-requests/:requestId/credentials/:credentialId/approve
 */
export const approveCredential = async (req, res) => {
  try {
    const { requestId, credentialId } = req.params;
    const adminEmail = req.admin?.email || null;
    const { comment } = req.body;

    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Find credential and request
    const credential = await ProductCredentialModel.findOne({
      _id: credentialId,
      adminRequestId: requestId,
      isValid: true
    });

    const adminRequest = await AdminProductRequestModel.findById(requestId);

    if (!credential || !adminRequest) {
      return res.status(404).json({
        success: false,
        message: 'Credential or request not found'
      });
    }

    // Mark credential as approved (you might want to add an approved field)
    // For now, we'll just create an audit entry and update the product stock
    const product = await ProductModel.findById(credential.productId);
    if (product) {
      // Add credentials to product stock
      product.stock = (product.stock || 0) + credential.availableCount;
      await product.save();
    }

    // Create audit entry
    await ProductCredentialAuditModel.create({
      credentialId: credential._id,
      productId: credential.productId,
      vendorId: credential.vendorId,
      action: 'approved',
      actorId: adminEmail,
      actorType: 'admin',
      details: {
        adminRequestId: requestId,
        comment: comment || null
      },
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    // Notify vendor of approval
    try {
      const vendor = await VendorModel.findById(credential.vendorId);
      if (vendor) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Credential Approved</h2>
            <p>Hello ${vendor.displayName || vendor.companyName},</p>
            <p>Your uploaded credentials for the admin stock request have been approved and added to the product inventory.</p>
            <p>Request ID: #${requestId.toString().slice(-8)}</p>
            <p>Credential Batch: #${credential.batchNumber}</p>
            ${comment ? `<p>Admin Comment: ${comment}</p>` : ''}
            <p>Thank you for your prompt fulfillment.</p>
          </body>
          </html>
        `;
        await sendEmail(
          vendor.primaryEmail,
          'Credential Approved - Admin Stock Request',
          emailHtml
        );
      }
    } catch (emailError) {
      console.error('Failed to send approval notification:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Credentials approved successfully',
      credential: {
        _id: credential._id,
        credentialType: credential.credentialType,
        totalCount: credential.totalCount,
        availableCount: credential.availableCount
      }
    });
  } catch (error) {
    console.error('Error approving credential:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve credential'
    });
  }
};

/**
 * Reject Credential
 * 
 * @route POST /api/admin/product-requests/:requestId/credentials/:credentialId/reject
 */
export const rejectCredential = async (req, res) => {
  try {
    const { requestId, credentialId } = req.params;
    const adminEmail = req.admin?.email || null;
    const { reason } = req.body;

    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Find credential
    const credential = await ProductCredentialModel.findOne({
      _id: credentialId,
      adminRequestId: requestId,
      isValid: true
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Mark as invalid
    credential.isValid = false;
    credential.notes = reason.trim();
    await credential.save();

    // Update admin request - reduce fulfilled count
    const adminRequest = await AdminProductRequestModel.findById(requestId);
    if (adminRequest) {
      adminRequest.quantityFulfilled = Math.max(0, (adminRequest.quantityFulfilled || 0) - credential.totalCount);
      if (adminRequest.quantityFulfilled < adminRequest.quantityRequested) {
        adminRequest.status = adminRequest.quantityFulfilled > 0 ? 'partially_fulfilled' : 'requested';
      }
      await adminRequest.save();
    }

    // Create audit entry
    await ProductCredentialAuditModel.create({
      credentialId: credential._id,
      productId: credential.productId,
      vendorId: credential.vendorId,
      action: 'rejected',
      actorId: adminEmail,
      actorType: 'admin',
      details: {
        adminRequestId: requestId,
        reason: reason.trim()
      },
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    // Notify vendor of rejection
    try {
      const vendor = await VendorModel.findById(credential.vendorId);
      if (vendor) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Credential Rejected</h2>
            <p>Hello ${vendor.displayName || vendor.companyName},</p>
            <p>Your uploaded credentials for the admin stock request have been rejected.</p>
            <p>Request ID: #${requestId.toString().slice(-8)}</p>
            <p>Credential Batch: #${credential.batchNumber}</p>
            <p><strong>Reason:</strong> ${reason.trim()}</p>
            <p>Please review the reason and upload corrected credentials if needed.</p>
          </body>
          </html>
        `;
        await sendEmail(
          vendor.primaryEmail,
          'Credential Rejected - Admin Stock Request',
          emailHtml
        );
      }
    } catch (emailError) {
      console.error('Failed to send rejection notification:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Credential rejected successfully',
      credential: {
        _id: credential._id,
        isValid: credential.isValid,
        notes: credential.notes
      }
    });
  } catch (error) {
    console.error('Error rejecting credential:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject credential'
    });
  }
};

