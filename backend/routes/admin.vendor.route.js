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
  getVendorsController,
  getVendorByIdController,
  updateVendorController,
  updateVendorStatusController,
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

// POST /api/admin/vendors - Create vendor
router.post('/', verifyAdminJWT, createVendorController);

// GET /api/admin/vendors - List vendors
router.get('/', verifyAdminJWT, getVendorsController);

// GET /api/admin/vendors/:id - Get vendor details
router.get('/:id', verifyAdminJWT, getVendorByIdController);

// GET /api/admin/vendors/:id/password - Retrieve vendor password (admin-only)
router.get('/:id/password', verifyAdminJWT, rateLimitVendorPassword, getVendorPasswordController);

// PUT /api/admin/vendors/:id - Update vendor
router.put('/:id', verifyAdminJWT, updateVendorController);

// PUT /api/admin/vendors/:id/status - Update vendor status
router.put('/:id/status', verifyAdminJWT, updateVendorStatusController);

// POST /api/admin/vendors/:id/resend-credentials - Resend credentials
router.post('/:id/resend-credentials', verifyAdminJWT, rateLimitSystemActions, resendCredentialsController);

// POST /api/admin/vendors/:id/reset-password - Reset password
router.post('/:id/reset-password', verifyAdminJWT, rateLimitSystemActions, resetVendorPasswordController);

// Admin Product Request Routes
// GET /api/admin/vendors/:vendorId/products - Get vendor's approved products
router.get('/:vendorId/products', verifyAdminJWT, getVendorProducts);

// POST /api/admin/vendors/:vendorId/requests - Create stock request
router.post('/:vendorId/requests', verifyAdminJWT, createAdminProductRequest);

// GET /api/admin/vendors/:vendorId/requests - Get all requests for vendor (or all if vendorId='all')
router.get('/:vendorId/requests', verifyAdminJWT, getAdminProductRequests);

// GET /api/admin/vendors/:vendorId/requests/:id - Get request by ID
router.get('/:vendorId/requests/:id', verifyAdminJWT, getAdminProductRequestById);

// GET /api/admin/vendors/:vendorId/requests/:id/templates - Get templates
router.get('/:vendorId/requests/:id/templates', verifyAdminJWT, getRequestTemplates);

// POST /api/admin/vendors/:vendorId/requests/:id/cancel - Cancel request
router.post('/:vendorId/requests/:id/cancel', verifyAdminJWT, cancelAdminProductRequest);

export default router;

