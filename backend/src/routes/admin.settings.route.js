/**
 * Admin Settings Routes - Site Configuration Endpoints
 * 
 * Defines all admin settings API routes for managing site configuration.
 * All routes require admin authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import {
  getCurrentSettings,
  updateBrandingSettings,
  updateContentSettings,
  updateThemeSettings,
  resetTheme
} from '../controllers/admin.settings.controller.js';
import { verifyAdminJWT } from '../middleware/adminAuth.middleware.js';
import { uploadLogo, uploadFavicon, handleAdminUploadError } from '../middleware/uploadAdmin.middleware.js';

const router = express.Router();

/**
 * Public Route (for theme loading on frontend)
 */

// GET /api/admin/settings - Get current settings (public for theme loading)
router.get('/', getCurrentSettings);

/**
 * Protected Admin Routes (Requires Admin Authentication)
 */

// PUT /api/admin/settings/branding - Update branding (logo, favicon, site name)
// Handle both logo and favicon uploads
router.put(
  '/branding',
  verifyAdminJWT,
  (req, res, next) => {
    // Check if this is a multipart form data request
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    if (isMultipart) {
      // Store uploaded files in req.uploadedFiles
      req.uploadedFiles = {};
      
      // Process logo first
      const logoMiddleware = uploadLogo.single('logo');
      logoMiddleware(req, res, (logoErr) => {
        // Store logo if uploaded
        if (req.file && req.file.fieldname === 'logo') {
          req.uploadedFiles.logo = { ...req.file };
        }
        
        // Ignore LIMIT_UNEXPECTED_FILE errors (field not present)
        if (logoErr && logoErr.code !== 'LIMIT_UNEXPECTED_FILE') {
          return next(logoErr);
        }
        
        // Clear req.file to prepare for favicon
        const originalFile = req.file;
        req.file = undefined;
        
        // Now process favicon
        const faviconMiddleware = uploadFavicon.single('favicon');
        faviconMiddleware(req, res, (faviconErr) => {
          // Store favicon if uploaded
          if (req.file && req.file.fieldname === 'favicon') {
            req.uploadedFiles.favicon = { ...req.file };
          }
          
          // Restore logo file if it was uploaded
          if (req.uploadedFiles.logo) {
            req.file = req.uploadedFiles.logo;
          } else if (req.uploadedFiles.favicon) {
            req.file = req.uploadedFiles.favicon;
          }
          
          // Ignore LIMIT_UNEXPECTED_FILE errors (field not present)
          if (faviconErr && faviconErr.code !== 'LIMIT_UNEXPECTED_FILE') {
            return next(faviconErr);
          }
          
          // Both processed (or not present), continue
          next();
        });
      });
    } else {
      // Not multipart, just JSON data (siteName only)
      next();
    }
  },
  handleAdminUploadError,
  updateBrandingSettings
);

// PUT /api/admin/settings/content - Update content (headlines, taglines)
router.put('/content', verifyAdminJWT, updateContentSettings);

// PUT /api/admin/settings/theme - Update theme colors
router.put('/theme', verifyAdminJWT, updateThemeSettings);

// POST /api/admin/settings/theme/reset - Reset theme to defaults
router.post('/theme/reset', verifyAdminJWT, resetTheme);

export default router;

