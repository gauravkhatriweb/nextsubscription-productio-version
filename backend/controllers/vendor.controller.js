/**
 * Vendor Controller
 * 
 * Handles vendor authentication and profile operations.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import VendorModel from '../models/vendor.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

/**
 * Vendor Login
 * 
 * @route POST /api/vendor/login
 */
export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find vendor
    const vendor = await VendorModel.findOne({ primaryEmail: email.toLowerCase() });

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, vendor.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check status
    if (vendor.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Vendor account is ${vendor.status}. Please contact admin.`
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { vendorId: vendor._id, email: vendor.primaryEmail },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('vendorToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        displayName: vendor.displayName,
        email: vendor.primaryEmail,
        status: vendor.status,
        initialPasswordSet: vendor.initialPasswordSet
      },
      requiresPasswordChange: !vendor.initialPasswordSet
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Get Vendor Info
 * 
 * @route GET /api/vendor/me
 */
export const getVendorInfo = async (req, res) => {
  try {
    const vendor = await VendorModel.findById(req.vendor._id).select('-passwordHash');

    return res.status(200).json({
      success: true,
      vendor
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor info'
    });
  }
};

/**
 * Change Password (First Login Setup)
 * 
 * @route PUT /api/vendor/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const vendor = await VendorModel.findById(req.vendor._id);

    // If initial password not set, don't require current password
    if (vendor.initialPasswordSet) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required'
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, vendor.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Hash new password
    vendor.passwordHash = await VendorModel.hashPassword(newPassword);
    vendor.initialPasswordSet = true;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

/**
 * Update Vendor Profile
 * 
 * @route PUT /api/vendor/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const vendor = await VendorModel.findById(req.vendor._id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Safely destructure with defaults - handle both JSON and form-data
    const body = req.body || {};
    const displayName = body.displayName;
    const ownerName = body.ownerName;
    const whatsappNumber = body.whatsappNumber;
    const secondaryEmail = body.secondaryEmail;
    const businessHours = body.businessHours;
    const supportLink = body.supportLink;
    
    if (displayName) vendor.displayName = displayName;
    if (ownerName) {
      vendor.metadata = vendor.metadata || {};
      vendor.metadata.ownerName = ownerName;
    }
    if (whatsappNumber) {
      vendor.metadata = vendor.metadata || {};
      vendor.metadata.whatsappNumber = whatsappNumber;
    }
    if (secondaryEmail) {
      vendor.additionalEmails = vendor.additionalEmails || [];
      if (!vendor.additionalEmails.includes(secondaryEmail)) {
        vendor.additionalEmails.push(secondaryEmail);
      }
    }
    if (businessHours) {
      vendor.metadata = vendor.metadata || {};
      vendor.metadata.businessHours = businessHours;
    }
    if (supportLink) {
      vendor.metadata = vendor.metadata || {};
      vendor.metadata.supportLink = supportLink;
    }

    // Handle logo upload
    if (req.file) {
      vendor.metadata = vendor.metadata || {};
      vendor.metadata.logo = req.file.path;
    }

    await vendor.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      vendor: await VendorModel.findById(vendor._id).select('-passwordHash')
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

/**
 * Vendor Logout
 * 
 * @route POST /api/vendor/logout
 */
export const vendorLogout = async (req, res) => {
  try {
    res.clearCookie('vendorToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

