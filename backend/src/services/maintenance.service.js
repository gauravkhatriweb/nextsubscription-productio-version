/**
 * Maintenance Service
 *
 * Handles admin-triggered maintenance tasks such as cache cleanup,
 * user data maintenance and global cleanup routines.
 */

import mongoose from 'mongoose';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import SystemActionModel from '../models/systemAction.model.js';
import UserModel from '../models/user.model.js';
import VendorModel from '../models/vendor.model.js';
import {
  writeSystemLog,
  pruneOldLogs,
  archiveLogSnapshot,
  listArchivedSnapshots,
  archivesDir
} from '../utils/logger.js';
import { resetHealthCacheInternal } from '../controllers/health.controller.js';
import { clearRequestHistory } from '../middleware/metrics.middleware.js';

const execAsync = promisify(exec);

/**
 * Perform cache maintenance by clearing in-memory caches and recording the action.
 *
 * @param {string} adminEmail - Admin email performing the action
 * @param {Object} [context] - Optional context information
 * @returns {Promise<Object>}
 */
export const performCacheMaintenance = async (adminEmail, context = {}) => {
  const startTime = Date.now();

  try {
    // CACHE: Reset in-memory caches for health status & metrics
    resetHealthCacheInternal();
    clearRequestHistory();

    const executionTime = Date.now() - startTime;

    // Persist audit trail
    await SystemActionModel.create({
      action: 'flush-cache',
      performedBy: adminEmail,
      status: 'success',
      result: { message: 'In-memory caches flushed', context },
      executionTime
    });

    await writeSystemLog({
      level: 'info',
      source: 'maintenance',
      message: 'Cache maintenance completed',
      meta: { executionTime, performedBy: adminEmail, context }
    });

    return {
      success: true,
      message: 'Cache maintenance completed successfully',
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'flush-cache',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message, context },
      executionTime
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'Cache maintenance failed',
      meta: { error: error.message, performedBy: adminEmail, context }
    });

    throw error;
  }
};

/**
 * Cleanup user data, supporting anonymisation or deletion.
 *
 * @param {string} adminEmail - Admin performing the action
 * @param {Object} options - Cleanup options
 * @param {string} [options.userId] - User to operate on
 * @param {string} [options.email] - User email (alternative identifier)
 * @param {string} [options.mode='anonymize'] - 'anonymize' | 'delete'
 * @param {number} [options.inactiveDays] - Delete users inactive for given days
 * @returns {Promise<Object>}
 */
export const cleanupUserData = async (adminEmail, options = {}) => {
  const {
    userId,
    email,
    mode = 'anonymize',
    inactiveDays
  } = options;

  if (!userId && !email && !inactiveDays) {
    throw new Error('Specify userId, email, or inactiveDays for user cleanup');
  }

  const startTime = Date.now();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let affected = 0;
    let affectedUsers = [];

    if (inactiveDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - inactiveDays);

      const users = await UserModel.find({ updatedAt: { $lte: cutoff } }).session(session);
      affected = users.length;

      if (mode === 'delete') {
        await UserModel.deleteMany({ _id: { $in: users.map(u => u._id) } }).session(session);
      } else {
        await Promise.all(users.map(async (user) => {
          user.firstname = 'Anonymized';
          user.lastname = 'User';
          user.email = `anonymized+${user._id}@example.com`;
          user.password = '';
          user.profilePic = null;
          user.isAccountVerified = false;
          user.verifyOtp = null;
          user.verifyOtpExpiry = null;
          user.forgotPasswordOtp = null;
          user.forgotPasswordOtpExpiry = null;
          await user.save({ session });
        }));
      }

      affectedUsers = users.map(user => user._id.toString());
    } else {
      const query = userId ? { _id: userId } : { email };
      const user = await UserModel.findOne(query).session(session);

      if (!user) {
        throw new Error('User not found');
      }

      if (mode === 'delete') {
        await UserModel.deleteOne({ _id: user._id }).session(session);
      } else {
        user.firstname = 'Anonymized';
        user.lastname = 'User';
        user.email = `anonymized+${user._id}@example.com`;
        user.password = '';
        user.profilePic = null;
        user.isAccountVerified = false;
        user.verifyOtp = null;
        user.verifyOtpExpiry = null;
        user.forgotPasswordOtp = null;
        user.forgotPasswordOtpExpiry = null;
        await user.save({ session });
      }

      affected = 1;
      affectedUsers = [user._id.toString()];
    }

    await session.commitTransaction();
    session.endSession();

    const executionTime = Date.now() - startTime;

    const result = {
      success: true,
      message: `User maintenance completed (${mode})`,
      affected,
      affectedUsers,
      executionTime: `${executionTime}ms`
    };

    await SystemActionModel.create({
      action: 'user-maintenance',
      performedBy: adminEmail,
      status: 'success',
      result,
      executionTime
    });

    await writeSystemLog({
      level: 'info',
      source: 'maintenance',
      message: `User maintenance (${mode}) executed`,
      meta: { affected, affectedUsers, performedBy: adminEmail }
    });

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'user-maintenance',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message, options },
      executionTime
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'User maintenance failed',
      meta: { error: error.message, performedBy: adminEmail, options }
    });

    throw error;
  }
};

