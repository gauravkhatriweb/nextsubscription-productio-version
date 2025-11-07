/**
 * Vendor Service
 * 
 * Business logic for vendor management operations.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import crypto from 'crypto';
import VendorModel from '../models/vendor.model.js';
import VendorAuditModel from '../models/vendorAudit.model.js';
import { sendEmail } from './email.service.js';
import { generateVendorCredentialsEmail } from '../templates/vendorEmail.template.js';
import { generateVendorRejectionEmail } from '../templates/vendorRejectionEmail.template.js';
import {
  generateWhatsAppUrl,
  generateVendorCredentialsWhatsApp,
  generateVendorRejectionWhatsApp
} from './whatsapp.service.js';

/**
 * Generate a random, pronounceable password
 * 8-12 characters: letters + digits, no special chars
 */
export const generateSecurePassword = () => {
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  const digits = '0123456789';
  
  let password = '';
  const length = Math.floor(Math.random() * 5) + 8; // 8-12 chars
  
  for (let i = 0; i < length; i++) {
    if (i % 3 === 2 && Math.random() > 0.3) {
      // Add digit every 3rd position (sometimes)
      password += digits[Math.floor(Math.random() * digits.length)];
    } else if (i % 2 === 0) {
      // Even positions: consonants
      password += consonants[Math.floor(Math.random() * consonants.length)];
    } else {
      // Odd positions: vowels
      password += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }
  
  // Ensure at least one digit
  if (!/\d/.test(password)) {
    const randomPos = Math.floor(Math.random() * password.length);
    password = password.slice(0, randomPos) + 
               digits[Math.floor(Math.random() * digits.length)] + 
               password.slice(randomPos + 1);
  }
  
  // Capitalize first letter
  password = password.charAt(0).toUpperCase() + password.slice(1);
  
  return password;
};

/**
 * Create a new vendor account
 */
export const createVendor = async (vendorData, adminEmail, ipAddress, userAgent, notificationOptions = {}) => {
  try {
    // Check if email already exists
    const existingVendor = await VendorModel.findOne({ primaryEmail: vendorData.primaryEmail.toLowerCase() });
    if (existingVendor) {
      throw new Error('Vendor with this email already exists');
    }
    
    // Generate secure password
    const temporaryPassword = generateSecurePassword();
    const passwordHash = await VendorModel.hashPassword(temporaryPassword);
    
    // Store notes separately (admin-only, not sent to vendor)
    const notes = vendorData.notes;
    delete vendorData.notes;
    
    // Create vendor
    const vendor = new VendorModel({
      ...vendorData,
      primaryEmail: vendorData.primaryEmail.toLowerCase(),
      passwordHash,
      initialPasswordSet: false,
      createdBy: adminEmail,
      status: vendorData.status || 'pending',
      notes // Store notes but don't send to vendor
    });
    
    await vendor.save();
    
    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const vendorPortalUrl = `${frontendUrl}/vendor/login`;
    
    const credentialsData = {
      companyName: vendor.companyName || vendor.displayName,
      email: vendor.primaryEmail,
      password: temporaryPassword,
      loginUrl: vendorPortalUrl
    };
    
    // Send email if requested (default: true)
    if (notificationOptions.sendEmail !== false) {
      const emailHtml = generateVendorCredentialsEmail(credentialsData);
      await sendEmail(
        vendor.primaryEmail,
        'Welcome to Next Subscription — Vendor Access',
        emailHtml
      );
    }
    
    // Generate WhatsApp URL if requested
    let whatsappUrl = null;
    if (notificationOptions.sendWhatsApp && notificationOptions.whatsappNumber) {
      const whatsappMessage = generateVendorCredentialsWhatsApp(credentialsData);
      whatsappUrl = generateWhatsAppUrl(notificationOptions.whatsappNumber, whatsappMessage);
    }
    
    // Log audit with password (admin-only, stored in audit log for retrieval)
    await VendorAuditModel.create({
      vendorId: vendor._id,
      adminId: adminEmail,
      action: 'password_generated',
      details: {
        companyName: vendor.companyName,
        email: vendor.primaryEmail,
        password: temporaryPassword, // Store in audit log for admin retrieval
        status: vendor.status,
        emailSent: notificationOptions.sendEmail !== false,
        whatsappSent: notificationOptions.sendWhatsApp === true
      },
      ipAddress,
      userAgent
    });
    
    // Also log creation
    await VendorAuditModel.create({
      vendorId: vendor._id,
      adminId: adminEmail,
      action: 'created',
      details: {
        companyName: vendor.companyName,
        email: vendor.primaryEmail,
        status: vendor.status,
        emailSent: notificationOptions.sendEmail !== false,
        whatsappSent: notificationOptions.sendWhatsApp === true
      },
      ipAddress,
      userAgent
    });
    
    return {
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        primaryEmail: vendor.primaryEmail,
        status: vendor.status,
        createdAt: vendor.createdAt
      },
      temporaryPassword, // Return for admin reference (not stored in DB directly)
      whatsappUrl // Return WhatsApp URL if generated
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get vendors list with filters
 */
export const getVendors = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.search) {
      query.$or = [
        { companyName: { $regex: filters.search, $options: 'i' } },
        { primaryEmail: { $regex: filters.search, $options: 'i' } },
        { displayName: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    const vendors = await VendorModel.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    
    return vendors;
  } catch (error) {
    throw error;
  }
};

/**
 * Get vendor by ID with audit log and admin password
 */
export const getVendorById = async (vendorId) => {
  try {
    const vendor = await VendorModel.findById(vendorId)
      .select('-passwordHash')
      .lean();
    
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    const auditLog = await VendorAuditModel.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // Get most recent password from audit log (admin-only)
    const passwordAudit = await VendorAuditModel.findOne({
      vendorId,
      action: { $in: ['password_generated', 'password_reset'] }
    })
    .sort({ createdAt: -1 })
    .lean();
    
    return {
      vendor: {
        ...vendor,
        adminPassword: passwordAudit?.details?.password || null // Admin-only password
      },
      auditLog
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update vendor details
 */
export const updateVendor = async (vendorId, updateData, adminEmail, ipAddress, userAgent) => {
  try {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    // Track changes
    const changes = {};
    Object.keys(updateData).forEach(key => {
      if (vendor[key] !== updateData[key]) {
        changes[key] = { old: vendor[key], new: updateData[key] };
      }
    });
    
    // Update vendor
    Object.assign(vendor, updateData);
    if (updateData.primaryEmail) {
      vendor.primaryEmail = updateData.primaryEmail.toLowerCase();
    }
    await vendor.save();
    
    // Log audit
    if (Object.keys(changes).length > 0) {
      await VendorAuditModel.create({
        vendorId: vendor._id,
        adminId: adminEmail,
        action: 'updated',
        details: { changes },
        ipAddress,
        userAgent
      });
    }
    
    return vendor.toObject({ transform: (doc, ret) => {
      delete ret.passwordHash;
      return ret;
    }});
  } catch (error) {
    throw error;
  }
};

/**
 * Update vendor status
 */
export const updateVendorStatus = async (vendorId, newStatus, adminEmail, ipAddress, userAgent, notificationOptions = {}) => {
  try {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    const oldStatus = vendor.status;
    vendor.status = newStatus;
    await vendor.save();
    
    // Send status change email notifications (for all status changes)
    if (notificationOptions.sendEmail !== false) {
      const { generateVendorStatusChangeEmail } = await import('../templates/vendorStatusChangeEmail.template.js');
      const statusEmailHtml = generateVendorStatusChangeEmail({
        companyName: vendor.companyName || vendor.displayName,
        status: newStatus,
        reason: notificationOptions.rejectionReason || null
      });
      
      await sendEmail(
        vendor.primaryEmail,
        `Next Subscription — Account Status: ${newStatus.toUpperCase()}`,
        statusEmailHtml
      );
    }
    
    // Log audit
    await VendorAuditModel.create({
      vendorId: vendor._id,
      adminId: adminEmail,
      action: 'status_changed',
      details: {
        oldStatus,
        newStatus,
        emailSent: notificationOptions.sendEmail !== false,
        whatsappSent: notificationOptions.sendWhatsApp === true && newStatus === 'rejected'
      },
      ipAddress,
      userAgent
    });
    
    return {
      vendor: vendor.toObject({ transform: (doc, ret) => {
        delete ret.passwordHash;
        return ret;
      }}),
      whatsappUrl
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Resend credentials email/WhatsApp
 */
export const resendCredentials = async (vendorId, adminEmail, ipAddress, userAgent, notificationOptions = {}) => {
  try {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    // Generate new password
    const temporaryPassword = generateSecurePassword();
    vendor.passwordHash = await VendorModel.hashPassword(temporaryPassword);
    vendor.initialPasswordSet = false;
    await vendor.save();
    
    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const vendorPortalUrl = `${frontendUrl}/vendor/login`;
    
    const credentialsData = {
      companyName: vendor.companyName || vendor.displayName,
      email: vendor.primaryEmail,
      password: temporaryPassword,
      loginUrl: vendorPortalUrl
    };
    
    // Send email if requested (default: true)
    if (notificationOptions.sendEmail !== false) {
      const emailHtml = generateVendorCredentialsEmail(credentialsData);
      await sendEmail(
        vendor.primaryEmail,
        'Next Subscription — Updated Vendor Access Credentials',
        emailHtml
      );
    }
    
    // Generate WhatsApp URL if requested
    let whatsappUrl = null;
    if (notificationOptions.sendWhatsApp && notificationOptions.whatsappNumber) {
      const whatsappMessage = generateVendorCredentialsWhatsApp(credentialsData);
      whatsappUrl = generateWhatsAppUrl(notificationOptions.whatsappNumber, whatsappMessage);
    }
    
    // Log audit
    await VendorAuditModel.create({
      vendorId: vendor._id,
      adminId: adminEmail,
      action: 'credentials_sent',
      details: {
        email: vendor.primaryEmail,
        emailSent: notificationOptions.sendEmail !== false,
        whatsappSent: notificationOptions.sendWhatsApp === true
      },
      ipAddress,
      userAgent
    });
    
    return {
      success: true,
      message: 'Credentials sent successfully',
      temporaryPassword,
      whatsappUrl
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Reset vendor password
 */
export const resetVendorPassword = async (vendorId, adminEmail, ipAddress, userAgent) => {
  try {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    // Generate new password
    const temporaryPassword = generateSecurePassword();
    vendor.passwordHash = await VendorModel.hashPassword(temporaryPassword);
    vendor.initialPasswordSet = false;
    await vendor.save();
    
    // Send email
    const frontendUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const vendorPortalUrl = `${frontendUrl}/vendor/login`;
    
    const emailHtml = generateVendorCredentialsEmail({
      companyName: vendor.companyName || vendor.displayName,
      email: vendor.primaryEmail,
      password: temporaryPassword,
      loginUrl: vendorPortalUrl,
      isReset: true
    });
    
    await sendEmail(
      vendor.primaryEmail,
      'Next Subscription — Password Reset',
      emailHtml
    );
    
    // Log audit with new password (admin-only)
    await VendorAuditModel.create({
      vendorId: vendor._id,
      adminId: adminEmail,
      action: 'password_reset',
      details: {
        email: vendor.primaryEmail,
        password: temporaryPassword // Store in audit log for admin retrieval
      },
      ipAddress,
      userAgent
    });
    
    return {
      success: true,
      message: 'Password reset successfully',
      password: temporaryPassword // Return password to admin
    };
  } catch (error) {
    throw error;
  }
};

