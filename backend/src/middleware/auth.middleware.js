/**
 * Authentication Middleware - JWT Token Verification
 * 
 * Verifies JWT tokens from incoming requests and attaches authenticated user
 * to the request object. Tokens can be provided via:
 * - HTTP-only cookie (accessToken)
 * - Authorization header (Bearer token)
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

/**
 * Middleware: Verify User JWT Token
 * 
 * Validates JWT tokens and attaches authenticated user to req.user.
 * 
 * Process:
 * 1. Extracts token from cookie or Authorization header
 * 2. Verifies token signature using JWT_SECRET
 * 3. Finds user in database using decoded user ID
 * 4. Attaches user to req.user for use in controllers
 * 5. Returns 401 if token is invalid, expired, or user not found
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const verifyUserJWT = async (req, res, next) => {
    console.log('🔐 verifyUserJWT middleware called');
    console.log('🔐 Authorization header:', req.header("Authorization"));
    try {
        // Extract token from cookie or Authorization header
        // Priority: Cookie first, then Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log('🔐 Extracted token:', token ? 'Token present' : 'No token');
        
        // Return 401 if no token provided
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized request - No token provided"
            });
        }
        
        // Verify token signature and decode payload
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔐 Decoded token:', decodedToken);
        
        // Find user in database using decoded user ID
        // Exclude password field for security
        const user = await userModel.findById(decodedToken.id).select("-password");

        console.log('🔐 User lookup result:', user ? 'Found' : 'Not found');
        console.log('🔐 Looking for user ID:', decodedToken.id);
        
        // Return 401 if user not found
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid access token - User not found"
            });
        }
        
        // Attach authenticated user to request object
        // Controllers can access user via req.user
        req.user = user;
        next();
        
    } catch (error) {
        // Only log JWT errors in development mode to reduce console spam
        if (process.env.NODE_ENV === 'development') {
            console.error('JWT verification error:', error.name, error.message);
        }
        
        // Clear invalid token cookie
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });
        
        // Return 401 with error details
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token. Please login again.",
            code: "TOKEN_INVALID"
        });
    }
};

