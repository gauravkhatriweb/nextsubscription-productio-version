/**
 * Health API Service
 * 
 * API service for fetching system health status from the backend.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

// REF: THEME/REFACTOR: Use centralized API configuration
import axios from 'axios';
import { API_CONFIG } from '../../constants/ui.js';

const apiBase = API_CONFIG.BASE_URL;

/**
 * Get system health status
 * 
 * Fetches comprehensive system health status from the backend.
 * Uses admin endpoint if authenticated, otherwise uses public health endpoint.
 * 
 * @param {boolean} bypassCache - Bypass cache to get fresh data
 * @param {boolean} useAdminEndpoint - Use admin endpoint (requires authentication)
 * @returns {Promise<Object>} Health status object
 */
export const getHealthStatus = async (bypassCache = false, useAdminEndpoint = false) => {
  try {
    let url;
    if (useAdminEndpoint) {
      // MONITORING: Use admin endpoint (requires authentication)
      url = `${apiBase}/api/admin/system/status`;
    } else {
      // MONITORING: Use public health endpoint
      url = bypassCache 
        ? `${apiBase}/api/health?force=true`
        : `${apiBase}/api/health`;
    }
    
    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // MONITORING: Handle both response formats
    // Admin endpoint returns { success: true, data: healthStatus }
    // Public endpoint returns healthStatus directly
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Health status error:', error);
    throw error;
  }
};

/**
 * Get system logs
 * 
 * Fetches system logs from the backend.
 * 
 * @param {number} limit - Maximum number of logs to return
 * @returns {Promise<Array>} Array of log entries
 */
export const getSystemLogs = async ({ limit = 100 } = {}) => {
  try {
    const response = await axios.get(`${apiBase}/api/admin/system/logs`, {
      withCredentials: true,
      params: { limit },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      return response.data.logs || [];
    }
    return [];
  } catch (error) {
    console.error('System logs error:', error);
    return [];
  }
};

/**
 * Get system logs for a specific date (archived)
 *
 * @param {string} date - YYYY-MM-DD
 * @param {number} limit - Max entries
 * @returns {Promise<Array>}
 */
export const getSystemLogsByDate = async (date, limit = 500) => {
  if (!date) {
    return [];
  }

  try {
    const response = await axios.get(`${apiBase}/api/admin/system/logs/${date}`, {
      withCredentials: true,
      params: { limit },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.logs || [];
    }
    return [];
  } catch (error) {
    console.error('Archived system logs error:', error);
    return [];
  }
};

/**
 * Get archived log snapshots metadata
 *
 * @returns {Promise<Array>}
 */
export const getArchivedLogSnapshots = async () => {
  try {
    const response = await axios.get(`${apiBase}/api/admin/system/logs-archives`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.archives || [];
    }
    return [];
  } catch (error) {
    console.error('Archived log snapshots error:', error);
    return [];
  }
};

/**
 * Get a specific archived log snapshot by file name
 *
 * @param {string} fileName
 * @returns {Promise<Object|null>}
 */
export const getArchivedLogSnapshot = async (fileName) => {
  if (!fileName) {
    return null;
  }

  try {
    const response = await axios.get(`${apiBase}/api/admin/system/logs-archives/${encodeURIComponent(fileName)}`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.archive;
    }
    return null;
  } catch (error) {
    console.error('Archived log snapshot error:', error);
    return null;
  }
};

/**
 * Get available log dates
 *
 * @returns {Promise<Array<string>>}
 */
export const getAvailableLogDates = async () => {
  try {
    const response = await axios.get(`${apiBase}/api/admin/system/logs-dates`, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.dates || [];
    }
    return [];
  } catch (error) {
    console.error('Log dates error:', error);
    return [];
  }
};

/**
 * Clear system logs
 * 
 * Clears system logs on the backend.
 * 
 * @returns {Promise<Object>} Result object
 */
export const clearSystemLogs = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/clear-logs`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Clear logs error:', error);
    throw error;
  }
};

/**
 * Refresh cache
 * 
 * Flushes cached data on the backend.
 * 
 * @returns {Promise<Object>} Result object
 */
export const refreshCache = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/refresh-cache`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Refresh cache error:', error);
    throw error;
  }
};

