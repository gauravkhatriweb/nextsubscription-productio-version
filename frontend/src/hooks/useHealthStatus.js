/**
 * useHealthStatus Hook
 * 
 * Custom React hook for fetching and managing system health status.
 * Provides real-time updates with configurable polling interval.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getHealthStatus } from '../lib/api/health.js';

/**
 * useHealthStatus Hook
 * 
 * Fetches system health status and provides real-time updates.
 * 
 * @param {Object} options - Hook options
 * @param {number} options.pollInterval - Polling interval in milliseconds (default: 10000)
 * @param {boolean} options.enabled - Enable/disable polling (default: true)
 * @param {boolean} options.bypassCache - Bypass cache to get fresh data (default: false)
 * @returns {Object} Hook result object
 */
export const useHealthStatus = (options = {}) => {
  const {
    pollInterval = 10000, // 10 seconds default
    enabled = true,
    bypassCache = false,
    useAdminEndpoint = false // Use admin endpoint for authenticated requests
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Store historical data for charts
  const [history, setHistory] = useState([]);
  const maxHistorySize = 50; // Keep last 50 data points
  
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch health status
   */
  const fetchData = useCallback(async (force = false) => {
    try {
      setError(null);
      const healthData = await getHealthStatus(force || bypassCache, useAdminEndpoint);
      
      if (isMountedRef.current) {
        setData(healthData);
        setLastUpdated(new Date());
        setLoading(false);
        
        // MONITORING: Add to history for charts
        setHistory(prev => {
          const newHistory = [...prev, {
            timestamp: new Date().toISOString(),
            data: healthData
          }];
          
          // Keep only last N entries
          if (newHistory.length > maxHistorySize) {
            return newHistory.slice(-maxHistorySize);
          }
          
          return newHistory;
        });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
        console.error('Health status fetch error:', err);
      }
    }
  }, [bypassCache, useAdminEndpoint]);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Initial fetch and polling setup
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    fetchData();
    
    // Set up polling if enabled
    if (enabled && pollInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, pollInterval);
    }
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval, fetchData]);

  // Get chart data from history
  const getChartData = useCallback((metricPath) => {
    return history.map(item => {
      const value = metricPath.split('.').reduce((obj, key) => obj?.[key], item.data);
      return {
        time: new Date(item.timestamp).toLocaleTimeString(),
        timestamp: item.timestamp,
        value: typeof value === 'number' ? value : parseFloat(value) || 0,
        label: item.timestamp
      };
    });
  }, [history]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    history,
    refresh,
    clearHistory,
    getChartData
  };
};

export default useHealthStatus;

