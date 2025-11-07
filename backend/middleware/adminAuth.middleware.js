/**
 * Admin Authentication Middleware
 * 
 * Verifies admin JWT tokens and ensures the user has admin role.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import jwt from 'jsonwebtoken';

/**
 * Middleware: Verify Admin JWT Token
 * 
 * Validates admin JWT tokens and attaches admin info to req.admin.
 * Admin tokens must have role: 'admin' claim.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const verifyAdminJWT = async (req, res, next) => {
  try {
    // Extract token from cookie or Authorization header
    const token = req.cookies?.adminToken || 
                  req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Admin token required"
      });
    }
    
    // Verify token signature and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Admin access required"
      });
    }
    
    // Attach admin info to request
    req.admin = {
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    // Clear invalid token cookie
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token"
    });
  }
};