/**
 * Retrieve user maintenance statistics with optional cleanup of inactive users.
 *
 * @param {string} adminEmail
 * @param {Object} options
 * @param {boolean} [options.cleanup=false]
 * @param {number} [options.inactiveDays=180]
 * @param {string} [options.mode='anonymize']
 * @returns {Promise<Object>}
 */
export const getUserMaintenanceStats = async (adminEmail, options = {}) => {
  const {
    cleanup = false,
    inactiveDays = 180,
    mode = 'anonymize'
  } = options;

  const startTime = Date.now();

  const [totalUsers, verifiedUsers, totalVendors, suspendedVendors, inactiveUsers] = await Promise.all([
    UserModel.countDocuments({}),
    UserModel.countDocuments({ isAccountVerified: true }),
    VendorModel.countDocuments({}),
    VendorModel.countDocuments({ status: 'suspended' }),
    UserModel.countDocuments({
      updatedAt: { $lte: new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000) }
    })
  ]);

  const stats = {
    totalUsers,
    verifiedUsers,
    inactiveUsers,
    totalVendors,
    suspendedAccounts: suspendedVendors
  };

  let cleanupResult = null;

  if (cleanup) {
    cleanupResult = await cleanupUserData(adminEmail, {
      inactiveDays,
      mode
    });
  }

  const executionTime = Date.now() - startTime;

  await SystemActionModel.create({
    action: 'maintenance-user-stats',
    performedBy: adminEmail,
    status: 'success',
    result: { stats, cleanup: cleanup ? cleanupResult : null },
    executionTime
  });

  await writeSystemLog({
    level: 'info',
    source: 'maintenance',
    message: 'User maintenance stats retrieved',
    meta: { stats, cleanupTriggered: cleanup, performedBy: adminEmail }
  });

  return {
    success: true,
    stats,
    cleanup: cleanupResult,
    executionTime: `${executionTime}ms`
  };
};

/**
 * Perform global cleanup routines.
 *
 * @param {string} adminEmail
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const performGlobalCleanup = async (adminEmail, options = {}) => {
  const startTime = Date.now();
  const summary = {
    cache: null,
    users: null,
    logsArchived: null,
    archives: []
  };

  try {
    summary.cache = await performCacheMaintenance(adminEmail, { trigger: 'global-cleanup' });

    if (options.userCleanup) {
      summary.users = await cleanupUserData(adminEmail, options.userCleanup);
    }

    const archiveResult = await archiveLogSnapshot({
      initiatedBy: adminEmail,
      reason: 'global-cleanup'
    });

    summary.logsArchived = archiveResult;

    const logsPruned = await pruneOldLogs(options.keepLogsForDays || 30);
    summary.archives = await listArchivedSnapshots();
    summary.logsPruned = logsPruned;

    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'global-cleanup',
      performedBy: adminEmail,
      status: 'success',
      result: { summary, options },
      executionTime
    });

    await writeSystemLog({
      level: 'info',
      source: 'maintenance',
      message: 'Global cleanup completed',
      meta: { summary, performedBy: adminEmail, executionTime }
    });

    return {
      success: true,
      message: 'Global cleanup completed successfully',
      summary,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'global-cleanup',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message, options },
      executionTime
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'Global cleanup failed',
      meta: { error: error.message, performedBy: adminEmail, options }
    });

    throw error;
  }
};

/**
 * Rebuild MongoDB indexes for all collections.
 *
 * @param {string} adminEmail
 * @returns {Promise<Object>}
 */
