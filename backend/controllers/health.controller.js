/**
 * Health Controller - Health Check Endpoint Handler
 * 
 * Handles the /api/health route and returns comprehensive system health status.
 * Implements caching to reduce load on system resources.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import getHealthStatus from '../services/health.service.js';

// Cache configuration
const CACHE_TTL = 5000; // 5 seconds cache TTL

// In-memory cache store
const healthCache = {
  data: null,
  timestamp: null,
  isExpired: () => {
    if (!healthCache.data || !healthCache.timestamp) {
      return true;
    }
    const now = Date.now();
    return (now - healthCache.timestamp) > CACHE_TTL;
  },
  set: (data) => {
    healthCache.data = data;
    healthCache.timestamp = Date.now();
  },
  get: () => {
    if (healthCache.isExpired()) {
      return null;
    }
    return healthCache.data;
  },
  clear: () => {
    healthCache.data = null;
    healthCache.timestamp = null;
  }
};

/**
 * Get comprehensive health status with caching
 * 
 * Returns detailed health information for all system components.
 * Uses in-memory cache to reduce load on system resources.
 * Cache TTL: 5 seconds (configurable via CACHE_TTL)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getHealth = async (req, res) => {
  try {
    // HEALTH: Check if bypass cache query parameter is present
    const bypassCache = req.query.force === 'true' || req.query.nocache === 'true';

    // HEALTH: Check cache first (unless bypassed)
    if (!bypassCache) {
      const cachedData = healthCache.get();
      if (cachedData) {
        // Return cached data with cache indicator
        return res.status(cachedData.statusCode || 200).json({
          ...cachedData,
          cached: true,
          cacheAge: Math.round((Date.now() - healthCache.timestamp) / 1000),
          cacheTtl: CACHE_TTL / 1000
        });
      }
    }

    // HEALTH: Get fresh health status
    const healthStatus = await getHealthStatus();

    // Determine HTTP status code based on overall status
    let statusCode = 200;
    if (healthStatus.status === 'DEGRADED') {
      statusCode = 503; // Service Unavailable
    } else if (healthStatus.status === 'ERROR') {
      statusCode = 500; // Internal Server Error
    }

    // HEALTH: Add status code to health status for caching
    const healthData = {
      ...healthStatus,
      statusCode
    };

    // HEALTH: Cache the result
    healthCache.set(healthData);

    // HEALTH: Return health status with cache indicator
    res.status(statusCode).json({
      ...healthData,
      cached: false,
      cacheAge: 0
    });
  } catch (error) {
    // HEALTH: Error handling for health check failures
    console.error('Health check error:', error);
    
    // HEALTH: Don't cache errors
    healthCache.clear();
    
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      message: 'Health check failed',
      cached: false
    });
  }
};

/**
 * Clear health status cache
 * 
 * Clears the cached health status data.
 * Useful for forcing a fresh health check.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
export const clearHealthCache = (req, res) => {
  healthCache.clear();
  res.status(200).json({
    success: true,
    message: 'Health cache cleared',
    timestamp: new Date().toISOString()
  });
};

/**
 * Reset health cache (internal use)
 *
 * Clears cached health data without sending an HTTP response.
 * Used by maintenance services for cache resets.
 */
export const resetHealthCacheInternal = () => {
  healthCache.clear();
};

/**
 * Get cache status
 * 
 * Returns information about the health status cache.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void}
 */
export const getCacheStatus = (req, res) => {
  const isCached = healthCache.data !== null;
  const isExpired = healthCache.isExpired();
  const cacheAge = healthCache.timestamp 
    ? Math.round((Date.now() - healthCache.timestamp) / 1000)
    : 0;

  res.status(200).json({
    cached: isCached && !isExpired,
    expired: isExpired,
    cacheAge: cacheAge,
    cacheTtl: CACHE_TTL / 1000,
    timestamp: healthCache.timestamp ? new Date(healthCache.timestamp).toISOString() : null
  });
};

export default getHealth;

