/**
 * Admin System Monitoring Controller
 * 
 * Handles system monitoring endpoints for admin dashboard.
 * All endpoints require admin authentication.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import {
  getSystemStatus,
  getSystemLogs,
  getSystemLogsByDate,
  getAvailableLogDates,
  clearSystemLogs,
  refreshCache,
  pingDatabase,
  pingApiEndpoints,
  runSystemDiagnostics
} from '../services/systemMonitoring.service.js';
import {
  performCacheMaintenance,
  cleanupUserData,
  performGlobalCleanup
} from '../services/maintenance.service.js';
import getHealthStatus from '../services/health.service.js';

/**
 * Controller: Get System Status
 * 
 * Returns current system metrics using the comprehensive health service.
 * 
 * @route GET /api/admin/system/status
 * @protected (requires admin authentication)
 */
export const getSystemStatusController = async (req, res) => {
  try {
    // MONITORING: Use comprehensive health service for system status
    const healthStatus = await getHealthStatus();
    return res.status(200).json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    console.error('System status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message
    });
  }
};

/**
 * Controller: Get System Logs
 * 
 * Returns recent system logs and errors.
 * 
 * @route GET /api/admin/system/logs
 * @protected (requires admin authentication)
 */
export const getSystemLogsController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await getSystemLogs(limit);
    return res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get system logs'
    });
  }
};

/**
 * Controller: Get Archived System Logs
 *
 * Returns archived system logs for a specific date.
 *
 * @route GET /api/admin/system/logs/:date
 * @protected (requires admin authentication)
 */
export const getSystemLogsByDateController = async (req, res) => {
  try {
    const { date } = req.params;
    const limit = parseInt(req.query.limit) || 500;
    const logs = await getSystemLogsByDate(date, limit);
    return res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get archived system logs'
    });
  }
};

/**
 * Controller: Get Available Log Dates
 *
 * Returns list of available archived log dates.
 *
 * @route GET /api/admin/system/logs-dates
 * @protected (requires admin authentication)
 */
export const getAvailableLogDatesController = async (req, res) => {
  try {
    const dates = await getAvailableLogDates();
    return res.status(200).json({
      success: true,
      dates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get log dates'
    });
  }
};

/**
 * Controller: Clear System Logs
 * 
 * Clears system logs (marks them as cleared).
 * 
 * @route POST /api/admin/system/clear-logs
 * @protected (requires admin authentication)
 */
export const clearSystemLogsController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const result = await clearSystemLogs(adminEmail);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to clear system logs'
    });
  }
};

/**
 * Controller: Refresh Cache
 * 
 * Flushes cached data.
 * 
 * @route POST /api/admin/system/refresh-cache
 * @protected (requires admin authentication)
 */
export const refreshCacheController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    
    const result = await refreshCache(adminEmail);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh cache'
    });
  }
};

/**
 * Controller: Maintenance - Cache Cleanup
 *
 * @route POST /api/admin/system/maintenance/cache
 * @protected
 */
export const maintenanceCacheController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await performCacheMaintenance(adminEmail, { ipAddress, userAgent });
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Cache maintenance failed'
    });
  }
};

/**
 * Controller: Maintenance - User Cleanup
 *
 * @route POST /api/admin/system/maintenance/users
 * @protected
 */
export const maintenanceUsersController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const options = req.body || {};

    const result = await cleanupUserData(adminEmail, options);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'User maintenance failed'
    });
  }
};

/**
 * Controller: Maintenance - Global Cleanup
 *
 * @route POST /api/admin/system/maintenance/all
 * @protected
 */
export const maintenanceGlobalController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const options = req.body || {};

    const result = await performGlobalCleanup(adminEmail, options);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Global cleanup failed'
    });
  }
};

/**
 * Controller: Ping Database
 * 
 * Verifies database connection and returns response time.
 * 
 * @route POST /api/admin/system/ping-database
 * @protected (requires admin authentication)
 */
export const pingDatabaseController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const result = await pingDatabase(adminEmail);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      connected: false
    });
  }
};

/**
 * Controller: Ping API Endpoints
 * 
 * Pings internal API endpoints and returns latency map.
 * 
 * @route POST /api/admin/system/ping-api
 * @protected (requires admin authentication)
 */
export const pingApiController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const result = await pingApiEndpoints(adminEmail);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to ping API endpoints'
    });
  }
};

/**
 * Controller: System Diagnostics
 * 
 * Runs comprehensive system diagnostics.
 * 
 * @route POST /api/admin/system/diagnostics
 * @protected (requires admin authentication)
 */
export const systemDiagnosticsController = async (req, res) => {
  try {
    const adminEmail = req.admin?.email || null;
    const result = await runSystemDiagnostics(adminEmail);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'System diagnostics failed'
    });
  }
};