export const rebuildSystemIndexes = async (adminEmail) => {
  const startTime = Date.now();
  const results = [];
  let successCount = 0;
  let failureCount = 0;

  try {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
      const collectionName = collection.collectionName;
      const operationStart = Date.now();
      try {
        const result = await collection.reIndex();
        successCount += 1;
        results.push({
          collection: collectionName,
          status: 'success',
          durationMs: Date.now() - operationStart,
          result
        });
      } catch (error) {
        failureCount += 1;
        results.push({
          collection: collectionName,
          status: 'failed',
          durationMs: Date.now() - operationStart,
          error: error.message
        });
      }
    }

    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'reindex-collections',
      performedBy: adminEmail,
      status: failureCount === 0 ? 'success' : 'failed',
      result: { successCount, failureCount, results },
      executionTime
    });

    await writeSystemLog({
      level: failureCount === 0 ? 'info' : 'warn',
      source: 'maintenance',
      message: 'Reindexed MongoDB collections',
      meta: { successCount, failureCount, performedBy: adminEmail }
    });

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      results,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    await SystemActionModel.create({
      action: 'reindex-collections',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message }
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'Failed to reindex MongoDB collections',
      meta: { error: error.message, performedBy: adminEmail }
    });

    throw error;
  }
};

/**
 * Calculate storage health metrics (disk, logs directory, memory).
 *
 * @returns {Promise<Object>}
 */
const resolveStorageStats = async () => {
  const { statfs } = await import('node:fs/promises');
  const rootPath = path.parse(process.cwd()).root || '/';
  const stats = await statfs(rootPath);

  const blockSize = BigInt(stats.bsize);
  const totalBlocks = BigInt(stats.blocks);
  const availableBlocks = typeof stats.bavail === 'number' && stats.bavail >= 0
    ? BigInt(stats.bavail)
    : BigInt(stats.bfree);

  const totalBytes = blockSize * totalBlocks;
  const availableBytes = blockSize * availableBlocks;
  const usedBytes = totalBytes - availableBytes;

  return {
    filesystem: rootPath,
    totalBytes: Number(totalBytes),
    usedBytes: Number(usedBytes),
    freeBytes: Number(availableBytes),
    usagePercent: Math.round(Number(usedBytes * 100n / totalBytes))
  };
};

const getDirectorySize = async (directory) => {
  let total = 0;
  const entries = await fs.promises.readdir(directory, { withFileTypes: true }).catch(() => []);
  await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      total += await getDirectorySize(fullPath);
    } else if (entry.isFile()) {
      const stat = await fs.promises.stat(fullPath).catch(() => null);
      if (stat) {
        total += stat.size;
      }
    }
  }));
  return total;
};

/**
 * Check storage health metrics.
 *
 * @param {string} adminEmail
 * @returns {Promise<Object>}
 */
export const checkStorageHealth = async (adminEmail) => {
  const startTime = Date.now();

  try {
    const [disk, logDirSize] = await Promise.all([
      resolveStorageStats(),
      getDirectorySize(archivesDir)
    ]);

    const payload = {
      disk,
      memory: {
        totalBytes: os.totalmem(),
        freeBytes: os.freemem(),
        usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
      },
      logs: {
        archivesDir,
        sizeBytes: logDirSize,
        snapshots: await listArchivedSnapshots()
      }
    };

    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'storage-health-check',
      performedBy: adminEmail,
      status: 'success',
      result: payload,
      executionTime
    });

    await writeSystemLog({
      level: 'info',
      source: 'maintenance',
      message: 'Storage health checked',
      meta: { performedBy: adminEmail, diskUsage: payload.disk.usagePercent }
    });

    return {
      success: true,
      data: payload,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    await SystemActionModel.create({
      action: 'storage-health-check',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message }
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'Storage health check failed',
      meta: { error: error.message, performedBy: adminEmail }
    });

    throw error;
  }
};

/**
 * Restart background worker processes using PM2 if configured.
 *
 * @param {string} adminEmail
 * @returns {Promise<Object>}
 */
export const restartWorkerProcesses = async (adminEmail) => {
  const startTime = Date.now();
  const pm2ProcessName = process.env.PM2_PROCESS_NAME || process.env.PM2_WORKER_PROCESS;
  let status = 'success';
  let message = 'Worker restart executed';

  try {
    if (pm2ProcessName) {
      const command = `pm2 restart ${pm2ProcessName}`;
      const { stdout, stderr } = await execAsync(command);
      await writeSystemLog({
        level: 'info',
        source: 'maintenance',
        message: `PM2 restart executed for ${pm2ProcessName}`,
        meta: { stdout, stderr, performedBy: adminEmail }
      });
    } else if (process.send) {
      process.send({ type: 'restart-workers', requestedBy: adminEmail });
      message = 'Cluster restart signal dispatched';
    } else {
      status = 'failed';
      message = 'No worker manager configured (set PM2_PROCESS_NAME)';
    }

    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'restart-workers',
      performedBy: adminEmail,
      status,
      result: { message },
      executionTime
    });

    if (status === 'failed') {
      await writeSystemLog({
        level: 'warn',
        source: 'maintenance',
        message,
        meta: { performedBy: adminEmail }
      });
    }

    return {
      success: status === 'success',
      message,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    await SystemActionModel.create({
      action: 'restart-workers',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message }
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'Worker restart failed',
      meta: { error: error.message, performedBy: adminEmail }
    });
    throw error;
  }
};

