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
  clearSystemLogs,
  refreshCache,
  pingDatabase,
  pingApiEndpoints,
  runSystemDiagnostics
} from '../services/systemMonitoring.service.js';

/**
 * Controller: Get System Status
 * 
 * Returns current system metrics.
 * 
 * @route GET /api/admin/system/status
 * @protected (requires admin authentication)
 */
export const getSystemStatusController = async (req, res) => {
  try {
    const status = await getSystemStatus();
    return res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get system status'
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

