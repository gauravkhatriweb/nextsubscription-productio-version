/**
 * User Controller - Business Logic Handlers
 * 
 * Contains all controller functions for user-related operations including:
 * - User registration and authentication
 * - Profile management
 * - Account verification via OTP
 * - Password reset functionality
 * - Profile picture upload/update/delete
 * 
 * All functions handle request validation, database operations, and response formatting.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import UserModel from "../models/user.model.js";
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { sendEmail } from '../services/email.service.js';
import {
    getUserWelcomeEmailHTML,
    getUserVerifyOtpEmailHTML,
    getUserResetPasswordEmailHTML,
} from "../templates/userEmail.template.js";
import { deleteOldProfilePic } from '../middleware/upload.middleware.js';

// Constants
const OTP_EXPIRY_MINUTES = 10; // OTP expiration time in minutes
const PASSWORD_MIN_LENGTH = 6; // Minimum password length requirement

/**
 * Utility Function: Generate OTP
 * 
 * Generates a random 6-digit OTP (One-Time Password) for account verification
 * and password reset purposes.
 * 
 * @returns {string} 6-digit OTP string
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Controller: Register New User
 * 
 * Handles user registration process:
 * 1. Validates input fields (firstname, lastname, email, password)
 * 2. Hashes password using bcrypt
 * 3. Creates new user record in database
 * 4. Generates JWT authentication token for user
 * 5. Sends welcome email
 * 6. Returns user data and token
 * 
 * @route POST /api/users/register
 * @public
 * @param {Request} req - Express request object containing registration data
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const registerUser = async (req, res, next) => {
    try {
        // Extract registration data from request body
        const { firstname, lastname, email, password } = req.body;
        
        // Input validation
        const errors = [];
        
        // Check if required fields are present (lastname optional)
        if (!firstname || !email || !password) {
            errors.push({ field: 'all', message: 'First name, email and password are required' });
        }
        
        // Validate firstname length (minimum 3 characters)
        if (firstname && firstname.length < 3) {
            errors.push({ field: 'firstname', message: 'First name must be at least 3 characters long' });
        }
        
        // Validate lastname length (minimum 3 characters if provided)
        if (lastname && lastname.length < 3) {
            errors.push({ field: 'lastname', message: 'Last name must be at least 3 characters long' });
        }
        
        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push({ field: 'email', message: 'Invalid email address' });
        }
        
        // Validate password length (minimum 6 characters)
        if (password && password.length < 6) {
            errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
        }
        
        // Return validation errors if any
        if (errors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: errors 
            });
        }
        
        // Check if user already exists with this email
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        
        // Hash password using bcrypt (10 salt rounds)
        const hashedPassword = await UserModel.hashPassword(password);
        
        // Create new user record
        const newUser = new UserModel({
            firstname,
            lastname,
            email,
            password: hashedPassword
        });
        await newUser.save();
        
        // Generate JWT authentication token
        const token = await newUser.generateToken();
                            
        // Send welcome email (non-blocking - errors don't fail registration)
        try {
            await sendEmail(
                newUser.email,
                "Welcome to NextSubscription 🎉",
                getUserWelcomeEmailHTML(newUser.firstname)
            );
        } catch (err) {
            console.error("Welcome email error:", err);
        }
        
        // Return success response with user data and token
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser,
            token: token
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Controller: Get User Profile
 * 
 * Retrieves the authenticated user's profile information.
 * User object is attached to req.user by authentication middleware.
 * 
 * @route GET /api/users/profile
 * @protected (requires authentication)
 * @param {Request} req - Express request object (req.user contains authenticated user)
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getUserProfile = async (req, res, next) => {
    try {
        // User is already attached to req by the authentication middleware
        const user = req.user;
        
        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            user: user
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Controller: Logout User
 * 
 * Logs out the authenticated user by:
 * 1. Clearing socketId (for real-time features)
 * 2. Removing HTTP-only access token cookie
 * 3. Returning success response
 * 
 * @route POST /api/users/logout
 * @protected (requires authentication)
 * @param {Request} req - Express request object (req.user contains authenticated user)
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const logoutUser = async (req, res, next) => {
    try {
        // User is already attached to req by the authentication middleware
        const user = req.user;
        
        // Clear socketId for real-time features (marks user as offline)
        user.socketId = null;
        const loggedOutUser = await user.save();
        
        // Clear the HTTP-only access token cookie
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict" // CSRF protection
        });
        
        res.status(200).json({
            success: true,
            message: "User logged out successfully",
            user: loggedOutUser
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        
        // Handle user not found error
        if (error.message === "User not found") {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Controller: Login User
 * 
 * Authenticates a user by:
 * 1. Validating email and password input
 * 2. Finding user by email (including password field)
 * 3. Comparing provided password with hashed password
 * 4. Generating JWT token
 * 5. Setting token as HTTP-only cookie
 * 6. Returning user data and token
 * 
 * @route POST /api/users/login
 * @public
 * @param {Request} req - Express request object containing login credentials
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const loginUser = async (req, res, next) => {
    try {
        // Extract login credentials from request body
        const { email, password } = req.body;
        
        // Input validation
        const errors = [];
        
        // Check if required fields are present
        if (!email || !password) {
            errors.push({ field: 'all', message: 'Email and password are required' });
        }
        
        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.push({ field: 'email', message: 'Invalid email address' });
        }
        
        // Return validation errors if any
        if (errors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed',
                errors: errors 
            });
        }
        
        // Find user by email (select password field explicitly)
        const user = await UserModel.findOne({ email }).select('+password');
        if (!user) {
            throw new Error("Invalid email or password");
        }
        
        // Compare provided password with stored hashed password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        
        // Generate JWT authentication token
        const token = await user.generateToken();
        
        // Configure cookie options for secure token storage
        const options = {
            httpOnly: true, // Prevents JavaScript access (XSS protection)
            secure: process.env.NODE_ENV === "production", // HTTPS only in production
            sameSite: "strict", // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
        };
        
        // Set token in HTTP-only cookie
        res.cookie("accessToken", token, options);
        
        // Return success response with user data and token
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle invalid credentials error
        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Controller: Send Verification OTP
 * 
 * Sends a 6-digit OTP to the authenticated user's email for account verification.
 * 
 * Process:
 * 1. Finds user by ID (from authentication middleware)
 * 2. Checks if account is already verified
 * 3. Generates and saves OTP with expiration time
 * 4. Sends OTP via email
 * 
 * @route POST /api/users/send-verification-otp
 * @protected (requires authentication)
 */
