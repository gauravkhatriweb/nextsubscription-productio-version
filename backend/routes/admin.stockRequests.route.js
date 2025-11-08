/**
 * Admin Stock Requests Routes
 * 
 * Routes for viewing all admin stock requests across vendors.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import {
  getAdminProductRequests
} from '../controllers/admin.productRequest.controller.js';
import { verifyAdminJWT } from '../middleware/adminAuth.middleware.js';

const router = express.Router();

/**
 * Protected Admin Routes (Requires Admin Authentication)
 */

// GET /api/admin/stock-requests - Get all stock requests across all vendors
router.get('/', verifyAdminJWT, (req, res, next) => {
  // Set vendorId to 'all' to fetch all requests
  req.params.vendorId = 'all';
  next();
}, getAdminProductRequests);

export default router;

