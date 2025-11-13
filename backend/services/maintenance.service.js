/**
 * Maintenance Service
 *
 * Handles admin-triggered maintenance tasks such as cache cleanup,
 * user data maintenance and global cleanup routines.
 */

import mongoose from 'mongoose';
import SystemActionModel from '../models/systemAction.model.js';
import UserModel from '../models/user.model.js';
import {
  writeSystemLog,
  pruneOldLogs
} from '../utils/logger.js';
import { resetHealthCacheInternal } from '../controllers/health.controller.js';
import { clearRequestHistory } from '../middleware/metrics.middleware.js';

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
    logsPruned: 0
  };

  try {
    summary.cache = await performCacheMaintenance(adminEmail, { trigger: 'global-cleanup' });

    if (options.userCleanup) {
      summary.users = await cleanupUserData(adminEmail, options.userCleanup);
    }

    const logsPruned = await pruneOldLogs(options.keepLogsForDays || 30);
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

export default {
  performCacheMaintenance,
  cleanupUserData,
  performGlobalCleanup
};

