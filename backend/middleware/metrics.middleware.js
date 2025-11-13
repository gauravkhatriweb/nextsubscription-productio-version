/**
 * Metrics Middleware - Request Tracking for Health Monitoring
 * 
 * Tracks API requests, response times, and error rates for health monitoring.
 * Stores request metrics in memory for real-time API health reporting.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import { performance } from 'perf_hooks';

// Initialize global request history if it doesn't exist
if (!global.healthRequestHistory) {
  global.healthRequestHistory = [];
}

// Configuration
const MAX_HISTORY_SIZE = 10000; // Maximum number of requests to store
const HISTORY_TTL = 300000; // 5 minutes - how long to keep request history
const CLEANUP_INTERVAL = 60000; // 1 minute - how often to clean up old entries

/**
 * Cleanup old request history entries
 * Removes entries older than HISTORY_TTL
 */
const cleanupHistory = () => {
  const now = Date.now();
  const cutoff = now - HISTORY_TTL;

  if (global.healthRequestHistory && global.healthRequestHistory.length > 0) {
    global.healthRequestHistory = global.healthRequestHistory.filter(
      req => req.timestamp > cutoff
    );

    // If still too large, remove oldest entries
    if (global.healthRequestHistory.length > MAX_HISTORY_SIZE) {
      global.healthRequestHistory = global.healthRequestHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_HISTORY_SIZE);
    }
  }
};

// Set up periodic cleanup
if (!global.healthMetricsCleanupInterval) {
  global.healthMetricsCleanupInterval = setInterval(cleanupHistory, CLEANUP_INTERVAL);
}

/**
 * Request tracking middleware
 * 
 * Tracks request metrics including:
 * - Response time
 * - HTTP status code
 * - Request method
 * - Request path
 * - Timestamp
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const metricsMiddleware = (req, res, next) => {
  // Skip health check endpoints to avoid self-tracking
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  // Start performance measurement
  const startTime = performance.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response
  res.end = function (chunk, encoding) {
    // Call original end function
    originalEnd.call(this, chunk, encoding);

    // Calculate response time
    const responseTime = Math.round(performance.now() - startTime);

    // Get response status
    const status = res.statusCode;

    // Create request metric entry
    const metric = {
      timestamp: Date.now(),
      method: req.method,
      path: req.path,
      status: status,
      responseTime: responseTime,
      userAgent: req.get('user-agent') || 'unknown',
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    };

    // Add to global request history
    if (!global.healthRequestHistory) {
      global.healthRequestHistory = [];
    }

    global.healthRequestHistory.push(metric);

    // Cleanup if history is getting too large
    if (global.healthRequestHistory.length > MAX_HISTORY_SIZE * 1.2) {
      cleanupHistory();
    }
  };

  // Continue to next middleware
  next();
};

/**
 * Get request metrics summary
 * 
 * Returns summary of request metrics for the last N minutes
 * 
 * @param {number} minutes - Number of minutes to analyze (default: 1)
 * @returns {Object} Metrics summary
 */
export const getRequestMetrics = (minutes = 1) => {
  if (!global.healthRequestHistory || global.healthRequestHistory.length === 0) {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      errorRate: 0,
      requestsPerMinute: 0,
      statusCodes: {}
    };
  }

  const now = Date.now();
  const cutoff = now - (minutes * 60000);

  // Filter requests within time window
  const recentRequests = global.healthRequestHistory.filter(
    req => req.timestamp > cutoff
  );

  if (recentRequests.length === 0) {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      errorRate: 0,
      requestsPerMinute: 0,
      statusCodes: {}
    };
  }

  // Calculate metrics
  const totalRequests = recentRequests.length;
  const avgResponseTime = Math.round(
    recentRequests.reduce((sum, req) => sum + req.responseTime, 0) / totalRequests
  );

  const errorCount = recentRequests.filter(req => req.status >= 400).length;
  const errorRate = ((errorCount / totalRequests) * 100).toFixed(2);

  // Count status codes
  const statusCodes = {};
  recentRequests.forEach(req => {
    statusCodes[req.status] = (statusCodes[req.status] || 0) + 1;
  });

  return {
    totalRequests,
    avgResponseTime,
    errorRate: parseFloat(errorRate),
    requestsPerMinute: Math.round(totalRequests / minutes),
    statusCodes,
    timeWindow: `${minutes} minute(s)`
  };
};

/**
 * Clear request history
 * 
 * Clears all stored request metrics (useful for testing or memory management)
 */
export const clearRequestHistory = () => {
  if (global.healthRequestHistory) {
    global.healthRequestHistory = [];
  }
};

export default metricsMiddleware;

