/**
 * Vendor Product Credential Controller
 * 
 * Handles credential upload and management for approved products.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import ProductModel from '../models/product.model.js';
import ProductRequestModel from '../models/productRequest.model.js';
import ProductCredentialModel from '../models/productCredential.model.js';
import ProductCredentialAuditModel from '../models/productCredentialAudit.model.js';
import crypto from 'crypto';
import csv from 'csv-parser';
import { Readable } from 'stream';
import multer from 'multer';

// Encryption for credentials (using AES-256-GCM for authenticated encryption)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY environment variable must be set and at least 32 characters long');
  }
  // Use first 32 bytes
  return Buffer.from(key.slice(0, 32), 'utf8');
};

const encryptCredentials = (data) => {
  if (!data) return null;
  try {
    const algorithm = 'aes-256-gcm';
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    const plaintext = JSON.stringify(data);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Store: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt credentials');
  }
};

const decryptCredentials = (encrypted) => {
  if (!encrypted) return null;
  try {
    const algorithm = 'aes-256-gcm';
    const key = getEncryptionKey();
    const parts = encrypted.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt credentials');
  }
};

/**
 * Parse CSV file for credentials
 */
const parseCSV = (fileBuffer, serviceType, provider) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    
    const stream = Readable.from(fileBuffer);
    
    stream
      .pipe(csv())
      .on('data', (row) => {
        try {
          if (serviceType === 'account_share') {
            // CSV format: accountEmail, accountPassword, profile1Name, profile1Pin, profile2Name, profile2Pin, ...
            const accountEmail = row.accountEmail || row['Account Email'] || row.email;
            const accountPassword = row.accountPassword || row['Account Password'] || row.password;
            
            if (!accountEmail || !accountPassword) {
              errors.push({ row, error: 'Missing accountEmail or accountPassword' });
              return;
            }
            
            // Extract profiles
            const profiles = [];
            let profileIndex = 1;
            
            while (true) {
              const profileNameKey = `profile${profileIndex}Name` || `Profile ${profileIndex} Name`;
              const profilePinKey = `profile${profileIndex}Pin` || `Profile ${profileIndex} Pin`;
              
              const profileName = row[`profile${profileIndex}Name`] || row[`Profile ${profileIndex} Name`] || row[`profile${profileIndex}_name`];
              const profilePin = row[`profile${profileIndex}Pin`] || row[`Profile ${profileIndex} Pin`] || row[`profile${profileIndex}_pin`] || null;
              
              if (!profileName) break;
              
              // PIN is mandatory for Netflix
              if (provider === 'netflix' && !profilePin) {
                errors.push({ row, error: `Profile ${profileIndex} missing PIN (required for Netflix)` });
                return;
              }
              
              profiles.push({
                profileName: profileName.trim(),
                pin: profilePin ? profilePin.trim() : null
              });
              
              profileIndex++;
            }
            
            if (profiles.length === 0) {
              errors.push({ row, error: 'No profiles found' });
              return;
            }
            
            results.push({
              accountEmail: accountEmail.trim(),
              accountPassword: accountPassword.trim(),
              profiles
            });
            
          } else if (serviceType === 'email_invite') {
            const email = row.email || row['Email'];
            if (!email) {
              errors.push({ row, error: 'Missing email' });
              return;
            }
            results.push({
              email: email.trim(),
              available: true
            });
            
          } else if (serviceType === 'license_key') {
            const key = row.key || row['License Key'] || row.licenseKey;
            if (!key) {
              errors.push({ row, error: 'Missing license key' });
              return;
            }
            results.push({
              key: key.trim()
            });
          }
        } catch (error) {
          errors.push({ row, error: error.message });
        }
      })
      .on('end', () => {
        resolve({ results, errors });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Upload Credentials (Manual or CSV)
 * 
 * @route POST /api/vendor/products/:id/credentials
 * @route POST /api/vendor/requests/:requestId/fulfill
 */
export const uploadCredentials = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const vendorId = req.vendor._id;
    const vendorEmail = req.vendor.primaryEmail;
    
    let product;
    let adminRequest = null;
    
    // If requestId is provided, this is a fulfillment of an admin request
    if (requestId) {
      const AdminProductRequestModel = (await import('../models/adminProductRequest.model.js')).default;
      
      adminRequest = await AdminProductRequestModel.findOne({
        _id: requestId,
        vendorId: vendorId,
        status: { $in: ['requested', 'partially_fulfilled'] }
      }).populate('productId');
      
      if (!adminRequest) {
        return res.status(404).json({
          success: false,
          message: 'Admin request not found or already fulfilled'
        });
      }
      
      // Use product from admin request
      product = await ProductModel.findOne({
        _id: adminRequest.productId._id,
        vendorId: vendorId
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    } else {
      // Regular credential upload (not tied to admin request)
      product = await ProductModel.findOne({
        _id: id,
        vendorId: vendorId
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
    }
    
    // Check if product is approved
    const productRequest = await ProductRequestModel.findOne({
      vendorId: vendorId,
      status: 'approved'
    }).sort({ createdAt: -1 });
    
    // Also check if product has approved status
    if (product.status !== 'active' && product.adminReviewStatus !== 'approved' && !productRequest) {
      return res.status(403).json({
        success: false,
        message: 'Product must be approved before loading credentials'
      });
    }
    
    // If fulfilling admin request, check remaining quantity
    if (adminRequest) {
      const remainingQuantity = adminRequest.quantityRequested - adminRequest.quantityFulfilled;
      if (remainingQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Admin request is already fully fulfilled'
        });
      }
    }
    
    const { mode, credentials, csvFile } = req.body;
    
    let parsedCredentials = [];
    let errors = [];
    
    // Handle CSV upload
    if (mode === 'csv' && req.file) {
      const fileBuffer = req.file.buffer;
      const parsed = await parseCSV(fileBuffer, product.serviceType, product.provider);
      parsedCredentials = parsed.results;
      errors = parsed.errors;
      
    } else if (mode === 'manual' && credentials) {
      // Handle manual entry
      if (!Array.isArray(credentials)) {
        return res.status(400).json({
          success: false,
          message: 'Credentials must be an array'
        });
      }
      
      // Validate manual credentials
      for (const cred of credentials) {
        if (product.serviceType === 'account_share') {
          if (!cred.accountEmail || !cred.accountPassword) {
            errors.push({ credential: cred, error: 'Missing accountEmail or accountPassword' });
            continue;
          }
          
          if (!cred.profiles || !Array.isArray(cred.profiles) || cred.profiles.length === 0) {
            errors.push({ credential: cred, error: 'At least one profile is required' });
            continue;
          }
          
          // Validate profiles - PIN required for Netflix
          for (const profile of cred.profiles) {
            if (!profile.profileName) {
              errors.push({ credential: cred, error: 'Profile missing profileName' });
              continue;
            }
            if (product.provider === 'netflix' && !profile.pin) {
              errors.push({ credential: cred, error: `Profile ${profile.profileName} missing PIN (required for Netflix)` });
              continue;
            }
          }
        } else if (product.serviceType === 'email_invite') {
          if (!cred.email) {
            errors.push({ credential: cred, error: 'Missing email' });
            continue;
          }
        } else if (product.serviceType === 'license_key') {
          if (!cred.key) {
            errors.push({ credential: cred, error: 'Missing license key' });
            continue;
          }
        }
        
        parsedCredentials.push(cred);
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid upload mode or missing credentials'
      });
    }
    
    if (parsedCredentials.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid credentials to upload',
        errors
      });
    }
    
    // Get next batch number
    const productIdForBatch = adminRequest ? adminRequest.productId._id : id;
    const lastCredential = await ProductCredentialModel.findOne({ productId: productIdForBatch })
      .sort({ batchNumber: -1 });
    const nextBatchNumber = lastCredential ? lastCredential.batchNumber + 1 : 1;
    
    // Process each credential
    const savedCredentials = [];
    const profileMetadata = [];
    
    for (const cred of parsedCredentials) {
      if (product.serviceType === 'account_share') {
        // Extract profile metadata
        const profiles = cred.profiles.map(p => ({
          profileName: p.profileName,
          pin: p.pin || null,
          isAssigned: false
        }));
        
        profileMetadata.push(...profiles);
        
        // Encrypt credentials
        const encryptedPayload = encryptCredentials({
          accountEmail: cred.accountEmail,
          accountPassword: cred.accountPassword,
          profiles: cred.profiles
        });
        
        const credential = new ProductCredentialModel({
          productId: productIdForBatch,
          vendorId: vendorId,
          credentialType: 'account_share',
          payloadEncrypted: encryptedPayload,
          profiles: profiles,
          accountEmail: cred.accountEmail, // Store masked in metadata
          totalCount: profiles.length,
          assignedCount: 0,
          availableCount: profiles.length,
          createdBy: vendorEmail,
          batchNumber: nextBatchNumber,
          adminRequestId: adminRequest ? adminRequest._id : null // Link to admin request if present
        });
        
        await credential.save();
        savedCredentials.push(credential);
        
        // Create audit entry
        await ProductCredentialAuditModel.create({
          credentialId: credential._id,
          productId: productIdForBatch,
          vendorId: vendorId,
          action: 'uploaded',
          actorId: vendorEmail,
          actorType: 'vendor',
          details: {
            batchNumber: nextBatchNumber,
            profileCount: profiles.length,
            accountEmail: cred.accountEmail, // Masked
            adminRequestId: adminRequest ? adminRequest._id.toString() : null
          },
          ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown'
        });
        
      } else if (product.serviceType === 'email_invite') {
        const encryptedPayload = encryptCredentials({
          email: cred.email,
          available: cred.available !== false
        });
        
        const credential = new ProductCredentialModel({
          productId: productIdForBatch,
          vendorId: vendorId,
          credentialType: 'email_invite',
          payloadEncrypted: encryptedPayload,
          totalCount: 1,
          assignedCount: 0,
          availableCount: 1,
          createdBy: vendorEmail,
          batchNumber: nextBatchNumber,
          adminRequestId: adminRequest ? adminRequest._id : null
        });
        
        await credential.save();
        savedCredentials.push(credential);
        
      } else if (product.serviceType === 'license_key') {
        const encryptedPayload = encryptCredentials({
          key: cred.key
        });
        
        const credential = new ProductCredentialModel({
          productId: productIdForBatch,
          vendorId: vendorId,
          credentialType: 'license_key',
          payloadEncrypted: encryptedPayload,
          totalCount: 1,
          assignedCount: 0,
          availableCount: 1,
          createdBy: vendorEmail,
          batchNumber: nextBatchNumber,
          adminRequestId: adminRequest ? adminRequest._id : null
        });
        
        await credential.save();
        savedCredentials.push(credential);
      }
    }
    
    // Update product stock (only if not fulfilling admin request, as admin requests are separate)
    if (!adminRequest) {
      const totalCredentials = savedCredentials.reduce((sum, cred) => sum + cred.totalCount, 0);
      product.stock = (product.stock || 0) + totalCredentials;
      await product.save();
    }
    
    // Calculate total credentials
    const totalCredentials = savedCredentials.reduce((sum, cred) => sum + cred.totalCount, 0);
    
    // Update admin request fulfillment if applicable
    if (adminRequest) {
      adminRequest.quantityFulfilled = (adminRequest.quantityFulfilled || 0) + totalCredentials;
      
      // Update status based on fulfillment
      if (adminRequest.quantityFulfilled >= adminRequest.quantityRequested) {
        adminRequest.status = 'fulfilled';
        adminRequest.fulfilledAt = new Date();
        adminRequest.fulfilledBy = vendorEmail;
      } else if (adminRequest.quantityFulfilled > 0) {
        adminRequest.status = 'partially_fulfilled';
      }
      
      // Link credentials to request
      adminRequest.credentialIds = adminRequest.credentialIds || [];
      savedCredentials.forEach(cred => {
        if (!adminRequest.credentialIds.includes(cred._id)) {
          adminRequest.credentialIds.push(cred._id);
        }
      });
      
      await adminRequest.save();
      
      // Create audit entry for admin request
      const AdminProductRequestAuditModel = (await import('../models/adminProductRequestAudit.model.js')).default;
      await AdminProductRequestAuditModel.create({
        requestId: adminRequest._id,
        vendorId: vendorId,
        productId: productIdForBatch,
        action: adminRequest.quantityFulfilled >= adminRequest.quantityRequested ? 'fulfilled' : 'partially_fulfilled',
        actorId: vendorEmail,
        actorType: 'vendor',
        details: {
          quantityFulfilled: totalCredentials,
          quantityRemaining: adminRequest.quantityRequested - adminRequest.quantityFulfilled,
          credentialIds: savedCredentials.map(c => c._id.toString())
        },
        ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
      
      // Notify admin of fulfillment
      try {
        const { sendEmail } = await import('../services/email.service.js');
        const { generateAdminStockFulfillmentEmail } = await import('../templates/adminStockFulfillmentEmail.template.js');
        const VendorModel = (await import('../models/vendor.model.js')).default;
        
        const vendor = await VendorModel.findById(vendorId);
        const product = await ProductModel.findById(productIdForBatch);
        
        if (vendor && product && adminRequest.adminId) {
          const emailHtml = generateAdminStockFulfillmentEmail({
            adminEmail: adminRequest.adminId,
            vendorName: vendor.displayName || vendor.companyName,
            productTitle: product.title,
            quantityRequested: adminRequest.quantityRequested,
            quantityFulfilled: adminRequest.quantityFulfilled,
            requestId: adminRequest._id,
            status: adminRequest.status
          });
          
          await sendEmail(
            adminRequest.adminId,
            `Stock Request ${adminRequest.status === 'fulfilled' ? 'Fulfilled' : 'Partially Fulfilled'} - ${product.title}`,
            emailHtml
          );
        }
      } catch (emailError) {
        console.error('Failed to send notification email to admin:', emailError);
        // Don't fail the fulfillment if email fails
      }
    } else {
      // TODO: Notify admin of credential upload (for regular uploads)
    }
    
    return res.status(201).json({
      success: true,
      message: adminRequest 
        ? `Successfully fulfilled ${totalCredentials} credential(s) for admin request`
        : `Successfully uploaded ${savedCredentials.length} credential(s)`,
      imported: savedCredentials.length,
      totalCredentials: totalCredentials,
      errors: errors.length > 0 ? errors : undefined,
      adminRequest: adminRequest ? {
        _id: adminRequest._id,
        quantityRequested: adminRequest.quantityRequested,
        quantityFulfilled: adminRequest.quantityFulfilled,
        status: adminRequest.status
      } : undefined,
      credentials: savedCredentials.map(c => ({
        _id: c._id,
        credentialType: c.credentialType,
        totalCount: c.totalCount,
        availableCount: c.availableCount,
        batchNumber: c.batchNumber,
        createdAt: c.createdAt,
        accountEmail: c.accountEmail ? maskEmail(c.accountEmail) : null
      }))
    });
  } catch (error) {
    console.error('Error uploading credentials:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload credentials'
    });
  }
};

