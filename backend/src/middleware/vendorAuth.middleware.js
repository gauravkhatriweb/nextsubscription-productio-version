/**
 * Vendor Authentication Middleware
 * 
 * Verifies JWT tokens for vendor authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import jwt from 'jsonwebtoken';
import VendorModel from '../models/vendor.model.js';

export const verifyVendorJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.vendorToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get vendor and check status
    const vendor = await VendorModel.findById(decoded.vendorId).select('-passwordHash');
    
    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if vendor is active
    if (vendor.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Vendor account is not active'
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

