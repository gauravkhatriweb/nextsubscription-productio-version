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
// WhatsApp service removed in favor of manual template copy in admin UI

/**
 * Generate a random, pronounceable password
 * 8-12 characters: letters + digits, no special chars
 */
const PASSWORD_ALGORITHM = 'aes-256-cbc';

let cachedEncryptionKey = null;

const deriveKeyBuffer = (rawKey) => {
  if (!rawKey) {
    throw new Error('ENCRYPTION_KEY must be defined in the environment');
  }

  const trimmed = rawKey.trim();

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }

  if (/^[A-Za-z0-9+/]{43}=*$/.test(trimmed)) {
    return Buffer.from(trimmed, 'base64');
  }

  return Buffer.from(trimmed, 'utf8');
};

const getPasswordEncryptionKey = () => {
  if (cachedEncryptionKey) {
    return cachedEncryptionKey;
  }

  const rawKey = process.env.ENCRYPTION_KEY;
  const buffer = deriveKeyBuffer(rawKey);

  if (!buffer || buffer.length < 32) {
    throw new Error('ENCRYPTION_KEY must resolve to a 32-byte value (use 32 ASCII chars, 32-byte base64, or 64-char hex)');
  }

  cachedEncryptionKey = buffer.subarray(0, 32);
  return cachedEncryptionKey;
};

