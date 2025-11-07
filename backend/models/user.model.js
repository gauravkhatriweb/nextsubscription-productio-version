/**
 * Customer/User Data Model Schema
 * 
 * Defines the Mongoose schema for customer/user accounts in the database.
 * Includes fields for user information, authentication, and verification status.
 * Provides static and instance methods for password hashing and JWT token generation.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Customer/User Schema Definition
 * 
 * Defines the structure of customer documents in the MongoDB collection.
 * Includes automatic timestamps (createdAt, updatedAt) for tracking record changes.
 */
const userSchema = new mongoose.Schema({
  // User's first name (required, minimum 3 characters)
  firstname: { type: String, required: true },
  
  // User's last name (required, minimum 3 characters)
  lastname: { type: String, required: true },
  
  // User's email address (required, must be unique)
  email: { type: String, required: true, unique: true },
  
  // Hashed password (required, excluded from queries by default for security)
  password: { type: String, required: true, select: false },
  
  // Profile picture file path (optional)
  profilePic: { type: String },
  
  // Account verification status (default: false - unverified)
  isAccountVerified: { type: Boolean, default: false },
  
  // Account verification OTP fields
  verifyOtp: { type: String },
  verifyOtpExpiry: { type: Date },
  
  // Password reset OTP fields
  forgotPasswordOtp: { type: String },
  forgotPasswordOtpExpiry: { type: Date },
  
  // Socket ID for real-time features (optional)
  socketId: { type: String },
  
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

/**
 * Static Method: Hash Password
 * 
 * Hashes a plain text password using bcrypt with 10 salt rounds.
 * Used when creating new users or resetting passwords.
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Hashed password
 */
userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

/**
 * Instance Method: Compare Password
 * 
 * Compares a plain text password with the user's hashed password.
 * Used during login and password verification.
 * 
 * @param {string} password - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Instance Method: Generate JWT Token
 * 
 * Creates a JSON Web Token for user authentication.
 * Token contains user ID and expires after 1 day.
 * 
 * @returns {string} JWT token string
 */
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// Create and export the User model
// Note: Model name is 'User' but is used for customers in the application
const UserModel = mongoose.model('User', userSchema);

export default UserModel;
