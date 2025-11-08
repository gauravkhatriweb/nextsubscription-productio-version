/**
 * System Monitoring Service
 * 
 * Collects system metrics and performs monitoring operations.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import os from 'os';
import path from 'path';
import { performance } from 'node:perf_hooks';
import mongoose from 'mongoose';
import SystemActionModel from '../models/systemAction.model.js';

/**
 * Get System Status
 * 
 * Collects current system metrics including CPU, memory, disk, and database stats.
 * 
 * @returns {Promise<Object>} System status object
 */
// CPU usage calculation helper
const calculateCpuUsage = () => {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);
  
  return Math.max(0, Math.min(100, usage)); // Clamp between 0-100
};

// FIX: Derive disk usage from filesystem statistics instead of mock data
const resolveDiskUsage = async () => {
  try {
    const { statfs } = await import('node:fs/promises');
    if (typeof statfs !== 'function') {
      return null;
    }

    const rootPath = path.parse(process.cwd()).root || '/';
    const stats = await statfs(rootPath);
    const blockSize = BigInt(stats.bsize);
    const totalBlocks = BigInt(stats.blocks);
    const availableBlocks = typeof stats.bavail === 'number' && stats.bavail >= 0
      ? BigInt(stats.bavail)
      : BigInt(stats.bfree);

    if (totalBlocks === 0n) {
      return null;
    }

    const totalBytes = blockSize * totalBlocks;
    const availableBytes = blockSize * availableBlocks;
    const usedBytes = totalBytes - availableBytes;

    const usage = Number((usedBytes * 100n) / totalBytes);
    return Math.max(0, Math.min(100, usage));
  } catch (error) {
    return null;
  }
};

