/**
 * Admin File Upload Middleware - Logo and Favicon Handling
 * 
 * Configures Multer for handling admin branding uploads:
 * - Logo: PNG, JPG, JPEG, SVG (max 2MB)
 * - Favicon: ICO, PNG (max 500KB, recommended 32x32 or 48x48)
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Upload Directories Configuration
 */
const logoDir = './uploads/branding/logo';
const faviconDir = './uploads/branding/favicon';

// Create directories if they don't exist
[logoDir, faviconDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Logo Storage Configuration
 */
const logoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, logoDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        // Keep original name but add timestamp for uniqueness
        const baseName = path.basename(file.originalname, ext);
        cb(null, `logo_${timestamp}_${baseName}${ext}`);
    }
});

/**
 * Favicon Storage Configuration
 */
const faviconStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, faviconDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `favicon_${timestamp}${ext}`);
    }
});

/**
 * Logo File Filter
 */
const logoFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Logo must be PNG, JPG, JPEG, or SVG'), false);
    }
};

/**
 * Favicon File Filter
 */
const faviconFileFilter = (req, file, cb) => {
    const allowedTypes = /ico|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/x-icon' || file.mimetype === 'image/vnd.microsoft.icon';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Favicon must be ICO or PNG'), false);
    }
};

/**
 * Logo Upload Middleware
 */
export const uploadLogo = multer({
    storage: logoStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
        files: 1
    },
    fileFilter: logoFileFilter
});

/**
 * Favicon Upload Middleware
 */
export const uploadFavicon = multer({
    storage: faviconStorage,
    limits: {
        fileSize: 500 * 1024, // 500KB limit
        files: 1
    },
    fileFilter: faviconFileFilter
});

/**
 * Helper: Delete Old Logo
 */
export const deleteOldLogo = (filename) => {
    if (!filename) return;
    const filePath = path.join(logoDir, filename);
    if (fs.existsSync(filePath)) {
        try {
            // Backup before delete (move to backups folder)
            const backupsDir = path.join(logoDir, '../backups');
            if (!fs.existsSync(backupsDir)) {
                fs.mkdirSync(backupsDir, { recursive: true });
            }
            const backupPath = path.join(backupsDir, `logo_backup_${Date.now()}_${filename}`);
            fs.copyFileSync(filePath, backupPath);
            fs.unlinkSync(filePath);
        } catch (error) {
            // Log but don't fail
        }
    }
};

/**
 * Helper: Delete Old Favicon
 */
export const deleteOldFavicon = (filename) => {
    if (!filename) return;
    const filePath = path.join(faviconDir, filename);
    if (fs.existsSync(filePath)) {
        try {
            // Backup before delete
            const backupsDir = path.join(faviconDir, '../backups');
            if (!fs.existsSync(backupsDir)) {
                fs.mkdirSync(backupsDir, { recursive: true });
            }
            const backupPath = path.join(backupsDir, `favicon_backup_${Date.now()}_${filename}`);
            fs.copyFileSync(filePath, backupPath);
            fs.unlinkSync(filePath);
        } catch (error) {
            // Log but don't fail
        }
    }
};

/**
 * Upload Error Handler
 */
export const handleAdminUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Logo max 2MB, Favicon max 500KB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Only one file is allowed'
            });
        }
    }
    
    if (error.message && (error.message.includes('Logo') || error.message.includes('Favicon'))) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    return res.status(500).json({
        success: false,
        message: 'File upload error'
    });
};

