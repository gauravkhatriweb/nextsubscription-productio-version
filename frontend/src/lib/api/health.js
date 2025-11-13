/**
 * Health API Service
 * 
 * API service for fetching system health status from the backend.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import axios from 'axios';

const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

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
  maintenanceUsers,
  maintenanceGlobal
};