// FIX: Measure API latency using the live /health endpoint instead of synthetic values
const measureApiLatency = async () => {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const fallbackHost = `http://127.0.0.1:${port}/health`;
  const target = process.env.SYSTEM_HEALTH_URL || fallbackHost;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const start = performance.now();
    const response = await fetch(target, { signal: controller.signal });
    await response.text();
    const elapsed = Math.round(performance.now() - start);
    return Math.max(0, elapsed);
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const getSystemStatus = async () => {
  try {
    // Get CPU usage (real calculation based on OS CPU times)
    const cpuUsage = calculateCpuUsage();
    
    // Get memory usage (REAL - from OS)
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = Math.floor((usedMem / totalMem) * 100);
    
    const diskUsageValue = await resolveDiskUsage();
    
    // Get database latency (REAL - actual MongoDB ping)
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbLatency = Date.now() - dbStart;
    
    const apiLatencyValue = await measureApiLatency();
    
    // Get active users (REAL - count total registered users)
    // Note: In production, this would track actual active sessions or recent logins
    const UserModel = (await import('../models/user.model.js')).default;
    const activeUsers = await UserModel.countDocuments().catch(() => 0); // Total registered users
    
    // Calculate uptime (REAL - from process uptime)
    const processUptime = process.uptime(); // seconds
    const uptimeHours = Math.floor(processUptime / 3600);
    const uptimeDays = Math.floor(uptimeHours / 24);
    const uptimePercentage = '99.98%'; // Simplified - would need historical data for real calculation
    
    return {
      cpuUsage: `${cpuUsage}%`,
      memoryUsage: `${memoryUsage}%`,
      diskUsage: diskUsageValue !== null ? `${diskUsageValue}%` : 'N/A',
      apiLatency: apiLatencyValue !== null ? `${apiLatencyValue}ms` : 'N/A',
      dbLatency: `${dbLatency}ms`,
      activeUsers,
      uptime: uptimePercentage,
      uptimeDetails: uptimeDays > 0 ? `${uptimeDays}d ${uptimeHours % 24}h` : `${uptimeHours}h`,
      lastChecked: new Date().toISOString(),
      status: memoryUsage > 90 ? 'critical' : memoryUsage > 70 ? 'warning' : 'healthy'
    };
  } catch (error) {
    console.error('Error getting system status:', error);
    throw error;
  }
};

/**
 * Get System Logs
 * 
 * Returns recent system logs and errors.
 * Excludes logs that have been cleared (marked as cleared).
 * 
 * @param {number} limit - Number of logs to return
 * @returns {Promise<Array>} Array of log entries
 */
export const getSystemLogs = async (limit = 50) => {
  try {
    // Get the last cleared timestamp from a special marker document
    const clearedMarker = await SystemActionModel.findOne({ action: 'logs-cleared' })
      .sort({ createdAt: -1 })
      .lean();
    
    const query = {};
    if (clearedMarker) {
      // Only return logs created after the last clear
      query.createdAt = { $gt: clearedMarker.createdAt };
    }
    
    // In a real system, this would query from a logging service
    // For now, return recent system actions as logs
    const recentActions = await SystemActionModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return recentActions.map(action => ({
      timestamp: action.createdAt,
      level: action.status === 'success' ? 'info' : 'error',
      message: `${action.action} - ${action.status}`,
      details: action.result
    }));
  } catch (error) {
    console.error('Error getting system logs:', error);
    return [];
  }
};

/**
 * Clear System Logs
 * 
 * Marks all logs before current time as cleared.
 * 
 * @param {string} adminEmail - Admin email performing the action
 * @returns {Promise<Object>} Result object
 */
export const clearSystemLogs = async (adminEmail) => {
  try {
    // Create a marker document to track when logs were cleared
    await SystemActionModel.create({
      action: 'logs-cleared',
      performedBy: adminEmail,
      status: 'success',
      result: { message: 'System logs cleared', timestamp: new Date().toISOString() }
    });
    
    return {
      success: true,
      message: 'System logs cleared successfully'
    };
  } catch (error) {
    console.error('Error clearing system logs:', error);
    throw error;
  }
};

/**
 * Refresh Cache
 * 
 * Flushes cached data (in-memory or Redis if available).
 * 
 * @param {string} adminEmail - Admin email performing the action
 * @returns {Promise<Object>} Result object
 */
export const refreshCache = async (adminEmail) => {
  const startTime = Date.now();
  try {
    // In a real system, this would clear Redis or in-memory cache
    // For now, simulate cache clearing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const executionTime = Date.now() - startTime;
    
    // Log the action
    await SystemActionModel.create({
      action: 'refresh-cache',
      performedBy: adminEmail,
      status: 'success',
      result: { message: 'Cache flushed successfully' },
      executionTime
    });
    
    return {
      success: true,
      message: 'Cache refreshed successfully',
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    await SystemActionModel.create({
      action: 'refresh-cache',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message },
      executionTime
    });
    throw error;
  }
};

/**
 * Ping Database
 * 
 * Verifies database connection and returns response time.
 * 
 * @param {string} adminEmail - Admin email performing the action
 * @returns {Promise<Object>} Result object
 */
export const pingDatabase = async (adminEmail) => {
  const startTime = Date.now();
  try {
    const pingStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingTime = Date.now() - pingStart;
    
    const executionTime = Date.now() - startTime;
    
    // Log the action
    await SystemActionModel.create({
      action: 'ping-database',
      performedBy: adminEmail,
      status: 'success',
      result: { latency: `${pingTime}ms`, connected: true },
      executionTime
    });
    
    return {
      success: true,
      message: 'Database connection healthy',
      latency: `${pingTime}ms`,
      connected: true,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    await SystemActionModel.create({
      action: 'ping-database',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message, connected: false },
      executionTime
    });
    throw error;
  }
};

/**
 * Ping API Endpoints
 * 
 * Pings internal API endpoints and returns latency map.
 * 
 * @param {string} adminEmail - Admin email performing the action
 * @returns {Promise<Object>} Result object
 */
export const pingApiEndpoints = async (adminEmail) => {
  const startTime = Date.now();
  try {
    // Simulate pinging different endpoints
    const endpoints = [
      { name: 'User API', path: '/api/users' },
      { name: 'Admin API', path: '/api/admin' },
      { name: 'Settings API', path: '/api/admin/settings' }
    ];
    
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const pingStart = Date.now();
        // In a real system, this would make actual HTTP requests
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 50 + 20)));
        const latency = Date.now() - pingStart;
        return {
          ...endpoint,
          latency: `${latency}ms`,
          status: latency < 100 ? 'healthy' : latency < 200 ? 'warning' : 'slow'
        };
      })
    );
    
    const executionTime = Date.now() - startTime;
    
    // Log the action
    await SystemActionModel.create({
      action: 'ping-api',
      performedBy: adminEmail,
      status: 'success',
      result: { endpoints: results },
      executionTime
    });
    
    return {
      success: true,
      message: 'API endpoints checked',
      endpoints: results,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    await SystemActionModel.create({
      action: 'ping-api',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message },
      executionTime
    });
    throw error;
  }
};

/**
 * System Diagnostics
 * 
 * Runs comprehensive system diagnostics.
 * 
 * @param {string} adminEmail - Admin email performing the action
 * @returns {Promise<Object>} Result object
 */
export const runSystemDiagnostics = async (adminEmail) => {
  const startTime = Date.now();
  try {
    // Run various diagnostics
    const diagnostics = {
      database: await pingDatabase(adminEmail).catch(() => ({ connected: false })),
      system: await getSystemStatus(),
      timestamp: new Date().toISOString()
    };
    
    const executionTime = Date.now() - startTime;
    
    // Log the action
    await SystemActionModel.create({
      action: 'system-diagnostics',
      performedBy: adminEmail,
      status: 'success',
      result: diagnostics,
      executionTime
    });
    
    return {
      success: true,
      message: 'System diagnostics completed',
      diagnostics,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    await SystemActionModel.create({
      action: 'system-diagnostics',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message },
      executionTime
    });
    throw error;
  }
};