/**
 * Get Credentials (Metadata only, no decryption)
 * 
 * @route GET /api/vendor/products/:id/credentials
 */
export const getCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendor._id;
    
    const product = await ProductModel.findOne({
      _id: id,
      vendorId: vendorId
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const credentials = await ProductCredentialModel.find({
      productId: id,
      vendorId: vendorId,
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
        accountEmail: c.accountEmail ? maskEmail(c.accountEmail) : null,
        profiles: c.profiles ? c.profiles.map(p => ({
          profileName: p.profileName,
          isAssigned: p.isAssigned,
          // Don't send PIN to vendor
        })) : null,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials'
    });
  }
};

// Helper function to mask email
const maskEmail = (email) => {
  if (!email) return null;
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = localPart.length > 2 
    ? localPart.slice(0, 2) + '*'.repeat(localPart.length - 2)
    : '*'.repeat(localPart.length);
  return `${maskedLocal}@${domain}`;
};

// Multer configuration for credential CSV uploads
const credentialUpload = multer({
  storage: multer.memoryStorage(), // Store in memory for CSV parsing
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow CSV files and other common file types
    const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'text/plain', 'application/csv'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV files are allowed.'), false);
    }
  }
});

// Export multer middleware for use in routes
export const uploadCredentialFiles = credentialUpload.single('csvFile');

// Export decrypt function for admin use
export { decryptCredentials };

