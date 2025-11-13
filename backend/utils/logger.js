/**
 * System Logger Utility
 *
 * Provides helper functions for persisting system logs to disk and reading them
 * for the admin monitoring dashboard. Logs are stored as JSON lines in
 * /logs/YYYY-MM-DD.log to enable easy archival and retrieval.
 *
 * Each log entry uses the structure:
 * {
 *   "timestamp": "2025-11-13T16:22:01.123Z",
 *   "level": "info" | "warn" | "error",
 *   "message": "Human readable message",
 *   "source": "system" | "maintenance" | ...,
 *   "meta": { ... } // optional contextual data
 * }
 *
 * NOTE: When running in serverless environments, consider replacing the file
 * writer with a database-backed implementation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const logsDir = path.join(rootDir, 'logs');

/**
 * Ensure the log directory exists
 */
const ensureLogsDir = () => {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
};

/**
 * Build the full path for a given date string
 * @param {string} dateStr - YYYY-MM-DD date string
 * @returns {string}
 */
const getLogFilePath = (dateStr) => {
  ensureLogsDir();
  return path.join(logsDir, `${dateStr}.log`);
};

/**
 * Append a system log entry to the daily log file.
 *
 * @param {Object} entry - Log entry data
 * @param {string} entry.level - Log level (info|warn|error)
 * @param {string} entry.message - Log message
 * @param {string} [entry.source='system'] - Source component
 * @param {Object} [entry.meta] - Additional metadata
 */
export const writeSystemLog = async (entry) => {
  try {
    const timestamp = entry.timestamp || new Date().toISOString();
    const dateStr = timestamp.split('T')[0];
    const filePath = getLogFilePath(dateStr);

    const payload = {
      timestamp,
      level: (entry.level || 'info').toLowerCase(),
      message: entry.message,
      source: entry.source || 'system',
      meta: entry.meta || null
    };

    await fs.promises.appendFile(filePath, `${JSON.stringify(payload)}\n`, 'utf8');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to write system log entry', error);
  }
};

/**
 * Read log entries for a given date.
 *
 * @param {string} dateStr - YYYY-MM-DD date string
 * @param {number} [limit] - Optional max number of entries to return
 * @returns {Promise<Array>} Array of log entry objects (sorted ascending)
 */
export const readSystemLogsByDate = async (dateStr, limit) => {
  try {
    const filePath = getLogFilePath(dateStr);
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return null;
      }
    }).filter(Boolean);

    // Sort ascending by timestamp so terminal renders chronologically
    entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (limit && limit > 0) {
      return entries.slice(-limit);
    }

    return entries;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to read system logs', error);
    return [];
  }
};

/**
 * Get the most recent log entries (live view).
 *
 * @param {number} limit - Number of entries to return
 * @returns {Promise<Array>}
 */
export const readRecentSystemLogs = async (limit = 100) => {
  const currentDate = new Date().toISOString().split('T')[0];
  return readSystemLogsByDate(currentDate, limit);
};

/**
 * List available log dates based on files in /logs directory.
 *
 * @returns {Promise<Array<string>>} Array of date strings YYYY-MM-DD
 */
export const listAvailableLogDates = async () => {
  try {
    ensureLogsDir();
    const files = await fs.promises.readdir(logsDir, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.endsWith('.log'))
      .map(file => file.name.replace('.log', ''))
      .sort()
      .reverse(); // Most recent first
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to list log dates', error);
    return [];
  }
};

/**
 * Rotate logs older than the specified number of days.
 *
 * @param {number} [daysToKeep=30] - Number of days to retain
 * @returns {Promise<number>} Number of files removed
 */
export const pruneOldLogs = async (daysToKeep = 30) => {
  try {
    const dates = await listAvailableLogDates();
    if (dates.length === 0) {
      return 0;
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    let removed = 0;
    await Promise.all(dates.map(async (dateStr) => {
      const date = new Date(`${dateStr}T00:00:00Z`);
      if (date < cutoff) {
        const filePath = getLogFilePath(dateStr);
        await fs.promises.unlink(filePath).catch(() => {});
        removed += 1;
      }
    }));

    return removed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to prune old logs', error);
    return 0;
  }
};

/**
 * Clear today's log file (used for maintenance operations).
 *
 * @returns {Promise<void>}
 */
export const clearTodayLogs = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const filePath = getLogFilePath(today);
    if (fs.existsSync(filePath)) {
      await fs.promises.truncate(filePath, 0);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to clear today logs', error);
  }
};

export default {
  writeSystemLog,
  readSystemLogsByDate,
  readRecentSystemLogs,
  listAvailableLogDates,
  pruneOldLogs,
  clearTodayLogs
};

