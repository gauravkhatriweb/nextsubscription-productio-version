/**
 * Theme Tokens - Backward Compatibility Re-export
 * 
 * REF: THEME/REFACTOR: Re-exports from constants/themeTokens.js for backward compatibility.
 * This file maintains existing imports while directing to the new centralized location.
 * 
 * @deprecated Import from '../constants/themeTokens' instead
 * @module theme/themeTokens
 */

// REF: THEME/REFACTOR: Re-export from centralized constants location
export { themeTokens, getCSSVariables, getThemeToken } from '../constants/themeTokens';
export { themeTokens as default } from '../constants/themeTokens';
