/**
 * User Routes - API Endpoint Definitions
 * 
 * Defines all customer/user-related API routes and maps them to
 * their respective controller functions. Routes are organized into
 * public (no authentication) and protected (authentication required) routes.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile, sendResetPasswordOtp, resetPassword, sendVerificationOtp, verifyOtp, isAuthenticated, uploadProfilePicture, updateProfilePicture, deleteProfilePicture } from '../controllers/user.controller.js';
import { verifyUserJWT } from '../middleware/auth.middleware.js';
import upload, { handleUploadError } from '../middleware/upload.middleware.js';

// Create Express router instance
const router = express.Router();

/**
 * Public Routes (No Authentication Required)
 * 
 * These routes are accessible without authentication tokens.
 */

// POST /api/users/register - Register a new user account
router.post('/register', registerUser);

// POST /api/users/login - Authenticate user and get access token
router.post('/login', loginUser);

// POST /api/users/send-reset-password-otp - Send password reset OTP via email
router.post('/send-reset-password-otp', sendResetPasswordOtp);

// POST /api/users/reset-password - Reset password using OTP verification
router.post('/reset-password', resetPassword);

/**
 * Protected Routes (Authentication Required)
 * 
 * These routes require a valid JWT token in cookie or Authorization header.
 * Authentication middleware (verifyUserJWT) validates the token before
 * allowing access to these endpoints.
 */

// POST /api/users/logout - Logout authenticated user
router.post('/logout', verifyUserJWT, logoutUser);

// GET /api/users/profile - Get authenticated user's profile information
router.get('/profile', verifyUserJWT, getUserProfile);

// POST /api/users/send-verification-otp - Send account verification OTP
router.post('/send-verification-otp', verifyUserJWT, sendVerificationOtp);

// POST /api/users/verify-otp - Verify account using OTP
router.post('/verify-otp', verifyUserJWT, verifyOtp);

// POST /api/users/is-authenticated - Check if user is authenticated
router.post('/is-authenticated', verifyUserJWT, isAuthenticated);

/**
 * Profile Picture Routes (Authentication Required)
 * 
 * These routes handle profile picture upload, update, and deletion.
 * Multer middleware handles file upload processing.
 */

// POST /api/users/upload-profile-pic - Upload a new profile picture
router.post('/upload-profile-pic', verifyUserJWT, upload.single('profilePic'), handleUploadError, uploadProfilePicture);

// PUT /api/users/update-profile-pic - Update existing profile picture
router.put('/update-profile-pic', verifyUserJWT, upload.single('profilePic'), handleUploadError, updateProfilePicture);

// DELETE /api/users/delete-profile-pic - Delete profile picture
router.delete('/delete-profile-pic', verifyUserJWT, deleteProfilePicture);

export default router;