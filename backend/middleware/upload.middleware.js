/**
 * File Upload Middleware - Profile Picture Handling
 * 
 * Configures Multer for handling profile picture uploads with:
 * - File type validation (JPG, JPEG, PNG only)
 * - File size limits (2MB maximum)
 * - Unique filename generation
 * - Error handling
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Upload Directory Configuration
 * 
 * Creates uploads directory if it doesn't exist.
 * Profile pictures are stored in: ./uploads/profile-pictures/
 */
const uploadsDir = './uploads/profile-pictures';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer Storage Configuration
 * 
 * Configures where and how files are stored:
 * - Destination: ./uploads/profile-pictures/
 * - Filename: {userId}_{timestamp}.{extension}
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: userId_timestamp.ext (works for both passengers and captains)
        const userId = req.user?._id;
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${userId}_${timestamp}${ext}`);
    }
});

/**
 * File Filter Function
 * 
 * Validates that uploaded files are images (JPG, JPEG, PNG).
 * Rejects other file types before saving.
 * 
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, JPEG, PNG) are allowed'), false);
    }
};

/**
 * Multer Upload Configuration
 * 
 * Configures Multer with storage, file filter, and size limits.
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
        files: 1 // Only allow one file
    },
    fileFilter: fileFilter
});

/**
 * Upload Error Handling Middleware
 * 
 * Handles Multer-specific errors and returns user-friendly error messages.
 * 
 * @param {Error} error - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const handleUploadError = (error, req, res, next) => {
    // Handle Multer-specific errors
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 2MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Only one file is allowed'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field'
            });
        }
    }
    
    // Handle file type validation errors
    if (error.message === 'Only image files (JPG, JPEG, PNG) are allowed') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    // Handle generic upload errors
    return res.status(500).json({
        success: false,
        message: 'File upload error'
    });
};

/**
 * Helper Function: Delete Old Profile Picture
 * 
 * Deletes a profile picture file from the uploads directory.
 * Used when updating or deleting profile pictures.
 * 
 * @param {string} filename - Name of the file to delete
 */
export const deleteOldProfilePic = (filename) => {
    if (!filename) return;
    
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted old profile picture: ${filename}`);
        } catch (error) {
            console.error(`Failed to delete old profile picture: ${filename}`, error);
        }
    }
};

export default upload;