/**
 * Admin Controller - Admin Authentication Handlers
 * 
 * Handles admin one-time code generation, email sending, and verification.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import { 
  generateSecret, 
  hashSecret, 
  saveAdminCode, 
  verifySecret, 
  createExpirationDate 
} from '../services/adminCode.service.js';
import { sendEmail } from '../services/email.service.js';
import { getAdminCodeEmailHTML } from '../templates/adminEmail.template.js';
import jwt from 'jsonwebtoken';

// Admin email from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gauravkhatriweb@gmail.com';

/**
 * Controller: Request Admin Code
 * 
 * Generates a secure one-time code and emails it to the admin.
 * Only accepts requests for the configured ADMIN_EMAIL.
 * 
 * @route POST /api/admin/request-code
 * @public (but rate limited)
 */
export const requestAdminCode = async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Security: Only allow ADMIN_EMAIL
    if (normalizedEmail !== ADMIN_EMAIL.toLowerCase().trim()) {
      return res.status(403).json({
        success: false,
        message: 'Only the admin email can request admin code'
      });
    }
    
    // Generate secure secret code
    const secret = generateSecret();
    
    // Hash the secret before storing
    const codeHash = await hashSecret(secret);
    
    // Create expiration date
    const expiresAt = createExpirationDate();
    
    // Save to database
    await saveAdminCode({
      email: normalizedEmail,
      codeHash,
      expiresAt,
      ipAddress,
      userAgent
    });
    
    // Send email with plaintext secret (only to ADMIN_EMAIL)
    try {
      await sendEmail(
        normalizedEmail,
        'Your Next Subscription Admin Access Code',
        getAdminCodeEmailHTML(secret, expiresAt)
      );
    } catch (emailError) {
      console.error('Failed to send admin code email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send admin code email. Please try again.'
      });
    }
    
    // Return success (do not reveal code)
    return res.status(200).json({
      success: true,
      message: 'Secret code sent to admin email'
    });
    
  } catch (error) {
    console.error('Admin code request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing admin code request'
    });
  }
};

/**
 * Controller: Verify Admin Code
 * 
 * Verifies the submitted admin code and issues an admin JWT token.
 * 
 * @route POST /api/admin/verify-code
 * @public (but rate limited)
 */
export const verifyAdminCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Security: Only allow ADMIN_EMAIL
    if (normalizedEmail !== ADMIN_EMAIL.toLowerCase().trim()) {
      return res.status(403).json({
        success: false,
        message: 'Invalid email or code'
      });
    }
    
    // Verify code
    const adminCode = await verifySecret(normalizedEmail, code);
    
    if (!adminCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code'
      });
    }
    
    // Generate admin JWT token
    const adminToken = jwt.sign(
      { 
        email: normalizedEmail,
        role: 'admin',
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '8h' // Admin sessions last 8 hours
      }
    );
    
    // Set secure HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/'
    };
    
    res.cookie('adminToken', adminToken, cookieOptions);
    
    // Return success
    return res.status(200).json({
      success: true,
      message: 'Admin authenticated',
      token: adminToken // Also return in body for client-side storage if needed
    });
    
  } catch (error) {
    console.error('Admin code verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while verifying admin code'
    });
  }
};

/**
 * Controller: Get Admin Info
 * 
 * Returns admin information for authenticated admin sessions.
 * 
 * @route GET /api/admin/me
 * @protected (requires admin authentication)
 */
export const getAdminInfo = async (req, res) => {
  try {
    // Admin info is attached by adminAuth middleware
    return res.status(200).json({
      success: true,
      admin: {
        email: req.admin.email,
        role: req.admin.role
      }
    });
  } catch (error) {
    console.error('Get admin info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Controller: Admin Logout
 * 
 * Logs out the admin by clearing the admin token cookie.
 * 
 * @route POST /api/admin/logout
 * @protected (requires admin authentication)
 */
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Admin logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

