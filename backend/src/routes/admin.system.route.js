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
  getSystemLogsByDateController,
  getAvailableLogDatesController,
  clearSystemLogsController,
  refreshCacheController,
  pingDatabaseController,
  pingApiController,
  systemDiagnosticsController,
  maintenanceCacheController,
  maintenanceUsersController,
  maintenanceGlobalController,
  maintenanceReindexController,
  maintenanceStorageHealthController,
  maintenanceRestartWorkersController,
  maintenancePurgeSessionsController,
  maintenanceRotateLogsController,
  getArchivedLogsController,
  getArchivedLogController
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

// GET /api/admin/system/logs/dates - Get available log dates
router.get('/logs-dates', verifyAdminJWT, getAvailableLogDatesController);

// GET /api/admin/system/logs-archives - List archived log snapshots
router.get('/logs-archives', verifyAdminJWT, getArchivedLogsController);

// GET /api/admin/system/logs-archives/:fileName - Get archived snapshot
router.get('/logs-archives/:fileName', verifyAdminJWT, getArchivedLogController);

// GET /api/admin/system/logs/:date - Get archived log data
router.get('/logs/:date', verifyAdminJWT, getSystemLogsByDateController);

// POST /api/admin/system/clear-logs - Clear system logs
router.post('/clear-logs', verifyAdminJWT, rateLimitSystemActions, clearSystemLogsController);

// POST /api/admin/system/refresh-cache - Refresh cache
router.post('/refresh-cache', verifyAdminJWT, rateLimitSystemActions, refreshCacheController);

// POST /api/admin/system/maintenance/cache - Flush caches
router.post('/maintenance/cache', verifyAdminJWT, rateLimitSystemActions, maintenanceCacheController);

// GET/POST /api/admin/system/maintenance/users - User maintenance stats & cleanup
router
  .route('/maintenance/users')
  .get(verifyAdminJWT, rateLimitSystemActions, maintenanceUsersController)
  .post(verifyAdminJWT, rateLimitSystemActions, maintenanceUsersController);

// POST /api/admin/system/maintenance/all - Global cleanup
router.post('/maintenance/all', verifyAdminJWT, rateLimitSystemActions, maintenanceGlobalController);

// POST /api/admin/system/maintenance/reindex - Rebuild indexes
router.post('/maintenance/reindex', verifyAdminJWT, rateLimitSystemActions, maintenanceReindexController);

// GET /api/admin/system/maintenance/storage-health - Storage health
router.get('/maintenance/storage-health', verifyAdminJWT, maintenanceStorageHealthController);

// POST /api/admin/system/maintenance/restart-workers - Restart workers
router.post('/maintenance/restart-workers', verifyAdminJWT, rateLimitSystemActions, maintenanceRestartWorkersController);

// POST /api/admin/system/maintenance/purge-sessions - Purge sessions
router.post('/maintenance/purge-sessions', verifyAdminJWT, rateLimitSystemActions, maintenancePurgeSessionsController);

// POST /api/admin/system/maintenance/logs/rotate - Rotate logs
router.post('/maintenance/logs/rotate', verifyAdminJWT, rateLimitSystemActions, maintenanceRotateLogsController);

// POST /api/admin/system/ping-database - Ping database
router.post('/ping-database', verifyAdminJWT, rateLimitSystemActions, pingDatabaseController);

// POST /api/admin/system/ping-api - Ping API endpoints
router.post('/ping-api', verifyAdminJWT, rateLimitSystemActions, pingApiController);

// POST /api/admin/system/diagnostics - Run system diagnostics
router.post('/diagnostics', verifyAdminJWT, rateLimitSystemActions, systemDiagnosticsController);

export default router;

