/**
 * Admin Routes - API Endpoint Definitions
 * 
 * Defines all admin-related API routes for one-time code authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import { 
  requestAdminCode, 
  verifyAdminCode, 
  getAdminInfo,
  adminLogout
} from '../controllers/admin.controller.js';
import { 
  rateLimitAdminCodeRequest, 
  rateLimitAdminCodeVerify 
} from '../middleware/rateLimitAdmin.js';
import { verifyAdminJWT } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

/**
 * Test route to verify admin routes are working
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin routes are working',
    timestamp: new Date().toISOString()
  });
});

/**
 * Public Admin Routes (Rate Limited)
 */

// POST /api/admin/request-code - Request admin one-time code
router.post('/request-code', rateLimitAdminCodeRequest, requestAdminCode);

// POST /api/admin/verify-code - Verify admin code and get token
router.post('/verify-code', rateLimitAdminCodeVerify, verifyAdminCode);

/**
 * Protected Admin Routes (Requires Admin Authentication)
 */

// GET /api/admin/me - Get admin information
router.get('/me', verifyAdminJWT, getAdminInfo);

// POST /api/admin/logout - Admin logout
router.post('/logout', verifyAdminJWT, adminLogout);

export default router;