const encryptPassword = (plaintext) => {
  if (!plaintext) return null;
  try {
    const key = getPasswordEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(PASSWORD_ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Failed to encrypt vendor password:', error.message);
    return null;
  }
};

const decryptPassword = (encrypted) => {
  if (!encrypted) return null;
  try {
    const [ivHex, data] = encrypted.split(':');
    if (!ivHex || !data) {
      throw new Error('Invalid encrypted password format');
    }
    const key = getPasswordEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(PASSWORD_ALGORITHM, key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt vendor password:', error.message);
    return null;
  }
};

const PASSWORD_AUDIT_ACTIONS = ['password_generated', 'password_reset', 'credentials_sent'];

const extractPasswordFromAuditDetails = (details) => {
  if (!details) {
    return null;
  }

  if (typeof details.password === 'string' && details.password.trim()) {
    return details.password.trim();
  }

  if (typeof details.temporaryPassword === 'string' && details.temporaryPassword.trim()) {
    return details.temporaryPassword.trim();
  }

  if (typeof details.passwordEncrypted === 'string' && details.passwordEncrypted.trim()) {
    return decryptPassword(details.passwordEncrypted.trim());
  }

  return null;
};

const hydrateAdminPasswords = async (vendors = []) => {
  if (!Array.isArray(vendors) || vendors.length === 0) {
    return vendors;
  }

  const vendorMeta = vendors.map((vendor) => {
    const decrypted = decryptPassword(vendor.adminPasswordEncrypted);
    return {
      vendor,
      vendorId: vendor._id?.toString() || null,
      decrypted,
      hasEncryptedValue: Boolean(vendor.adminPasswordEncrypted)
    };
  });

  const missingMeta = vendorMeta.filter((meta) => !meta.decrypted && meta.vendorId);

  let fallbackMap = new Map();
  if (missingMeta.length > 0) {
    const missingIds = missingMeta.map((meta) => meta.vendor._id);
    const fallbackAudits = await VendorAuditModel.aggregate([
      {
        $match: {
          vendorId: { $in: missingIds },
          action: { $in: PASSWORD_AUDIT_ACTIONS }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$vendorId',
          details: { $first: '$details' },
          action: { $first: '$action' },
          createdAt: { $first: '$createdAt' }
        }
      }
    ]);

    fallbackMap = new Map(
      fallbackAudits.map((entry) => {
        const fallbackPassword = extractPasswordFromAuditDetails(entry.details);
        return [entry._id.toString(), fallbackPassword || null];
      })
    );
  }

  const updatePromises = [];

  const sanitizedVendors = vendorMeta.map((meta) => {
    let password = meta.decrypted;

    if (!password && meta.vendorId && fallbackMap.has(meta.vendorId)) {
      const fallbackPassword = fallbackMap.get(meta.vendorId);
      if (fallbackPassword) {
        password = fallbackPassword;

        if (!meta.hasEncryptedValue) {
          const encrypted = encryptPassword(fallbackPassword);
          if (encrypted) {
            updatePromises.push(
              VendorModel.updateOne(
                { _id: meta.vendor._id },
                { adminPasswordEncrypted: encrypted }
              ).exec()
            );
          }
        }
      }
    }

    const { adminPasswordEncrypted, ...rest } = meta.vendor;
    return {
      ...rest,
      adminPassword: password || null
    };
  });

  if (updatePromises.length > 0) {
    await Promise.allSettled(updatePromises);
  }

  return sanitizedVendors;
};

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
    
    const encryptedPassword = encryptPassword(temporaryPassword);
    if (!encryptedPassword) {
      throw new Error('Unable to secure vendor password. Please verify ENCRYPTION_KEY configuration.');
    }

    // Create vendor
    const vendor = new VendorModel({
      ...vendorData,
      primaryEmail: vendorData.primaryEmail.toLowerCase(),
      passwordHash,
      adminPasswordEncrypted: encryptedPassword,
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
    
    // WhatsApp link generation removed (manual copy in Admin only)
    
    // Log audit with password (admin-only, stored in audit log for retrieval)
    await VendorAuditModel.create({
      vendorId: vendor._id,
      adminId: adminEmail,
      action: 'password_generated',
      details: {
        companyName: vendor.companyName,
        email: vendor.primaryEmail,
        passwordEncrypted: encryptedPassword,
        status: vendor.status,
        emailSent: notificationOptions.sendEmail !== false
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
        emailSent: notificationOptions.sendEmail !== false
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
      // WhatsApp URL removed
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
    
    const hydrated = await hydrateAdminPasswords(vendors);

    return hydrated.map(({ adminPassword, ...rest }) => ({
      ...rest,
      adminPasswordAvailable: Boolean(adminPassword)
    }));
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

    const [hydratedVendor] = await hydrateAdminPasswords([vendor]);

    let sanitizedVendor = {
      ...vendor,
      adminPasswordAvailable: false
    };

    if (hydratedVendor) {
      const { adminPassword, ...rest } = hydratedVendor;
      sanitizedVendor = {
        ...rest,
        adminPasswordAvailable: Boolean(adminPassword)
      };
    }

    return {
      vendor: sanitizedVendor,
      auditLog
    };
  } catch (error) {
    throw error;
  }
};

export const getVendorPasswordForAdmin = async (vendorId, adminEmail, ipAddress, userAgent) => {
  try {
    const vendor = await VendorModel.findById(vendorId)
      .select('adminPasswordEncrypted companyName primaryEmail status initialPasswordSet')
      .lean();

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    let password = decryptPassword(vendor.adminPasswordEncrypted);
    let source = 'encrypted_store';

    if (!password) {
      const fallbackAudit = await VendorAuditModel.findOne({
        vendorId,
        action: { $in: PASSWORD_AUDIT_ACTIONS }
      })
        .sort({ createdAt: -1 })
        .lean();

      if (fallbackAudit) {
        password = extractPasswordFromAuditDetails(fallbackAudit.details);
        source = `audit:${fallbackAudit.action}`;

        if (password && !vendor.adminPasswordEncrypted) {
          const encrypted = encryptPassword(password);
          if (encrypted) {
            await VendorModel.updateOne(
              { _id: vendorId },
              { adminPasswordEncrypted: encrypted }
            ).exec();
          }
        }
      }
    }

    if (!password) {
      throw new Error('Password not available. Reset the password to generate a new one.');
    }

    const maskedPassword = password.length <= 4
      ? '•'.repeat(password.length)
      : `${'•'.repeat(Math.max(0, password.length - 4))}${password.slice(-4)}`;

    await VendorAuditModel.create({
      vendorId,
      adminId: adminEmail,
      action: 'password_viewed',
      details: {
        method: source,
        masked: maskedPassword,
        initialPasswordSet: vendor.initialPasswordSet,
        status: vendor.status,
        email: vendor.primaryEmail
      },
      ipAddress,
      userAgent
    });

    return {
      password,
      method: source,
      initialPasswordSet: vendor.initialPasswordSet
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
        emailSent: notificationOptions.sendEmail !== false
      },
      ipAddress,
      userAgent
    });
    
    return {
      vendor: vendor.toObject({ transform: (doc, ret) => {
        delete ret.passwordHash;
        return ret;
      }})
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
    const encryptedPassword = encryptPassword(temporaryPassword);
    if (!encryptedPassword) {
      throw new Error('Unable to secure vendor password. Please verify ENCRYPTION_KEY configuration.');
    }

    vendor.passwordHash = await VendorModel.hashPassword(temporaryPassword);
    vendor.adminPasswordEncrypted = encryptedPassword;
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
    
    // WhatsApp link generation removed (manual copy in Admin only)
    
    // Log audit
    await VendorAuditModel.create({
      vendorId: vendor._id,
      adminId: adminEmail,
      action: 'credentials_sent',
      details: {
        email: vendor.primaryEmail,
        emailSent: notificationOptions.sendEmail !== false,
        passwordEncrypted: encryptedPassword
      },
      ipAddress,
      userAgent
    });
    
    return {
      success: true,
      message: 'Credentials sent successfully',
      temporaryPassword,
      // WhatsApp URL removed
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
    const encryptedPassword = encryptPassword(temporaryPassword);
    if (!encryptedPassword) {
      throw new Error('Unable to secure vendor password. Please verify ENCRYPTION_KEY configuration.');
    }

    vendor.passwordHash = await VendorModel.hashPassword(temporaryPassword);
    vendor.adminPasswordEncrypted = encryptedPassword;
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
        password: temporaryPassword, // Legacy support for existing audit readers
        passwordEncrypted: encryptedPassword
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