export const sendVerificationOtp = async (req, res) => {
    try {
        // Find user by ID (set by auth middleware)
        const user = await UserModel.findOne({ _id: req.user._id });    
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: 'Account is already verified'
            });
        }

        // Generate and save OTP
        const otp = generateOTP();
        user.verifyOtp = otp;
        user.verifyOtpExpiry = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

       // Send OTP via email (Account Verification)
await sendEmail(
    user.email,
    'Verify Your NextSubscription Account',
    getUserVerifyOtpEmailHTML(otp, OTP_EXPIRY_MINUTES)
);


        return res.status(200).json({
            success: true,
            message: 'Verification OTP sent successfully'
        });
    } catch (error) {
        console.error('Send Verification OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending verification OTP'
        });
    }
}

/**
 * Controller: Verify OTP
 * 
 * Verifies the user's account using the OTP sent to their email.
 * 
 * Process:
 * 1. Validates OTP input
 * 2. Finds user by ID (from authentication middleware)
 * 3. Compares provided OTP with stored OTP
 * 4. Checks OTP expiration
 * 5. Updates account verification status
 * 
 * @route POST /api/users/verify-otp
 * @protected (requires authentication)
 */
export const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        // Validate OTP input
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required'
            });
        }

        // Find user by ID (set by auth middleware)
        const user = await UserModel.findOne({ _id: req.user._id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        if (user.verifyOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiry
        if (user.verifyOtpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Update user verification status
        user.verifyOtp = undefined;
        user.verifyOtpExpiry = undefined;
        user.isAccountVerified = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Account verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while verifying OTP'
        });
    }
}

