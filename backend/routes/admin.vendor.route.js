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
  resetVendorPasswordController
} from '../controllers/admin.vendor.controller.js';
import { verifyAdminJWT } from '../middleware/adminAuth.middleware.js';
import { rateLimitSystemActions } from '../middleware/rateLimitSystem.js';

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

// PUT /api/admin/vendors/:id - Update vendor
router.put('/:id', verifyAdminJWT, updateVendorController);

// PUT /api/admin/vendors/:id/status - Update vendor status
router.put('/:id/status', verifyAdminJWT, updateVendorStatusController);

// POST /api/admin/vendors/:id/resend-credentials - Resend credentials
router.post('/:id/resend-credentials', verifyAdminJWT, rateLimitSystemActions, resendCredentialsController);

// POST /api/admin/vendors/:id/reset-password - Reset password
router.post('/:id/reset-password', verifyAdminJWT, rateLimitSystemActions, resetVendorPasswordController);

export default router;

