/**
 * UI Constants - Centralized Frontend Configuration
 * 
 * REF: THEME/REFACTOR: Centralized UI constants to replace hardcoded strings,
 * URLs, and configuration values throughout the application.
 * 
 * @module constants/ui
 */

// REF: THEME/REFACTOR: API configuration - replaces hardcoded localhost URLs
export const API_CONFIG = {
  /**
   * Base API URL - uses environment variable or falls back to localhost
   * REF: THEME/REFACTOR: Centralized API base URL to replace 40+ hardcoded instances
   */
  BASE_URL: (() => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && String(envUrl).trim()) {
      return String(envUrl).trim().replace(/\/+$/, '');
    }
    return 'http://localhost:3000';
  })(),
  
  /**
   * API endpoints - centralized route definitions
   */
  ENDPOINTS: {
    // Health & System
    HEALTH: '/api/health',
    ADMIN_SYSTEM_STATUS: '/api/admin/system/status',
    ADMIN_SYSTEM_LOGS: '/api/admin/system/logs',
    ADMIN_SYSTEM_LOGS_ARCHIVES: '/api/admin/system/logs-archives',
    
    // User
    USER_LOGIN: '/api/users/login',
    USER_REGISTER: '/api/users/register',
    USER_VERIFY_OTP: '/api/users/verify-otp',
    USER_FORGOT_PASSWORD: '/api/users/forgot-password',
    USER_RESET_PASSWORD: '/api/users/reset-password',
    USER_PROFILE: '/api/users/profile',
    
    // Vendor
    VENDOR_LOGIN: '/api/vendor/login',
    VENDOR_DASHBOARD: '/api/vendor/dashboard',
    VENDOR_PRODUCTS: '/api/vendor/products',
    VENDOR_PRODUCT_REQUESTS: '/api/vendor/product-requests',
    VENDOR_ORDERS: '/api/vendor/orders',
    
    // Admin
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_DASHBOARD: '/api/admin/dashboard',
    ADMIN_VENDORS: '/api/admin/vendor',
    ADMIN_PRODUCT_REQUESTS: '/api/admin/product-requests',
    ADMIN_SETTINGS: '/api/admin/settings',
  },
};

// REF: THEME/REFACTOR: Route paths - centralized route definitions
export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  ONBOARDING: '/onboarding',
  
  // User routes
  USER_LOGIN: '/user/login',
  USER_REGISTER: '/user/register',
  USER_VERIFY_OTP: '/user/verify-otp',
  USER_PROFILE: '/user/profile',
  USER_HOME: '/user/home',
  USER_DASHBOARD: '/user/dashboard',
  USER_FORGOT_PASSWORD: '/user/forgot-password',
  USER_VERIFY_RESET_OTP: '/user/verify-reset-otp',
  USER_RESET_PASSWORD: '/user/reset-password',
  USER_RESET_PASSWORD_FINAL: '/user/reset-password-final',
  USER_CHECKOUT: '/user/checkout',
  
  // Vendor routes
  VENDOR_LOGIN: '/vendor/login',
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_PRODUCTS: '/vendor/products',
  VENDOR_PRODUCT_CREATE: '/vendor/product/create',
  VENDOR_PRODUCT_REQUESTS: '/vendor/product-requests',
  VENDOR_PRODUCT_REQUEST_CREATE: '/vendor/product-request/create',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_ADMIN_REQUESTS: '/vendor/admin-requests',
  VENDOR_TEAM: '/vendor/team',
  VENDOR_REPORTS: '/vendor/reports',
  
  // Admin routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VENDORS: '/admin/vendor',
  ADMIN_VENDOR_CREATE: '/admin/vendor/create',
  ADMIN_VENDOR_DETAIL: '/admin/vendor/:id',
  ADMIN_PRODUCT_REQUESTS: '/admin/product-requests',
  ADMIN_STOCK_REQUESTS: '/admin/stock-requests',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SETTINGS_BRANDING: '/admin/settings/branding',
  ADMIN_SETTINGS_CONTENT: '/admin/settings/content',
  ADMIN_SETTINGS_THEME: '/admin/settings/theme',
  ADMIN_SETTINGS_PREVIEW: '/admin/settings/preview',
  ADMIN_SYSTEM_MONITORING: '/admin/monitoring',
  
  // Legal routes
  TERMS: '/terms',
  PRIVACY: '/privacy',
  FAQ: '/faq',
  CONTACT: '/contact',
  
  // Error routes
  NOT_FOUND: '/404',
};

// REF: THEME/REFACTOR: UI strings - centralized text constants
export const UI_STRINGS = {
  // Common actions
  BUTTONS: {
    SUBMIT: 'Submit',
    CANCEL: 'Cancel',
    SAVE: 'Save',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CREATE: 'Create',
    UPDATE: 'Update',
    BACK: 'Back',
    NEXT: 'Next',
    PREVIOUS: 'Previous',
    CLOSE: 'Close',
    CONFIRM: 'Confirm',
    LOGIN: 'Log In',
    LOGOUT: 'Log Out',
    REGISTER: 'Register',
    RESET: 'Reset',
    CLEAR: 'Clear',
    SEARCH: 'Search',
    FILTER: 'Filter',
    REFRESH: 'Refresh',
    LOADING: 'Loading...',
  },
  
  // Messages
  MESSAGES: {
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    LOADING: 'Please wait...',
    NO_DATA: 'No data available',
    NOT_FOUND: 'Page not found',
    UNAUTHORIZED: 'You are not authorized to access this page',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
  
  // Form labels
  FORMS: {
    EMAIL: 'Email',
    PASSWORD: 'Password',
    CONFIRM_PASSWORD: 'Confirm Password',
    NAME: 'Name',
    PHONE: 'Phone',
    ADDRESS: 'Address',
    CITY: 'City',
    COUNTRY: 'Country',
    ZIP_CODE: 'ZIP Code',
  },
  
  // Status labels
  STATUS: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },
};

// REF: THEME/REFACTOR: Application metadata
export const APP_CONFIG = {
  NAME: 'Next Subscription',
  VERSION: '1.0.0',
  DESCRIPTION: 'Subscription management platform',
};

// REF: THEME/REFACTOR: Feature flags and configuration
export const FEATURES = {
  ENABLE_DARK_MODE: true,
  ENABLE_ANALYTICS: false,
  ENABLE_ERROR_TRACKING: false,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
};

export default {
  API_CONFIG,
  ROUTES,
  UI_STRINGS,
  APP_CONFIG,
  FEATURES,
};