/**
 * Purge expired sessions from the configured session collection.
 *
 * @param {string} adminEmail
 * @param {Object} options
 * @param {number} [options.olderThanDays=30]
 * @param {string} [options.collectionName]
 * @returns {Promise<Object>}
 */
export const purgeExpiredSessions = async (adminEmail, options = {}) => {
  const {
    olderThanDays = 30,
    collectionName = process.env.SESSION_COLLECTION || 'sessions',
    expiryField = process.env.SESSION_EXPIRY_FIELD || 'expiresAt'
  } = options;

  const startTime = Date.now();

  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some((collection) => collection.name === collectionName);

    if (!collectionExists) {
      const message = `Session collection '${collectionName}' not found`;

      await SystemActionModel.create({
        action: 'purge-expired-sessions',
        performedBy: adminEmail,
        status: 'success',
        result: { message },
        executionTime: Date.now() - startTime
      });

      await writeSystemLog({
        level: 'warn',
        source: 'maintenance',
        message,
        meta: { performedBy: adminEmail }
      });

      return {
        success: true,
        message,
        deletedCount: 0
      };
    }

    const collection = mongoose.connection.db.collection(collectionName);
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const query = {
      $or: [
        { [expiryField]: { $exists: true, $lt: new Date() } },
        { updatedAt: { $exists: true, $lt: cutoff } },
        { lastModified: { $exists: true, $lt: cutoff } },
        { lastActivity: { $exists: true, $lt: cutoff } }
      ]
    };

    const result = await collection.deleteMany(query);
    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'purge-expired-sessions',
      performedBy: adminEmail,
      status: 'success',
      result: { deletedCount: result.deletedCount, olderThanDays },
      executionTime
    });

    await writeSystemLog({
      level: 'info',
      source: 'maintenance',
      message: 'Expired sessions purged',
      meta: { deletedCount: result.deletedCount, performedBy: adminEmail }
    });

    return {
      success: true,
      deletedCount: result.deletedCount,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    await SystemActionModel.create({
      action: 'purge-expired-sessions',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message }
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'Expired session purge failed',
      meta: { error: error.message, performedBy: adminEmail }
    });

    throw error;
  }
};

/**
 * Rotate active logs into archives and prune old snapshots.
 *
 * @param {string} adminEmail
 * @param {Object} options
 * @param {number} [options.keepLogsForDays=30]
 * @returns {Promise<Object>}
 */
export const rotateLogs = async (adminEmail, options = {}) => {
  const { keepLogsForDays = 30 } = options;
  const startTime = Date.now();

  try {
    const archiveResult = await archiveLogSnapshot({
      initiatedBy: adminEmail,
      reason: 'manual-rotation'
    });

    const pruned = await pruneOldLogs(keepLogsForDays);
    const snapshots = await listArchivedSnapshots();
    const executionTime = Date.now() - startTime;

    await SystemActionModel.create({
      action: 'log-rotation',
      performedBy: adminEmail,
      status: 'success',
      result: { archiveResult, pruned, snapshots },
      executionTime
    });

    await writeSystemLog({
      level: 'info',
      source: 'maintenance',
      message: 'Log rotation executed',
      meta: { archiveResult, pruned, performedBy: adminEmail }
    });

    return {
      success: true,
      archiveResult,
      pruned,
      snapshots,
      executionTime: `${executionTime}ms`
    };
  } catch (error) {
    await SystemActionModel.create({
      action: 'log-rotation',
      performedBy: adminEmail,
      status: 'failed',
      result: { error: error.message }
    });

    await writeSystemLog({
      level: 'error',
      source: 'maintenance',
      message: 'Log rotation failed',
      meta: { error: error.message, performedBy: adminEmail }
    });

    throw error;
  }
};

export default {
  performCacheMaintenance,
  cleanupUserData,
  performGlobalCleanup,
  getUserMaintenanceStats,
  rebuildSystemIndexes,
  checkStorageHealth,
  restartWorkerProcesses,
  purgeExpiredSessions,
  rotateLogs
};

