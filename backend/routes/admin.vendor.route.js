/**
 * Admin Vendor Routes
 * 
 * Defines all vendor management API routes.
 * All routes require admin authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import {
  createVendorController,
  getvendorController,
  getVendorByIdController,
  updateVendorController,
  updatevendortatusController,
  resendCredentialsController,
  resetVendorPasswordController,
  getVendorPasswordController
} from '../controllers/admin.vendor.controller.js';
import {
  createAdminProductRequest,
  getAdminProductRequests,
  getAdminProductRequestById,
  getRequestTemplates,
  cancelAdminProductRequest,
  getVendorProducts
} from '../controllers/admin.productRequest.controller.js';
import { verifyAdminJWT } from '../middleware/adminAuth.middleware.js';
import { rateLimitSystemActions, rateLimitVendorPassword } from '../middleware/rateLimitSystem.js';

const router = express.Router();

/**
 * Protected Admin Routes (Requires Admin Authentication)
 */

// POST /api/admin/vendor - Create vendor
router.post('/', verifyAdminJWT, createVendorController);

// GET /api/admin/vendor - List vendor
router.get('/', verifyAdminJWT, getvendorController);

// GET /api/admin/vendor/:id - Get vendor details
router.get('/:id', verifyAdminJWT, getVendorByIdController);

// GET /api/admin/vendor/:id/password - Retrieve vendor password (admin-only)
router.get('/:id/password', verifyAdminJWT, rateLimitVendorPassword, getVendorPasswordController);

// PUT /api/admin/vendor/:id - Update vendor
router.put('/:id', verifyAdminJWT, updateVendorController);

// PUT /api/admin/vendor/:id/status - Update vendor status
router.put('/:id/status', verifyAdminJWT, updatevendortatusController);

// POST /api/admin/vendor/:id/resend-credentials - Resend credentials
router.post('/:id/resend-credentials', verifyAdminJWT, rateLimitSystemActions, resendCredentialsController);

// POST /api/admin/vendor/:id/reset-password - Reset password
router.post('/:id/reset-password', verifyAdminJWT, rateLimitSystemActions, resetVendorPasswordController);

// Admin Product Request Routes
// GET /api/admin/vendor/:vendorId/products - Get vendor's approved products
router.get('/:vendorId/products', verifyAdminJWT, getVendorProducts);

// POST /api/admin/vendor/:vendorId/requests - Create stock request
router.post('/:vendorId/requests', verifyAdminJWT, createAdminProductRequest);

// GET /api/admin/vendor/:vendorId/requests - Get all requests for vendor (or all if vendorId='all')
router.get('/:vendorId/requests', verifyAdminJWT, getAdminProductRequests);

// GET /api/admin/vendor/:vendorId/requests/:id - Get request by ID
router.get('/:vendorId/requests/:id', verifyAdminJWT, getAdminProductRequestById);

// GET /api/admin/vendor/:vendorId/requests/:id/templates - Get templates
router.get('/:vendorId/requests/:id/templates', verifyAdminJWT, getRequestTemplates);

// POST /api/admin/vendor/:vendorId/requests/:id/cancel - Cancel request
router.post('/:vendorId/requests/:id/cancel', verifyAdminJWT, cancelAdminProductRequest);

export default router;

