/**
 * Admin Vendor Controller
 * 
 * Handles vendor management endpoints for admin dashboard.
 * All endpoints require admin authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  updateVendorStatus,
  resendCredentials,
  resetVendorPassword
} from '../services/vendor.service.js';

/**
 * Create Vendor
 * 
 * @route POST /api/admin/vendors
 */
export const createVendorController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Extract notification preferences (don't send notes to vendor)
    const { sendEmail: sendEmailNotification, sendWhatsApp, whatsappNumber, ...vendorData } = req.body;
    
    // Remove notes from vendor data (admin-only)
    delete vendorData.notes;
    
    const result = await createVendor(
      vendorData,
      adminEmail,
      ipAddress,
      userAgent,
      {
        sendEmail: sendEmailNotification !== false, // Default to true
        sendWhatsApp: sendWhatsApp === true,
        whatsappNumber
      }
    );
    
    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create vendor'
    });
  }
};

/**
 * Get Vendors List
 * 
 * @route GET /api/admin/vendors
 */
export const getVendorsController = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    
    const vendors = await getVendors(filters);
    
    return res.status(200).json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors'
    });
  }
};

/**
 * Get Vendor by ID
 * 
 * @route GET /api/admin/vendors/:id
 */
export const getVendorByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getVendorById(id);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || 'Vendor not found'
    });
  }
};

/**
 * Update Vendor
 * 
 * @route PUT /api/admin/vendors/:id
 */
export const updateVendorController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminEmail = req.admin?.email || null;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const vendor = await updateVendor(id, req.body, adminEmail, ipAddress, userAgent);
    
    return res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update vendor'
    });
  }
};

/**
 * Update Vendor Status
 * 
 * @route PUT /api/admin/vendors/:id/status
 */
export const updateVendorStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, sendEmail: sendEmailNotification, sendWhatsApp, whatsappNumber } = req.body;
    
    if (!['pending', 'active', 'suspended', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const adminEmail = req.admin?.email || null;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await updateVendorStatus(
      id,
      status,
      adminEmail,
      ipAddress,
      userAgent,
      {
        sendEmail: sendEmailNotification !== false,
        sendWhatsApp: sendWhatsApp === true,
        whatsappNumber,
        rejectionReason
      }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Vendor status updated successfully',
      data: result.vendor,
      whatsappUrl: result.whatsappUrl
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update vendor status'
    });
  }
};

/**
 * Resend Credentials
 * 
 * @route POST /api/admin/vendors/:id/resend-credentials
 */
export const resendCredentialsController = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmail: sendEmailNotification, sendWhatsApp, whatsappNumber } = req.body;
    const adminEmail = req.admin?.email || null;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await resendCredentials(
      id,
      adminEmail,
      ipAddress,
      userAgent,
      {
        sendEmail: sendEmailNotification !== false,
        sendWhatsApp: sendWhatsApp === true,
        whatsappNumber
      }
    );
    
    return res.status(200).json({
      success: true,
      message: result.message,
      temporaryPassword: result.temporaryPassword,
      whatsappUrl: result.whatsappUrl
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to resend credentials'
    });
  }
};

/**
 * Reset Vendor Password
 * 
 * @route POST /api/admin/vendors/:id/reset-password
 */
export const resetVendorPasswordController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminEmail = req.admin?.email || null;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await resetVendorPassword(id, adminEmail, ipAddress, userAgent);
    
    return res.status(200).json({
      success: true,
      message: result.message,
      password: result.password // Return password to admin
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
};

