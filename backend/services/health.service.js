/**
 * Health Service - Comprehensive System Health Monitoring
 * 
 * Provides detailed health status for all system components including:
 * - Application status (version, uptime, environment)
 * - Database connectivity and metrics
 * - API latency and performance
 * - System resources (CPU, memory, disk)
 * - External service connectivity
 * - Security configuration checks
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import os from 'os';
import fs from 'fs/promises';
import { performance } from 'perf_hooks';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import si from 'systeminformation';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

/**
 * Format uptime from seconds to human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime (e.g., "1h 24m 17s")
 */
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted size (e.g., "2.3GB")
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)}${sizes[i]}`;
};

/**
 * Calculate CPU usage percentage
 * @returns {number} CPU usage percentage (0-100)
 */
const calculateCpuUsage = () => {
  const cpus = os.cpus();
  if (cpus.length === 0) return 0;

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
  const usage = 100 - (100 * idle / total);

  return Math.max(0, Math.min(100, Math.round(usage)));
};

/**
 * Get disk usage information using systeminformation
 * @returns {Promise<Object>} Disk usage object
 */
const getDiskUsage = async () => {
  try {
    // HEALTH: Get disk usage using systeminformation
    const fsSize = await si.fsSize();
    
    if (!fsSize || fsSize.length === 0) {
      return {
        status: 'UNKNOWN',
        usage: 'N/A',
        available: 'N/A',
        total: 'N/A',
        usagePercent: 0
      };
    }

    // Get root filesystem (usually first entry)
    const rootFs = fsSize[0];
    const totalBytes = rootFs.size;
    const usedBytes = rootFs.used;
    const availableBytes = rootFs.available;
    const usagePercent = totalBytes > 0 
      ? Math.round((usedBytes / totalBytes) * 100)
      : 0;

    return {
      status: usagePercent > 90 ? 'CRITICAL' : usagePercent > 80 ? 'WARNING' : 'OK',
      usage: formatBytes(usedBytes),
      available: formatBytes(availableBytes),
      total: formatBytes(totalBytes),
      usagePercent: usagePercent,
      mountPoint: rootFs.mount || 'N/A',
      filesystem: rootFs.fs || 'N/A',
      display: `${formatBytes(usedBytes)} / ${formatBytes(totalBytes)} (${usagePercent}%)`
    };
  } catch (error) {
    // Fallback to basic check if systeminformation fails
    try {
      const uploadsPath = join(__dirname, '..', 'uploads');
      await fs.access(uploadsPath);
      return {
        status: 'AVAILABLE',
        usage: 'N/A',
        available: 'N/A',
        total: 'N/A',
        usagePercent: 0,
        note: 'Detailed disk stats unavailable, directory accessible'
      };
    } catch (accessError) {
      return {
        status: 'UNKNOWN',
        usage: 'N/A',
        available: 'N/A',
        total: 'N/A',
        usagePercent: 0,
        error: error.message
      };
    }
  }
};

/**
 * Check application status
 * @returns {Object} Application status object
 */
export const getApplicationStatus = () => {
  const uptime = process.uptime();
  
  return {
    name: 'Next Subscription',
    version: packageJson.version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: formatUptime(uptime),
    uptimeSeconds: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
};

/**
 * Check database connectivity and metrics
 * @returns {Promise<Object>} Database status object
 */
export const getDatabaseStatus = async () => {
  try {
    const startTime = performance.now();
    
    // HEALTH: Checking MongoDB connection state
    const readyState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // HEALTH: Measuring MongoDB latency via ping
    await mongoose.connection.db.admin().ping();
    const latency = Math.round(performance.now() - startTime);

    // HEALTH: Fetching collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name).sort();

    // HEALTH: Get database stats
    const dbStats = await mongoose.connection.db.stats().catch(() => null);

    return {
      status: readyState === 1 ? 'UP' : 'DOWN',
      readyState: states[readyState] || 'unknown',
      latencyMs: latency,
      collections: collectionNames,
      databaseName: mongoose.connection.name,
      dataSize: dbStats ? formatBytes(dbStats.dataSize || 0) : 'N/A',
      collectionsCount: collectionNames.length
    };
  } catch (error) {
    return {
      status: 'DOWN',
      error: error.message,
      latencyMs: null,
      collections: [],
      databaseName: null
    };
  }
};

/**
 * Check API latency (using metrics middleware)
 * Uses request tracking middleware to get real-time API metrics
 * @returns {Object} API metrics object
 */
export const getApiMetrics = () => {
  // HEALTH: Use metrics middleware data for API metrics
  const requestHistory = global.healthRequestHistory || [];
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const fiveMinutesAgo = now - 300000;

  // Filter requests from last minute
  const recentRequests = requestHistory.filter(req => req.timestamp > oneMinuteAgo);
  // Filter requests from last 5 minutes for additional context
  const lastFiveMinRequests = requestHistory.filter(req => req.timestamp > fiveMinutesAgo);

  // Calculate average response time
  const avgResponseTime = recentRequests.length > 0
    ? Math.round(recentRequests.reduce((sum, req) => sum + req.responseTime, 0) / recentRequests.length)
    : 0;

  // Calculate error rate
  const errorCount = recentRequests.filter(req => req.status >= 400).length;
  const errorRate = recentRequests.length > 0
    ? ((errorCount / recentRequests.length) * 100).toFixed(2)
    : 0;

  // Calculate status code distribution
  const statusCodes = {};
  recentRequests.forEach(req => {
    const statusRange = `${Math.floor(req.status / 100)}xx`;
    statusCodes[statusRange] = (statusCodes[statusRange] || 0) + 1;
  });

  // Get top slowest endpoints
  const slowestEndpoints = recentRequests
    .sort((a, b) => b.responseTime - a.responseTime)
    .slice(0, 5)
    .map(req => ({
      path: req.path,
      method: req.method,
      responseTime: req.responseTime,
      status: req.status
    }));

  return {
    avgResponseTimeMs: avgResponseTime,
    requestsLastMinute: recentRequests.length,
    requestsLast5Minutes: lastFiveMinRequests.length,
    errorRatePercent: parseFloat(errorRate),
    totalRequests: requestHistory.length,
    statusCodes: statusCodes,
    slowestEndpoints: slowestEndpoints,
    timestamp: new Date().toISOString()
  };
};

/**
 * Get system resources (CPU, memory, disk)
 * @returns {Promise<Object>} System resources object
 */
export const getSystemResources = async () => {
  try {
    // HEALTH: Getting CPU usage
    const cpuUsage = calculateCpuUsage();
    
    // HEALTH: Getting memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercent = Math.round((usedMem / totalMem) * 100);

    // HEALTH: Getting load average
    const loadAvg = os.loadavg();
    const loadAverage = parseFloat(loadAvg[0].toFixed(2));

    // HEALTH: Getting disk usage using systeminformation
    const diskUsage = await getDiskUsage();

    // HEALTH: Get CPU temperature if available (may not be available on all systems)
    let cpuTemperature = null;
    try {
      const temp = await si.cpuTemperature();
      if (temp && temp.main) {
        cpuTemperature = `${temp.main}°C`;
      }
    } catch (error) {
      // CPU temperature not available on all systems, ignore
    }

    return {
      cpuUsage: `${cpuUsage}%`,
      cpuUsagePercent: cpuUsage,
      cpuTemperature: cpuTemperature || 'N/A',
      memory: {
        total: formatBytes(totalMem),
        used: formatBytes(usedMem),
        free: formatBytes(freeMem),
        usagePercent: memoryUsagePercent,
        display: `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`
      },
      loadAverage: loadAverage,
      diskUsage: diskUsage,
      cpuCount: os.cpus().length,
      hostname: os.hostname(),
      uptime: formatUptime(os.uptime())
    };
  } catch (error) {
    return {
      cpuUsage: 'N/A',
      memory: 'N/A',
      error: error.message
    };
  }
};

/**
 * Check external service connectivity with timeout
 * @param {string} url - Service URL to check
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Object>} Service status object
 */
const checkServiceHealth = async (url, timeoutMs = 3000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startTime = performance.now();
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'HEAD', // Use HEAD to reduce bandwidth
      headers: {
        'User-Agent': 'NextSubscription-HealthCheck/1.0'
      }
    }).catch(() => null);

    clearTimeout(timeout);
    const responseTime = Math.round(performance.now() - startTime);

    if (response && response.ok) {
      return {
        status: 'UP',
        responseTimeMs: responseTime,
        statusCode: response.status
      };
    } else {
      return {
        status: 'DOWN',
        responseTimeMs: responseTime,
        error: response ? `HTTP ${response.status}` : 'Connection failed'
      };
    }
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return {
        status: 'TIMEOUT',
        error: `Service check timed out after ${timeoutMs}ms`
      };
    }
    return {
      status: 'DOWN',
      error: error.message
    };
  }
};

/**
 * Check external service connectivity
 * @returns {Promise<Object>} External services status object
 */
export const getExternalServicesStatus = async () => {
  const services = {};
  const checks = [];

  // HEALTH: Checking email service (Gmail SMTP)
  checks.push(
    (async () => {
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            },
            connectionTimeout: 3000,
            greetingTimeout: 3000,
            socketTimeout: 3000
          });

          const verifyPromise = transporter.verify();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Email service verification timeout')), 3000)
          );

          await Promise.race([verifyPromise, timeoutPromise]);
          services.emailService = { status: 'UP' };
        } else {
          services.emailService = { status: 'NOT_CONFIGURED' };
        }
      } catch (error) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          services.emailService = { status: 'TIMEOUT', error: 'Email service verification timeout' };
        } else {
          services.emailService = { status: 'DOWN', error: error.message };
        }
      }
    })()
  );

  // HEALTH: Checking payment gateway (Stripe, PayPal, etc.)
  if (process.env.STRIPE_SECRET_KEY || process.env.PAYMENT_GATEWAY_URL) {
    checks.push(
      (async () => {
        // Stripe API base URL - checking if API is accessible
        const paymentUrl = process.env.PAYMENT_GATEWAY_URL || 'https://api.stripe.com';
        const healthCheck = await checkServiceHealth(paymentUrl, 3000);
        services.paymentGateway = {
          ...healthCheck,
          provider: process.env.PAYMENT_GATEWAY_PROVIDER || 'Stripe',
          configured: !!process.env.STRIPE_SECRET_KEY || !!process.env.PAYMENT_GATEWAY_URL
        };
      })()
    );
  } else {
    services.paymentGateway = { status: 'NOT_CONFIGURED' };
  }

  // HEALTH: Checking CDN service (Cloudflare, AWS CloudFront, etc.)
  if (process.env.CDN_URL || process.env.CLOUDFLARE_API_URL) {
    checks.push(
      (async () => {
        const cdnUrl = process.env.CDN_URL || process.env.CLOUDFLARE_API_URL || 'https://www.cloudflare.com';
        const healthCheck = await checkServiceHealth(cdnUrl, 3000);
        services.cdn = {
          ...healthCheck,
          provider: process.env.CDN_PROVIDER || 'Cloudflare'
        };
      })()
    );
  } else {
    services.cdn = { status: 'NOT_CONFIGURED' };
  }

  // HEALTH: Checking cloud storage (AWS S3, Google Cloud Storage, etc.)
  if (process.env.AWS_S3_BUCKET || process.env.STORAGE_SERVICE_URL) {
    checks.push(
      (async () => {
        const storageUrl = process.env.STORAGE_SERVICE_URL || 'https://s3.amazonaws.com';
        const healthCheck = await checkServiceHealth(storageUrl, 3000);
        services.cloudStorage = {
          ...healthCheck,
          provider: process.env.STORAGE_PROVIDER || 'AWS S3'
        };
      })()
    );
  } else {
    services.cloudStorage = { status: 'NOT_CONFIGURED' };
  }

  // HEALTH: Checking MongoDB Atlas (if using cloud MongoDB)
  if (process.env.MONGOOSE_URL && process.env.MONGOOSE_URL.includes('mongodb.net')) {
    checks.push(
      (async () => {
        try {
          const dbStart = performance.now();
          await mongoose.connection.db.admin().ping();
          const latency = Math.round(performance.now() - dbStart);
          services.mongodbAtlas = {
            status: 'UP',
            responseTimeMs: latency
          };
        } catch (error) {
          services.mongodbAtlas = {
            status: 'DOWN',
            error: error.message
          };
        }
      })()
    );
  }

  // HEALTH: Checking Redis (if configured)
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    checks.push(
      (async () => {
        // Note: This is a placeholder. In production, you would check Redis connection
        // For now, just check if Redis URL is configured
        services.redis = {
          status: 'CONFIGURED',
          note: 'Redis connection check not implemented'
        };
      })()
    );
  }

  // HEALTH: Run all service checks concurrently
  await Promise.allSettled(checks);

  const serviceEntries = Object.entries(services);
  const monitoredServices = serviceEntries.filter(([_, value]) => value && value.status && value.status !== 'NOT_CONFIGURED');
  const servicesTotal = monitoredServices.length;
  const servicesOnline = monitoredServices.filter(([_, value]) => value.status === 'UP').length;

  return {
    ...services,
    summary: {
      servicesOnline,
      servicesTotal,
      percentageOnline: servicesTotal > 0 ? Math.round((servicesOnline / servicesTotal) * 100) : 0
    }
  };
};

/**
 * Check frontend status (if frontend health endpoint exists)
 * @returns {Promise<Object>} Frontend status object
 */
export const getFrontendStatus = async () => {
  try {
    const frontendUrl = process.env.FRONTEND_BASE_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
    const healthUrl = `${frontendUrl}/health`;

    // Try to fetch frontend health endpoint with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(healthUrl, {
        signal: controller.signal,
        method: 'GET'
      }).catch(() => null);

      clearTimeout(timeout);

      if (response && response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          status: 'UP',
          buildVersion: data.version || 'N/A',
          lastDeployed: data.timestamp || 'N/A',
          url: frontendUrl
        };
      } else {
        return {
          status: 'UNKNOWN',
          url: frontendUrl,
          note: 'Frontend health endpoint not accessible'
        };
      }
    } catch (error) {
      clearTimeout(timeout);
      return {
        status: 'UNKNOWN',
        url: frontendUrl,
        note: 'Frontend health check unavailable (may be expected in development)'
      };
    }
  } catch (error) {
    return {
      status: 'UNKNOWN',
      error: error.message
    };
  }
};

/**
 * Check security configuration
 * @returns {Object} Security status object
 */
export const getSecurityStatus = () => {
  const security = {
    jwtSecretLoaded: !!process.env.JWT_SECRET,
    encryptionKeyLoaded: !!process.env.ENCRYPTION_KEY,
    corsConfigured: !!process.env.CORS_ORIGIN,
    nodeEnv: process.env.NODE_ENV || 'development'
  };

  // Check encryption key strength
  if (process.env.ENCRYPTION_KEY) {
    const key = process.env.ENCRYPTION_KEY.trim();
    let keyLength = 0;

    try {
      if (/^[0-9a-fA-F]{64}$/.test(key)) {
        keyLength = Buffer.from(key, 'hex').length;
      } else if (/^[A-Za-z0-9+/]{43}=*$/.test(key)) {
        keyLength = Buffer.from(key, 'base64').length;
      } else {
        keyLength = Buffer.from(key, 'utf8').length;
      }
    } catch (error) {
      keyLength = 0;
    }

    security.encryptionKeyLength = keyLength;
    security.encryptionKeyValid = keyLength >= 32;
  }

  // Check if running in production
  security.isProduction = process.env.NODE_ENV === 'production';

  return security;
};

/**
 * Get comprehensive health status
 * @returns {Promise<Object>} Complete health status object
 */
export const getHealthStatus = async () => {
  const startTime = performance.now();

  try {
    // HEALTH: Run all health checks concurrently for better performance
    const [
      appStatus,
      databaseStatus,
      apiMetrics,
      systemResources,
      externalServicesStatus,
      frontendStatus,
      securityStatus
    ] = await Promise.allSettled([
      Promise.resolve(getApplicationStatus()),
      getDatabaseStatus(),
      Promise.resolve(getApiMetrics()),
      getSystemResources(),
      getExternalServicesStatus(),
      getFrontendStatus(),
      Promise.resolve(getSecurityStatus())
    ]);

    // Extract values from settled promises
    const app = appStatus.status === 'fulfilled' ? appStatus.value : { error: appStatus.reason?.message };
    const database = databaseStatus.status === 'fulfilled' ? databaseStatus.value : { status: 'DOWN', error: databaseStatus.reason?.message };
    const api = apiMetrics.status === 'fulfilled' ? apiMetrics.value : { error: apiMetrics.reason?.message };
    const system = systemResources.status === 'fulfilled' ? systemResources.value : { error: systemResources.reason?.message };
    const externalServices = externalServicesStatus.status === 'fulfilled' ? externalServicesStatus.value : { error: externalServicesStatus.reason?.message };
    const frontend = frontendStatus.status === 'fulfilled' ? frontendStatus.value : { status: 'UNKNOWN', error: frontendStatus.reason?.message };
    const security = securityStatus.status === 'fulfilled' ? securityStatus.value : { error: securityStatus.reason?.message };

    // Determine overall status
    const overallStatus = database.status === 'UP' ? 'UP' : 'DEGRADED';
    const responseTime = Math.round(performance.now() - startTime);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTimeMs: responseTime,
      app,
      database,
      api,
      system,
      externalServices,
      frontend,
      security
    };
  } catch (error) {
    return {
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTimeMs: Math.round(performance.now() - startTime)
    };
  }
};

export default getHealthStatus;