/**
 * Controller: Check Authentication Status
 * 
 * Verifies that the current user is authenticated.
 * This is a simple endpoint protected by authentication middleware
 * that returns success if the token is valid.
 * 
 * @route POST /api/users/is-authenticated
 * @protected (requires authentication)
 */
export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'User is authenticated'
        });
    } catch (error) {
        console.error('Authentication Check Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while checking authentication'
        });
    }
}

/**
 * Controller: Send Password Reset OTP
 * 
 * Sends a 6-digit OTP to the user's email for password reset.
 * 
 * Process:
 * 1. Validates email input
 * 2. Finds user by email
 * 3. Generates and saves OTP with expiration time
 * 4. Sends OTP via email
 * 
 * @route POST /api/users/send-reset-password-otp
 * @public
 */
export const sendResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Generate and save OTP
        const otp = generateOTP();
        user.forgotPasswordOtp = otp;
        user.forgotPasswordOtpExpiry = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
        await user.save();

       // Send OTP via email
await sendEmail(
    user.email,
    'NextSubscription | Password Reset OTP',
    getUserResetPasswordEmailHTML(otp, OTP_EXPIRY_MINUTES)
  );
  

        return res.status(200).json({
            success: true,
            message: 'Password reset OTP sent successfully'
        });
    } catch (error) {
        console.error('Send Reset Password OTP Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while sending reset password OTP'
        });
    }
}

/**
 * Controller: Reset Password
 * 
 * Resets user password using OTP verification.
 * 
 * Process:
 * 1. Validates email, OTP, and new password
 * 2. Finds user by email
 * 3. Verifies OTP and checks expiration
 * 4. Ensures new password is different from current password
 * 5. Hashes and saves new password
 * 6. Clears OTP fields
 * 
 * @route POST /api/users/reset-password
 * @public
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body || {};

        // Validate input - check for empty strings after trimming
        const emailTrimmed = email ? String(email).trim() : '';
        const otpTrimmed = otp ? String(otp).trim() : '';
        const passwordTrimmed = newPassword ? String(newPassword).trim() : '';
        
        if (!emailTrimmed || !otpTrimmed || !passwordTrimmed) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP and new password are required'
            });
        }

        // Validate password length
        if (passwordTrimmed.length < PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters`
            });
        }

        // Normalize email to lowercase and OTP to string
        const normalizedEmail = emailTrimmed.toLowerCase();
        const normalizedOtp = otpTrimmed;

        // Find user by email and verify OTP (include password field for comparison)
        // Explicitly include forgotPasswordOtp and forgotPasswordOtpExpiry fields
        const user = await UserModel.findOne({ email: normalizedEmail })
            .select('+password forgotPasswordOtp forgotPasswordOtpExpiry');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP exists
        if (!user.forgotPasswordOtp) {
            return res.status(400).json({
                success: false,
                message: 'No password reset OTP found. Please request a new one.'
            });
        }

        // Compare OTP as strings to avoid type mismatch
        const storedOtp = String(user.forgotPasswordOtp);
        if (storedOtp !== normalizedOtp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check OTP expiry
        if (!user.forgotPasswordOtpExpiry || user.forgotPasswordOtpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check if new password is same as old password
        
        // Check if user.password exists before comparing
        if (!user.password) {
            // If password doesn't exist, we can skip the comparison
            // This might happen for users created before password hashing was implemented
        } else {
            const isSamePassword = await bcrypt.compare(passwordTrimmed, user.password);
            if (isSamePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password'
                });
            }
        }

        // Update password and clear OTP
        user.password = await bcrypt.hash(passwordTrimmed, 10);
        user.forgotPasswordOtp = undefined;
        user.forgotPasswordOtpExpiry = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while resetting password'
        });
    }
}

/**
 * Controller: Upload Profile Picture
 * 
 * Uploads a profile picture for the authenticated user.
 * 
 * Process:
 * 1. Validates uploaded file
 * 2. Gets user ID from authentication middleware
 * 3. Deletes old profile picture if exists
 * 4. Saves new profile picture path to database
 * 
 * @route POST /api/users/upload-profile-pic
 * @protected (requires authentication)
 */
