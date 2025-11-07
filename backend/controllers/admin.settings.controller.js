/**
 * Admin Settings Controller - Site Configuration Management
 * 
 * Handles admin settings endpoints for branding, content, and theme management.
 * All endpoints require admin authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import {
  getSettings,
  updateBranding,
  updateContent,
  updateTheme,
  resetThemeToDefaults,
  validateColorContrast
} from '../services/settings.service.js';
import { deleteOldLogo, deleteOldFavicon } from '../middleware/uploadAdmin.middleware.js';
import path from 'path';

/**
 * Controller: Get Current Settings
 * 
 * Returns current site settings (public endpoint for frontend to load theme).
 * 
 * @route GET /api/admin/settings
 * @public (for theme loading) or protected (for admin)
 */
export const getCurrentSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    
    return res.status(200).json({
      success: true,
      settings: {
        siteName: settings.siteName,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        heroHeadline: settings.heroHeadline,
        heroTagline: settings.heroTagline,
        primaryHeading: settings.primaryHeading,
        theme: settings.theme,
        settingsVersion: settings.settingsVersion
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching settings'
    });
  }
};

/**
 * Controller: Update Branding Settings
 * 
 * Updates logo, favicon, and site name.
 * 
 * @route PUT /api/admin/settings/branding
 * @protected (requires admin authentication)
 */
export const updateBrandingSettings = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null; // Get admin email from auth
    
    // Get siteName from body (could be in JSON or form-data)
    const siteName = req.body?.siteName;
    
    // Prepare branding data
    const brandingData = {};
    
    if (siteName !== undefined && siteName !== null && siteName !== '') {
      const trimmedName = String(siteName).trim();
      if (trimmedName.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Site name cannot be empty'
        });
      }
      brandingData.siteName = trimmedName;
    }
    
    // Handle logo upload - check req.uploadedFiles first (from middleware)
    if (req.uploadedFiles?.logo) {
      const logoFile = req.uploadedFiles.logo;
      const logoUrl = `/uploads/branding/logo/${logoFile.filename}`;
      brandingData.logoUrl = logoUrl;
      
      // Delete old logo if exists
      const settings = await getSettings();
      if (settings.logoUrl) {
        const oldLogoFilename = path.basename(settings.logoUrl);
        deleteOldLogo(oldLogoFilename);
      }
    } else if (req.file && req.file.fieldname === 'logo') {
      // Fallback: check req.file if uploadedFiles not available
      const logoUrl = `/uploads/branding/logo/${req.file.filename}`;
      brandingData.logoUrl = logoUrl;
      
      const settings = await getSettings();
      if (settings.logoUrl) {
        const oldLogoFilename = path.basename(settings.logoUrl);
        deleteOldLogo(oldLogoFilename);
      }
    }
    
    // Handle favicon upload - check req.uploadedFiles first
    if (req.uploadedFiles?.favicon) {
      const faviconFile = req.uploadedFiles.favicon;
      const faviconUrl = `/uploads/branding/favicon/${faviconFile.filename}`;
      brandingData.faviconUrl = faviconUrl;
      
      // Delete old favicon if exists
      const settings = await getSettings();
      if (settings.faviconUrl) {
        const oldFaviconFilename = path.basename(settings.faviconUrl);
        deleteOldFavicon(oldFaviconFilename);
      }
    } else if (req.file && req.file.fieldname === 'favicon') {
      // Fallback: check req.file if uploadedFiles not available
      const faviconUrl = `/uploads/branding/favicon/${req.file.filename}`;
      brandingData.faviconUrl = faviconUrl;
      
      const settings = await getSettings();
      if (settings.faviconUrl) {
        const oldFaviconFilename = path.basename(settings.faviconUrl);
        deleteOldFavicon(oldFaviconFilename);
      }
    }
    
    if (Object.keys(brandingData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No branding data provided'
      });
    }
    
    const updatedSettings = await updateBranding(brandingData, adminEmail);
    
    return res.status(200).json({
      success: true,
      message: 'Branding settings updated successfully',
      settings: {
        siteName: updatedSettings.siteName,
        logoUrl: updatedSettings.logoUrl,
        faviconUrl: updatedSettings.faviconUrl
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating branding settings'
    });
  }
};

