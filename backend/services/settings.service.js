/**
 * Settings Service - Site Configuration Management
 * 
 * Handles CRUD operations for site settings including branding,
 * content, and theme configuration.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import SettingsModel from '../models/settings.model.js';

/**
 * Get current site settings
 * 
 * @returns {Promise<Object>} Current settings object
 */
export const getSettings = async () => {
  return await SettingsModel.getSettings();
};

/**
 * Update branding settings
 * 
 * @param {Object} brandingData - Branding data to update
 * @param {string} brandingData.siteName - Site name
 * @param {string} brandingData.logoUrl - Logo URL
 * @param {string} brandingData.faviconUrl - Favicon URL
 * @param {string} updatedBy - Admin user ID
 * @returns {Promise<Object>} Updated settings
 */
export const updateBranding = async (brandingData, updatedBy) => {
  const settings = await SettingsModel.getSettings();
  
  const changes = {};
  const oldValues = {};
  
  // Track changes
  if (brandingData.siteName !== undefined && settings.siteName !== brandingData.siteName) {
    oldValues.siteName = settings.siteName;
    changes.siteName = { old: settings.siteName, new: brandingData.siteName };
    settings.siteName = brandingData.siteName;
  }
  
  if (brandingData.logoUrl !== undefined && settings.logoUrl !== brandingData.logoUrl) {
    oldValues.logoUrl = settings.logoUrl;
    changes.logoUrl = { old: settings.logoUrl, new: brandingData.logoUrl };
    settings.logoUrl = brandingData.logoUrl;
  }
  
  if (brandingData.faviconUrl !== undefined && settings.faviconUrl !== brandingData.faviconUrl) {
    oldValues.faviconUrl = settings.faviconUrl;
    changes.faviconUrl = { old: settings.faviconUrl, new: brandingData.faviconUrl };
    settings.faviconUrl = brandingData.faviconUrl;
  }
  
  // Record changes if any
  if (Object.keys(changes).length > 0) {
    await settings.recordChange(updatedBy, changes, 'branding');
  }
  
  return settings;
};

/**
 * Update content settings
 * 
 * @param {Object} contentData - Content data to update
 * @param {string} contentData.heroHeadline - Hero headline
 * @param {string} contentData.heroTagline - Hero tagline
 * @param {string} contentData.primaryHeading - Primary heading
 * @param {string} updatedBy - Admin user ID
 * @returns {Promise<Object>} Updated settings
 */
export const updateContent = async (contentData, updatedBy) => {
  const settings = await SettingsModel.getSettings();
  
  const changes = {};
  
  if (contentData.heroHeadline !== undefined && settings.heroHeadline !== contentData.heroHeadline) {
    changes.heroHeadline = { old: settings.heroHeadline, new: contentData.heroHeadline };
    settings.heroHeadline = contentData.heroHeadline;
  }
  
  if (contentData.heroTagline !== undefined && settings.heroTagline !== contentData.heroTagline) {
    changes.heroTagline = { old: settings.heroTagline, new: contentData.heroTagline };
    settings.heroTagline = contentData.heroTagline;
  }
  
  if (contentData.primaryHeading !== undefined && settings.primaryHeading !== contentData.primaryHeading) {
    changes.primaryHeading = { old: settings.primaryHeading, new: contentData.primaryHeading };
    settings.primaryHeading = contentData.primaryHeading;
  }
  
  if (Object.keys(changes).length > 0) {
    await settings.recordChange(updatedBy, changes, 'content');
  }
  
  return settings;
};

/**
 * Update theme settings
 * 
 * @param {Object} themeData - Theme data to update
 * @param {string} themeData.primary - Primary color
 * @param {string} themeData.background - Background color
 * @param {string} themeData.surface - Surface color
 * @param {string} themeData.text - Text color
 * @param {string} updatedBy - Admin user ID
 * @returns {Promise<Object>} Updated settings
 */
export const updateTheme = async (themeData, updatedBy) => {
  const settings = await SettingsModel.getSettings();
  
  const changes = {};
  const oldTheme = { ...settings.theme };
  
  if (themeData.primary !== undefined && settings.theme.primary !== themeData.primary) {
    changes.primary = { old: settings.theme.primary, new: themeData.primary };
    settings.theme.primary = themeData.primary;
  }
  
  if (themeData.background !== undefined && settings.theme.background !== themeData.background) {
    changes.background = { old: settings.theme.background, new: themeData.background };
    settings.theme.background = themeData.background;
  }
  
  if (themeData.surface !== undefined && settings.theme.surface !== themeData.surface) {
    changes.surface = { old: settings.theme.surface, new: themeData.surface };
    settings.theme.surface = themeData.surface;
  }
  
  if (themeData.text !== undefined && settings.theme.text !== themeData.text) {
    changes.text = { old: settings.theme.text, new: themeData.text };
    settings.theme.text = themeData.text;
  }
  
  if (Object.keys(changes).length > 0) {
    const themeChanges = { theme: { old: oldTheme, new: settings.theme } };
    await settings.recordChange(updatedBy, themeChanges, 'theme');
  }
  
  return settings;
};

/**
 * Reset theme to brand defaults
 * 
 * @param {string} updatedBy - Admin user ID
 * @returns {Promise<Object>} Updated settings
 */
export const resetThemeToDefaults = async (updatedBy) => {
  const settings = await SettingsModel.getSettings();
  
  const oldTheme = { ...settings.theme };
  const defaultTheme = {
    primary: '#E43636',
    background: '#F6EFD2',
    surface: '#E2DDB4',
    text: '#000000'
  };
  
  settings.theme = defaultTheme;
  
  await settings.recordChange(updatedBy, {
    theme: { old: oldTheme, new: defaultTheme }
  }, 'theme');
  
  return settings;
};

/**
 * Validate color contrast (basic check)
 * 
 * @param {string} backgroundColor - Background color (hex)
 * @param {string} textColor - Text color (hex)
 * @returns {boolean} True if contrast is acceptable
 */
export const validateColorContrast = (backgroundColor, textColor) => {
  // Basic contrast validation
  // Convert hex to RGB and calculate relative luminance
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const getLuminance = (rgb) => {
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(val => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const bgRgb = hexToRgb(backgroundColor);
  const textRgb = hexToRgb(textColor);
  
  if (!bgRgb || !textRgb) return false;
  
  const bgLum = getLuminance(bgRgb);
  const textLum = getLuminance(textRgb);
  
  const contrast = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);
  
  // WCAG AA requires at least 4.5:1 for normal text
  return contrast >= 4.5;
};