export const uploadProfilePicture = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select an image file.'
            });
        }

        // Get user ID from auth middleware
        const userId = req.user._id;

        // Find user and get current profile picture
        const user = await UserModel.findById(userId);
        if (!user) {
            // Delete uploaded file if User not found
            if (req.file && req.file.filename) {
                deleteOldProfilePic(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old profile picture if exists
        if (user.profilePic) {
            const oldFileName = path.basename(user.profilePic);
            deleteOldProfilePic(oldFileName);
        }

        // Update user with new profile picture path
        const profilePicPath = `/uploads/profile-pictures/${req.file.filename}`;
        user.profilePic = profilePicPath;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePic: profilePicPath
        });
    } catch (error) {
        console.error('Upload Profile Picture Error:', error);
        
        // Delete uploaded file in case of error
        if (req.file && req.file.filename) {
            deleteOldProfilePic(req.file.filename);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error while uploading profile picture'
        });
    }
}

/**
 * Controller: Update Profile Picture
 * 
 * Updates the user's existing profile picture (replaces old one).
 * Similar to upload but replaces existing picture.
 * 
 * @route PUT /api/users/update-profile-pic
 * @protected (requires authentication)
 */
export const updateProfilePicture = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select an image file.'
            });
        }

        // Get user ID from auth middleware
        const userId = req.user._id;

        // Find user and get current profile picture
        const user = await UserModel.findById(userId);
        if (!user) {
            // Delete uploaded file if user not found
            if (req.file && req.file.filename) {
                deleteOldProfilePic(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old profile picture if exists
        if (user.profilePic) {
            const oldFileName = path.basename(user.profilePic);
            deleteOldProfilePic(oldFileName);
        }

        // Update user with new profile picture path
        const profilePicPath = `/uploads/profile-pictures/${req.file.filename}`;
        user.profilePic = profilePicPath;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePic: profilePicPath
        });
    } catch (error) {
        console.error('Update Profile Picture Error:', error);
        
        // Delete uploaded file in case of error
        if (req.file && req.file.filename) {
            deleteOldProfilePic(req.file.filename);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile picture'
        });
    }
}

/**
 * Controller: Delete Profile Picture
 * 
 * Deletes the user's profile picture from both storage and database.
 * 
 * Process:
 * 1. Gets user ID from authentication middleware
 * 2. Checks if profile picture exists
 * 3. Deletes file from storage
 * 4. Removes profile picture path from database
 * 
 * @route DELETE /api/users/delete-profile-pic
 * @protected (requires authentication)
 */ 
export const deleteProfilePicture = async (req, res) => {
    try {
        // Get user ID from auth middleware
        const userId = req.user._id;

        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found'       
            });
        }

        // Check if user has a profile picture
        if (!user.profilePic) {
            return res.status(400).json({
                success: false,
                message: 'No profile picture to delete'
            });
        }

        // Delete file from storage
        const fileName = path.basename(user.profilePic);    
        deleteOldProfilePic(fileName);

        // Remove profile picture from database
        user.profilePic = null;
        await user.save();  

        return res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        console.error('Delete Profile Picture Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while deleting profile picture'
        });
    }
}
