/**
 * Vendor Routes
 * 
 * Defines all vendor API routes.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import multer from 'multer';
import {
  vendorLogin,
  getVendorInfo,
  // changePassword, // REMOVED: vendor cannot change passwords
  updateProfile,
  vendorLogout
} from '../controllers/vendor.controller.js';
import {
  rateLimitVendorLogin,
  rateLimitVendorAPI,
  rateLimitFileUpload
} from '../middleware/rateLimitVendor.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadAccounts
} from '../controllers/vendor.product.controller.js';
import {
  createProductRequest,
  getProductRequests,
  getProductRequestById,
  uploadProductRequestFiles
} from '../controllers/vendor.productRequest.controller.js';
import {
  getAdminRequests,
  getAdminRequestById,
  fulfillAdminRequest,
  rejectAdminRequest
} from '../controllers/vendor.adminRequest.controller.js';
import {
  uploadCredentials,
  getCredentials,
  uploadCredentialFiles
} from '../controllers/vendor.productCredential.controller.js';
import {
  getOrders,
  getOrderById,
  fulfillOrder
} from '../controllers/vendor.order.controller.js';
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} from '../controllers/vendor.team.controller.js';
import {
  getSalesReport,
  getPayouts,
  exportReport
} from '../controllers/vendor.report.controller.js';
import { verifyVendorJWT } from '../middleware/vendorAuth.middleware.js';

const router = express.Router();

// Multer configuration for file uploads with validation
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, SVG, and WebP images are allowed.'), false);
    }
  }
});

/**
 * Public Routes
 */

// POST /api/vendor/login - Vendor login (rate limited)
router.post('/login', rateLimitVendorLogin, vendorLogin);

/**
 * Protected Routes (Requires Vendor Authentication)
 */

// GET /api/vendor/me - Get vendor info
router.get('/me', verifyVendorJWT, getVendorInfo);

// PUT /api/vendor/change-password - REMOVED: vendor cannot change passwords (admin-only control)
// router.put('/change-password', verifyVendorJWT, changePassword);

// PUT /api/vendor/profile - Update profile (handles multipart/form-data, rate limited)
router.put('/profile', verifyVendorJWT, rateLimitFileUpload, upload.single('logo'), updateProfile);

// POST /api/vendor/logout - Vendor logout
router.post('/logout', verifyVendorJWT, vendorLogout);

// Product Routes (rate limited)
router.get('/products', verifyVendorJWT, rateLimitVendorAPI, getProducts);
router.get('/products/:id', verifyVendorJWT, rateLimitVendorAPI, getProductById);
router.post('/products', verifyVendorJWT, rateLimitVendorAPI, createProduct);
router.put('/products/:id', verifyVendorJWT, rateLimitVendorAPI, updateProduct);
router.delete('/products/:id', verifyVendorJWT, rateLimitVendorAPI, deleteProduct);
router.post('/products/:id/upload-accounts', verifyVendorJWT, rateLimitFileUpload, uploadAccounts);

// Product Request Routes (rate limited)
router.post('/products/requests', verifyVendorJWT, rateLimitVendorAPI, uploadProductRequestFiles, createProductRequest);
router.get('/products/requests', verifyVendorJWT, rateLimitVendorAPI, getProductRequests);
router.get('/products/requests/:id', verifyVendorJWT, rateLimitVendorAPI, getProductRequestById);

// Product Credential Routes (rate limited)
router.post('/products/:id/credentials', verifyVendorJWT, rateLimitFileUpload, uploadCredentialFiles, uploadCredentials);
router.get('/products/:id/credentials', verifyVendorJWT, rateLimitVendorAPI, getCredentials);

// Admin Request Routes (rate limited)
router.get('/admin-requests', verifyVendorJWT, rateLimitVendorAPI, getAdminRequests);
router.get('/admin-requests/:id', verifyVendorJWT, rateLimitVendorAPI, getAdminRequestById);
router.get('/admin-requests/:id/fulfill', verifyVendorJWT, rateLimitVendorAPI, fulfillAdminRequest);
router.post('/requests/:requestId/fulfill', verifyVendorJWT, rateLimitFileUpload, uploadCredentialFiles, uploadCredentials);
router.post('/admin-requests/:id/reject', verifyVendorJWT, rateLimitVendorAPI, rejectAdminRequest);

// Order Routes (rate limited)
router.get('/orders', verifyVendorJWT, rateLimitVendorAPI, getOrders);
router.get('/orders/:id', verifyVendorJWT, rateLimitVendorAPI, getOrderById);
router.put('/orders/:id/fulfill', verifyVendorJWT, rateLimitVendorAPI, fulfillOrder);

// Team Routes (rate limited)
router.get('/team', verifyVendorJWT, rateLimitVendorAPI, getTeamMembers);
router.post('/team', verifyVendorJWT, rateLimitVendorAPI, createTeamMember);
router.put('/team/:id', verifyVendorJWT, rateLimitVendorAPI, updateTeamMember);
router.delete('/team/:id', verifyVendorJWT, rateLimitVendorAPI, deleteTeamMember);

// Report Routes (rate limited)
router.get('/reports/sales', verifyVendorJWT, rateLimitVendorAPI, getSalesReport);
router.get('/reports/payouts', verifyVendorJWT, rateLimitVendorAPI, getPayouts);
router.get('/reports/export', verifyVendorJWT, rateLimitVendorAPI, exportReport);

export default router;

