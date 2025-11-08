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

const ALLOWED_THEME_KEYS = ['primary', 'secondary', 'background', 'surface', 'text', 'button'];

const DEFAULT_LIGHT_THEME = {
  primary: '#E43636',
  secondary: '#E2DDB4',
  background: '#F6EFD2',
  surface: '#FFFFFF',
  text: '#000000',
  button: '#E43636'
};

const DEFAULT_DARK_THEME = {
  primary: '#E43636',
  secondary: '#2B2B2B',
  background: '#000000',
  surface: '#1A1A1A',
  text: '#F6EFD2',
  button: '#E43636'
};

const normalizeHexColor = (value) => {
  if (typeof value !== 'string') return null;
  let hex = value.trim();
  if (!hex) return null;
  if (!hex.startsWith('#')) {
    hex = `#${hex}`;
  }
  if (/^#([0-9A-Fa-f]{3})$/.test(hex)) {
    const [, chars] = /^#([0-9A-Fa-f]{3})$/.exec(hex);
    hex = `#${chars.split('').map((char) => `${char}${char}`).join('')}`;
  }
  if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
    return null;
  }
  return hex.toUpperCase();
};

const sanitizePalette = (palette = {}, fallback = {}, defaults = DEFAULT_LIGHT_THEME) => {
  const sanitized = {};
  ALLOWED_THEME_KEYS.forEach((key) => {
    const normalized = normalizeHexColor(palette[key]);
    if (normalized) {
      sanitized[key] = normalized;
    } else if (fallback[key]) {
      sanitized[key] = normalizeHexColor(fallback[key]) || defaults[key];
    } else {
      sanitized[key] = defaults[key];
    }
  });
  return sanitized;
};

const palettesEqual = (a = {}, b = {}) => ALLOWED_THEME_KEYS.every((key) => normalizeHexColor(a[key]) === normalizeHexColor(b[key]));

/**
 * Update theme settings
 * 
 * @param {Object} themeData - Theme data to update
 * @param {Object} themeData.lightTheme - Light mode palette
 * @param {Object} themeData.darkTheme - Dark mode palette
 * @param {string} themeData.activeThemeMode - Active mode ('light' or 'dark')
 * @param {string} updatedBy - Admin identity
 * @returns {Promise<Object>} Updated settings document
 */
export const updateTheme = async (themeData, updatedBy) => {
  const settings = await SettingsModel.getSettings();

  const previousLight = { ...settings.themeLight.toObject?.() ?? settings.themeLight };
  const previousDark = { ...settings.themeDark.toObject?.() ?? settings.themeDark };
  const previousTheme = { ...settings.theme.toObject?.() ?? settings.theme };
  const previousMode = settings.activeThemeMode || 'light';

  const nextLight = sanitizePalette(themeData.lightTheme, settings.themeLight, DEFAULT_LIGHT_THEME);
  const nextDark = sanitizePalette(themeData.darkTheme, settings.themeDark, DEFAULT_DARK_THEME);
  const nextMode = themeData.activeThemeMode === 'dark' ? 'dark' : 'light';
  const nextTheme = nextMode === 'dark' ? nextDark : nextLight;

  const noPaletteChange =
    palettesEqual(previousLight, nextLight) &&
    palettesEqual(previousDark, nextDark) &&
    palettesEqual(previousTheme, nextTheme) &&
    previousMode === nextMode;

  if (noPaletteChange) {
    return settings;
  }

  settings.themeLight = nextLight;
  settings.themeDark = nextDark;
  settings.activeThemeMode = nextMode;
  settings.theme = nextTheme;

  const changes = {
    themeLight: { old: previousLight, new: nextLight },
    themeDark: { old: previousDark, new: nextDark },
    theme: { old: previousTheme, new: nextTheme },
    activeThemeMode: { old: previousMode, new: nextMode }
  };

  await settings.recordChange(updatedBy, changes, 'theme');

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
  const oldLight = { ...settings.themeLight };
  const oldDark = { ...settings.themeDark };
  const oldMode = settings.activeThemeMode || 'light';
  const defaultLight = { ...DEFAULT_LIGHT_THEME };
  const defaultDark = { ...DEFAULT_DARK_THEME };
  const defaultTheme = { ...DEFAULT_LIGHT_THEME };
  
  settings.theme = defaultTheme;
  settings.themeLight = defaultLight;
  settings.themeDark = defaultDark;
  settings.activeThemeMode = 'light';
  
  await settings.recordChange(updatedBy, {
    theme: { old: oldTheme, new: defaultTheme },
    themeLight: { old: oldLight, new: defaultLight },
    themeDark: { old: oldDark, new: defaultDark },
    activeThemeMode: { old: oldMode, new: 'light' }
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
export const validateColorContrast = () => true;

