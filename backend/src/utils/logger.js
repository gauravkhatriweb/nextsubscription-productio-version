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
// UTILS: Resolve to backend root (two levels up from src/utils/)
const rootDir = path.resolve(__dirname, '../..');
const logsDir = path.join(rootDir, 'logs');
const archivesDir = path.join(logsDir, 'archives');

/**
 * Ensure a directory exists (created recursively if needed)
 * @param {string} targetDir
 */
const ensureDir = (targetDir) => {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
};

/**
 * Ensure the log directories exist
 */
const ensureLogsDir = () => {
  ensureDir(logsDir);
  ensureDir(archivesDir);
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
 * Build the full path for an archive snapshot file
 * @param {string} fileName - filename within /logs/archives
 * @returns {string}
 */
const getArchiveFilePath = (fileName) => {
  ensureLogsDir();
  return path.join(archivesDir, fileName);
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
    let entries = [];

    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, 'utf8');
      entries = content
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            return null;
          }
        })
        .filter(Boolean);
    } else {
      // Fall back to archived snapshots for the requested date
      const archiveFiles = await findArchiveFilesForDate(dateStr);
      if (archiveFiles.length > 0) {
        const snapshots = await Promise.all(
          archiveFiles.map(async (fileName) => {
            const snapshot = await readArchivedSnapshot(fileName).catch(() => null);
            return snapshot?.entries || [];
          })
        );
        entries = snapshots.flat();
      }
    }

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
    const archiveFiles = await fs.promises.readdir(archivesDir, { withFileTypes: true }).catch(() => []);

    const activeDates = files
      .filter(file => file.isFile() && file.name.endsWith('.log'))
      .map(file => file.name.replace('.log', ''));

    const archivedDates = archiveFiles
      .filter(file => file.isFile() && file.name.endsWith('.json'))
      .map(file => file.name.split('_')[0]);

    const uniqueDates = new Set([...activeDates, ...archivedDates]);

    return Array.from(uniqueDates)
      .filter(Boolean)
      .sort()
      .reverse();
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

    let archivedCount = 0;

    await Promise.all(
      dates.map(async (dateStr) => {
        const date = new Date(`${dateStr}T00:00:00Z`);
        if (date < cutoff) {
          const filePath = getLogFilePath(dateStr);
          if (fs.existsSync(filePath)) {
            await archiveLogSnapshot({ date: dateStr, reason: 'rotation-prune' });
            archivedCount += 1;
          }

          // Clean up orphaned archive snapshots older than retention
          const archiveFiles = await findArchiveFilesForDate(dateStr);
          await Promise.all(
            archiveFiles.map(async (fileName) => {
              const filePathArchive = getArchiveFilePath(fileName);
              const stats = await fs.promises.stat(filePathArchive).catch(() => null);
              if (!stats) return;
              if (stats.mtime < cutoff) {
                await fs.promises.unlink(filePathArchive).catch(() => {});
              }
            })
          );
        }
      })
    );

    return archivedCount;
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

/**
 * Archive the current log file into /logs/archives and optionally clear it.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @param {string} [options.initiatedBy]
 * @param {boolean} [options.clearAfter=true]
 * @param {string} [options.date] - override date (YYYY-MM-DD)
 * @returns {Promise<{ fileName: string, entries: number } | null>}
 */
export const archiveLogSnapshot = async (options = {}) => {
  const {
    reason = 'manual-archive',
    initiatedBy = null,
    clearAfter = true,
    date
  } = options;

  try {
    const now = new Date();
    const dateStr = date || now.toISOString().split('T')[0];
    const filePath = getLogFilePath(dateStr);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const entries = await readSystemLogsByDate(dateStr);
    if (!entries || entries.length === 0) {
      if (clearAfter) {
        await fs.promises.truncate(filePath, 0);
      }
      return null;
    }

    const safeTimestamp = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `${dateStr}_${safeTimestamp}.json`;
    const archivePath = getArchiveFilePath(fileName);

    const payload = {
      archivedAt: now.toISOString(),
      date: dateStr,
      reason,
      initiatedBy,
      entries
    };

    await fs.promises.writeFile(archivePath, JSON.stringify(payload, null, 2), 'utf8');

    if (clearAfter) {
      await fs.promises.truncate(filePath, 0);
    }

    return {
      fileName,
      entries: entries.length
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to archive log snapshot', error);
    return null;
  }
};

/**
 * Find archive snapshot filenames for a specific date.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Promise<string[]>}
 */
export const findArchiveFilesForDate = async (dateStr) => {
  try {
    ensureLogsDir();
    const files = await fs.promises.readdir(archivesDir, { withFileTypes: true });
    return files
      .filter(file => file.isFile() && file.name.startsWith(dateStr) && file.name.endsWith('.json'))
      .map(file => file.name)
      .sort()
      .reverse();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to find archive files for date', error);
    return [];
  }
};

/**
 * Read an archived log snapshot by filename.
 *
 * @param {string} fileName - File within /logs/archives
 * @returns {Promise<Object|null>}
 */
export const readArchivedSnapshot = async (fileName) => {
  try {
    if (!fileName || !fileName.endsWith('.json')) {
      throw new Error('Invalid archive filename');
    }
    const archivePath = getArchiveFilePath(fileName);
    const content = await fs.promises.readFile(archivePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to read archived snapshot', error);
    return null;
  }
};

/**
 * List archived log snapshots with metadata.
 *
 * @returns {Promise<Array<{fileName: string, date: string, size: number, archivedAt: string, entries: number}>>}
 */
export const listArchivedSnapshots = async () => {
  try {
    ensureLogsDir();
    const files = await fs.promises.readdir(archivesDir, { withFileTypes: true });

    const snapshots = await Promise.all(
      files
        .filter(file => file.isFile() && file.name.endsWith('.json'))
        .map(async (file) => {
          const archivePath = getArchiveFilePath(file.name);
          const stats = await fs.promises.stat(archivePath);
          const payload = await readArchivedSnapshot(file.name);
          return {
            fileName: file.name,
            date: payload?.date || file.name.split('_')[0],
            archivedAt: payload?.archivedAt || stats.mtime.toISOString(),
            entries: payload?.entries?.length || payload?.entriesCount || 0,
            size: stats.size
          };
        })
    );

    return snapshots
      .filter(Boolean)
      .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('LOGGER: Failed to list archived snapshots', error);
    return [];
  }
};

export { archivesDir };

export default {
  writeSystemLog,
  readSystemLogsByDate,
  readRecentSystemLogs,
  listAvailableLogDates,
  pruneOldLogs,
  clearTodayLogs,
  archiveLogSnapshot,
  findArchiveFilesForDate,
  readArchivedSnapshot,
  listArchivedSnapshots,
  archivesDir
};

