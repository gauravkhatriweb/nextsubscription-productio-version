/**
 * Admin System Monitoring Routes
 * 
 * Defines all system monitoring API routes.
 * All routes require admin authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import express from 'express';
import {
  getSystemStatusController,
  getSystemLogsController,
  clearSystemLogsController,
  refreshCacheController,
  pingDatabaseController,
  pingApiController,
  systemDiagnosticsController
} from '../controllers/admin.system.controller.js';
import { verifyAdminJWT } from '../middleware/adminAuth.middleware.js';
import { rateLimitSystemActions } from '../middleware/rateLimitSystem.js';

const router = express.Router();

/**
 * Protected Admin Routes (Requires Admin Authentication)
 */

// GET /api/admin/system/status - Get system status
router.get('/status', verifyAdminJWT, getSystemStatusController);

// GET /api/admin/system/logs - Get system logs
router.get('/logs', verifyAdminJWT, getSystemLogsController);

// POST /api/admin/system/clear-logs - Clear system logs
router.post('/clear-logs', verifyAdminJWT, rateLimitSystemActions, clearSystemLogsController);

// POST /api/admin/system/refresh-cache - Refresh cache
router.post('/refresh-cache', verifyAdminJWT, rateLimitSystemActions, refreshCacheController);

// POST /api/admin/system/ping-database - Ping database
router.post('/ping-database', verifyAdminJWT, rateLimitSystemActions, pingDatabaseController);

// POST /api/admin/system/ping-api - Ping API endpoints
router.post('/ping-api', verifyAdminJWT, rateLimitSystemActions, pingApiController);

// POST /api/admin/system/diagnostics - Run system diagnostics
router.post('/diagnostics', verifyAdminJWT, rateLimitSystemActions, systemDiagnosticsController);

export default router;

