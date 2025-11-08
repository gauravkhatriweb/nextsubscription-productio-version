/**
 * Centralized Theme Tokens for Next Subscription
 * 
 * This file defines all color tokens for both light and dark themes,
 * providing a single source of truth for styling across the application.
 */

export const themeTokens = {
  light: {
    primary: "#E43636",
    accent: "#F6EFD2",
    secondary: "#E2DDB4",
    text: "#000000",
    surface: "#FFFFFF",
    background: "#FDFBF7",
    border: "rgba(0,0,0,0.1)",
    
    // Extended color palette for UI elements
    textSecondary: "#4A4A4A",
    textSubtle: "#6B6B6B",
    textDisabled: "#9A9A9A",
    surfaceElevated: "rgba(255, 255, 255, 0.95)",
    surfaceCard: "#FFFFFF",
    surfaceHover: "rgba(228, 54, 54, 0.05)",
    borderSubtle: "rgba(226, 221, 180, 0.25)",
    borderFocus: "rgba(228, 54, 54, 0.5)",
    
    // Glass effect colors
    glassBackground: "rgba(255, 255, 255, 0.7)",
    glassBorder: "rgba(228, 54, 54, 0.15)",
    glassShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    glassHoverBackground: "rgba(255, 255, 255, 0.85)",
    
    // Shadow definitions
    shadowSmall: "0 2px 8px rgba(0, 0, 0, 0.06)",
    shadowMedium: "0 8px 24px rgba(0, 0, 0, 0.1)",
    shadowLarge: "0 16px 48px rgba(0, 0, 0, 0.15)",
    shadowXLarge: "0 24px 64px rgba(0, 0, 0, 0.2)",
    shadowBrand: "0 8px 24px rgba(228, 54, 54, 0.2)",
    
    // Status colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#E43636",
    
    successLight: "rgba(16, 185, 129, 0.1)",
    warningLight: "rgba(245, 158, 11, 0.1)",
    errorLight: "rgba(239, 68, 68, 0.1)",
    infoLight: "rgba(228, 54, 54, 0.1)",
  },
  dark: {
    primary: "#E43636",
    accent: "#E2DDB4",
    secondary: "#F6EFD2",
    text: "#FFFFFF",
    surface: "rgba(0,0,0,0.4)",
    background: "#000000",
    border: "rgba(255,255,255,0.1)",
    
    // Extended color palette for UI elements
    textSecondary: "rgba(246, 239, 210, 0.85)",
    textSubtle: "rgba(246, 239, 210, 0.70)",
    textDisabled: "rgba(246, 239, 210, 0.50)",
    surfaceElevated: "rgba(255, 255, 255, 0.06)",
    surfaceCard: "rgba(255, 255, 255, 0.02)",
    surfaceHover: "rgba(228, 54, 54, 0.08)",
    borderSubtle: "rgba(228, 54, 54, 0.08)",
    borderFocus: "rgba(228, 54, 54, 0.4)",
    
    // Glass effect colors
    glassBackground: "rgba(20, 20, 20, 0.6)",
    glassBorder: "rgba(228, 54, 54, 0.12)",
    glassShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    glassHoverBackground: "rgba(30, 30, 30, 0.7)",
    
    // Shadow definitions
    shadowSmall: "0 2px 8px rgba(0, 0, 0, 0.3)",
    shadowMedium: "0 8px 24px rgba(0, 0, 0, 0.5)",
    shadowLarge: "0 16px 48px rgba(0, 0, 0, 0.6)",
    shadowXLarge: "0 24px 64px rgba(0, 0, 0, 0.7)",
    shadowBrand: "0 8px 24px rgba(228, 54, 54, 0.3)",
    
    // Status colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#E43636",
    
    successLight: "rgba(16, 185, 129, 0.1)",
    warningLight: "rgba(245, 158, 11, 0.1)",
    errorLight: "rgba(239, 68, 68, 0.1)",
    infoLight: "rgba(228, 54, 54, 0.1)",
  },
};

/**
 * Get CSS variables for a specific theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {Object} CSS variables object
 */
export const getCSSVariables = (theme) => {
  const tokens = themeTokens[theme];
  
  return {
    // Base colors
    '--theme-primary': tokens.primary,
    '--theme-accent': tokens.accent,
    '--theme-secondary': tokens.secondary,
    '--theme-text': tokens.text,
    '--theme-surface': tokens.surface,
    '--theme-background': tokens.background,
    '--theme-border': tokens.border,
    
    // Extended colors
    '--theme-text-secondary': tokens.textSecondary,
    '--theme-text-subtle': tokens.textSubtle,
    '--theme-text-disabled': tokens.textDisabled,
    '--theme-surface-elevated': tokens.surfaceElevated,
    '--theme-surface-card': tokens.surfaceCard,
    '--theme-surface-hover': tokens.surfaceHover,
    '--theme-border-subtle': tokens.borderSubtle,
    '--theme-border-focus': tokens.borderFocus,
    
    // Glass effects
    '--theme-glass-background': tokens.glassBackground,
    '--theme-glass-border': tokens.glassBorder,
    '--theme-glass-shadow': tokens.glassShadow,
    '--theme-glass-hover-background': tokens.glassHoverBackground,
    
    // Shadows
    '--theme-shadow-small': tokens.shadowSmall,
    '--theme-shadow-medium': tokens.shadowMedium,
    '--theme-shadow-large': tokens.shadowLarge,
    '--theme-shadow-xlarge': tokens.shadowXLarge,
    '--theme-shadow-brand': tokens.shadowBrand,
    
    // Status colors
    '--theme-success': tokens.success,
    '--theme-warning': tokens.warning,
    '--theme-error': tokens.error,
    '--theme-info': tokens.info,
    '--theme-success-light': tokens.successLight,
    '--theme-warning-light': tokens.warningLight,
    '--theme-error-light': tokens.errorLight,
    '--theme-info-light': tokens.infoLight,
  };
};

export default themeTokens;