/**
 * Ping database
 * 
 * Verifies database connection and returns response time.
 * 
 * @returns {Promise<Object>} Result object
 */
export const pingDatabase = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/ping-database`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Ping database error:', error);
    throw error;
  }
};

/**
 * Ping API endpoints
 * 
 * Pings internal API endpoints and returns latency map.
 * 
 * @returns {Promise<Object>} Result object
 */
export const pingApiEndpoints = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/ping-api`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Ping API error:', error);
    throw error;
  }
};

/**
 * Run system diagnostics
 * 
 * Runs comprehensive system diagnostics.
 * 
 * @returns {Promise<Object>} Result object
 */
export const runSystemDiagnostics = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/diagnostics`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('System diagnostics error:', error);
    throw error;
  }
};

/**
 * Maintenance: Flush caches
 */
export const maintenanceCache = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/maintenance/cache`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance cache error:', error);
    throw error;
  }
};

/**
 * Maintenance: User stats & optional cleanup (GET)
 *
 * @param {Object} params
 */
export const maintenanceUsersStats = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.cleanup) {
      query.set('cleanup', 'true');
    }
    if (params.inactiveDays) {
      query.set('inactiveDays', params.inactiveDays);
    }
    if (params.mode) {
      query.set('mode', params.mode);
    }

    const queryString = query.toString();
    const response = await axios.get(
      `${apiBase}/api/admin/system/maintenance/users${queryString ? `?${queryString}` : ''}`,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance users stats error:', error);
    throw error;
  }
};

/**
 * Maintenance: User cleanup
 *
 * @param {Object} payload - Cleanup options
 */
export const maintenanceUsers = async (payload) => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/maintenance/users`,
      payload,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance users error:', error);
    throw error;
  }
};

/**
 * Maintenance: Rebuild database indexes
 */
export const maintenanceReindex = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/maintenance/reindex`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance reindex error:', error);
    throw error;
  }
};

/**
 * Maintenance: Storage health check
 */
export const maintenanceStorageHealth = async () => {
  try {
    const response = await axios.get(
      `${apiBase}/api/admin/system/maintenance/storage-health`,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance storage health error:', error);
    throw error;
  }
};

/**
 * Maintenance: Restart worker processes
 */
export const maintenanceRestartWorkers = async () => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/maintenance/restart-workers`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance restart workers error:', error);
    throw error;
  }
};

/**
 * Maintenance: Purge expired sessions
 *
 * @param {Object} payload
 */
export const maintenancePurgeSessions = async (payload = {}) => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/maintenance/purge-sessions`,
      payload,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance purge sessions error:', error);
    throw error;
  }
};

/**
 * Maintenance: Rotate logs into archives
 *
 * @param {Object} payload
 */
export const maintenanceRotateLogs = async (payload = {}) => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/maintenance/logs/rotate`,
      payload,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance rotate logs error:', error);
    throw error;
  }
};

/**
 * Maintenance: Global cleanup
 *
 * @param {Object} payload - Cleanup options
 */
export const maintenanceGlobal = async (payload) => {
  try {
    const response = await axios.post(
      `${apiBase}/api/admin/system/maintenance/all`,
      payload,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Maintenance global error:', error);
    throw error;
  }
};

export default {
  getHealthStatus,
  getSystemLogs,
  getSystemLogsByDate,
  getAvailableLogDates,
  clearSystemLogs,
  refreshCache,
  pingDatabase,
  pingApiEndpoints,
  runSystemDiagnostics,
  maintenanceCache,
  maintenanceUsersStats,
  maintenanceUsers,
  maintenanceReindex,
  maintenanceStorageHealth,
  maintenanceRestartWorkers,
  maintenancePurgeSessions,
  maintenanceRotateLogs,
  maintenanceGlobal,
  getArchivedLogSnapshots,
  getArchivedLogSnapshot
};