/**
 * Controller: Update Content Settings
 * 
 * Updates hero headline, tagline, and primary heading.
 * 
 * @route PUT /api/admin/settings/content
 * @protected (requires admin authentication)
 */
export const updateContentSettings = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const { heroHeadline, heroTagline, primaryHeading } = req.body;
    
    const contentData = {};
    
    if (heroHeadline !== undefined) {
      if (!heroHeadline || heroHeadline.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Hero headline cannot be empty'
        });
      }
      contentData.heroHeadline = heroHeadline.trim();
    }
    
    if (heroTagline !== undefined) {
      if (!heroTagline || heroTagline.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Hero tagline cannot be empty'
        });
      }
      contentData.heroTagline = heroTagline.trim();
    }
    
    if (primaryHeading !== undefined) {
      if (!primaryHeading || primaryHeading.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Primary heading cannot be empty'
        });
      }
      contentData.primaryHeading = primaryHeading.trim();
    }
    
    if (Object.keys(contentData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No content data provided'
      });
    }
    
    const updatedSettings = await updateContent(contentData, adminEmail);
    
    return res.status(200).json({
      success: true,
      message: 'Content settings updated successfully',
      settings: {
        heroHeadline: updatedSettings.heroHeadline,
        heroTagline: updatedSettings.heroTagline,
        primaryHeading: updatedSettings.primaryHeading
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating content settings'
    });
  }
};

/**
 * Controller: Update Theme Settings
 * 
 * Updates theme colors with contrast validation.
 * 
 * @route PUT /api/admin/settings/theme
 * @protected (requires admin authentication)
 */
export const updateThemeSettings = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const { primary, background, surface, text } = req.body;
    
    const themeData = {};
    
    // Validate color format (hex)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    if (primary !== undefined) {
      if (!hexColorRegex.test(primary)) {
        return res.status(400).json({
          success: false,
          message: 'Primary color must be a valid hex color (e.g., #E43636)'
        });
      }
      themeData.primary = primary;
    }
    
    if (background !== undefined) {
      if (!hexColorRegex.test(background)) {
        return res.status(400).json({
          success: false,
          message: 'Background color must be a valid hex color'
        });
      }
      themeData.background = background;
    }
    
    if (surface !== undefined) {
      if (!hexColorRegex.test(surface)) {
        return res.status(400).json({
          success: false,
          message: 'Surface color must be a valid hex color'
        });
      }
      themeData.surface = surface;
    }
    
    if (text !== undefined) {
      if (!hexColorRegex.test(text)) {
        return res.status(400).json({
          success: false,
          message: 'Text color must be a valid hex color'
        });
      }
      themeData.text = text;
    }
    
    // Validate contrast if both background and text are provided
    if (themeData.background && themeData.text) {
      const hasGoodContrast = validateColorContrast(themeData.background, themeData.text);
      if (!hasGoodContrast) {
        return res.status(400).json({
          success: false,
          message: 'Color contrast is too low. Please choose colors with better contrast for accessibility.',
          warning: 'WCAG AA requires at least 4.5:1 contrast ratio'
        });
      }
    }
    
    if (Object.keys(themeData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No theme data provided'
      });
    }
    
    const updatedSettings = await updateTheme(themeData, adminEmail);
    
    return res.status(200).json({
      success: true,
      message: 'Theme settings updated successfully',
      settings: {
        theme: updatedSettings.theme
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating theme settings'
    });
  }
};

/**
 * Controller: Reset Theme to Defaults
 * 
 * Resets theme to brand default colors.
 * 
 * @route POST /api/admin/settings/theme/reset
 * @protected (requires admin authentication)
 */
export const resetTheme = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    
    const updatedSettings = await resetThemeToDefaults(adminEmail);
    
    return res.status(200).json({
      success: true,
      message: 'Theme reset to brand defaults',
      settings: {
        theme: updatedSettings.theme
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while resetting theme'
    });
  }
};

