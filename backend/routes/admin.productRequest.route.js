/**
 * Admin Product Request Routes
 * 
 * Defines all admin API routes for reviewing product requests.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import {
  getAdminProductRequests,
  getAdminProductRequestById
  // approveProductRequest,  // Not implemented in controller
  // rejectProductRequest,   // Not implemented in controller
  // requestChanges         // Not implemented in controller
} from '../controllers/admin.productRequest.controller.js';
import {
  getRequestCredentials,
  decryptCredential,
  approveCredential,
  rejectCredential
} from '../controllers/admin.productCredential.controller.js';
import { verifyAdminJWT } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

/**
 * Protected Admin Routes (Requires Admin Authentication)
 */

// GET /api/admin/product-requests - Get all product requests (queue)
router.get('/', verifyAdminJWT, getAdminProductRequests);

// GET /api/admin/product-requests/:id - Get product request by ID
router.get('/:id', verifyAdminJWT, getAdminProductRequestById);

// POST /api/admin/product-requests/:id/approve - Approve product request
// router.post('/:id/approve', verifyAdminJWT, approveProductRequest); // Not implemented in controller

// POST /api/admin/product-requests/:id/reject - Reject product request
// router.post('/:id/reject', verifyAdminJWT, rejectProductRequest); // Not implemented in controller

// POST /api/admin/product-requests/:id/request-changes - Request changes
// router.post('/:id/request-changes', verifyAdminJWT, requestChanges); // Not implemented in controller

// POST /api/admin/product-requests/:id/comment - Add comment
// router.post('/:id/comment', verifyAdminJWT, addComment); // Commented out due to missing controller function

// Admin Product Request Credential Routes
// GET /api/admin/product-requests/:requestId/credentials - Get credentials for request
router.get('/:requestId/credentials', verifyAdminJWT, getRequestCredentials);

// GET /api/admin/product-requests/:requestId/credentials/:credentialId/decrypt - Decrypt credential
router.get('/:requestId/credentials/:credentialId/decrypt', verifyAdminJWT, decryptCredential);

// POST /api/admin/product-requests/:requestId/credentials/:credentialId/approve - Approve credential
router.post('/:requestId/credentials/:credentialId/approve', verifyAdminJWT, approveCredential);

// POST /api/admin/product-requests/:requestId/credentials/:credentialId/reject - Reject credential
router.post('/:requestId/credentials/:credentialId/reject', verifyAdminJWT, rejectCredential);

export default router;

