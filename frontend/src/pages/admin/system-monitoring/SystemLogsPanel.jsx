/**
 * SystemLogsPanel
 *
 * Production terminal for live + archived system logs with animated rendering,
 * ShadCN-inspired styling, and archived snapshot modal.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  getSystemLogs,
  getSystemLogsByDate,
  getAvailableLogDates,
  getArchivedLogSnapshots,
  getArchivedLogSnapshot,
  clearSystemLogs
} from '../../../lib/api/health';

const TAB_LIVE = 'live';
const TAB_ARCHIVE = 'archive';
const POLL_INTERVAL = 5000;

const LOG_LEVEL_STYLES = {
  info: {
    badge: 'bg-emerald-500/10 text-emerald-200 border border-emerald-400/30',
    dot: 'bg-emerald-400'
  },
  warn: {
    badge: 'bg-amber-500/10 text-amber-200 border border-amber-400/40',
    dot: 'bg-amber-300'
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-200 border border-amber-400/40',
    dot: 'bg-amber-300'
  },
  error: {
    badge: 'bg-rose-500/10 text-rose-200 border border-rose-400/40',
    dot: 'bg-rose-400'
  }
};

const terminalLineVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour12: false });
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

const formatMeta = (meta) => {
  if (!meta) return '';
  if (typeof meta === 'string') return meta;
  try {
    return JSON.stringify(meta);
  } catch (error) {
    return String(meta);
  }
};

const formatBytes = (bytes) => {
  if (!bytes || Number.isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let value = bytes;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || value < 1 ? 1 : 2)} ${units[index]}`;
};

const LogLine = ({ entry, index, animate }) => {
  const [displayedMessage, setDisplayedMessage] = useState(entry.message || '');
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!animate) {
      setDisplayedMessage(entry.message || '');
      return;
    }

    const message = entry.message || '';
    if (!message || message.length === 0 || hasAnimated) {
      setDisplayedMessage(message);
      return;
    }

    setDisplayedMessage('');
    let current = 0;
    const cappedLength = Math.min(message.length, 600);
    const intervalMs = Math.max(8, Math.min(28, Math.floor(4000 / Math.max(cappedLength, 1))));

    const interval = setInterval(() => {
      current += 1;
      setDisplayedMessage(message.slice(0, current));
      if (current >= message.length) {
        clearInterval(interval);
        setHasAnimated(true);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [animate, entry.message, hasAnimated]);

  const levelKey = String(entry.level || 'info').toLowerCase();
  const levelStyles = LOG_LEVEL_STYLES[levelKey] || LOG_LEVEL_STYLES.info;

  return (
    <motion.div
      variants={terminalLineVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25, delay: Math.min(index * 0.015, 0.4) }}
      className="font-mono text-xs md:text-sm text-slate-200 break-words leading-relaxed"
    >
      <span className="mr-2 font-semibold bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500 bg-clip-text text-transparent">
        [{formatTimestamp(entry.timestamp)}]
      </span>
      <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wide ${levelStyles.badge}`}>
        <span className={`h-2 w-2 rounded-full ${levelStyles.dot}`} />
        {(entry.level || 'info').toUpperCase()}
      </span>
      <span className="ml-2 text-slate-100 whitespace-pre-wrap">{displayedMessage}</span>
      {entry.meta && (
        <span className="ml-2 text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md break-words">
          {formatMeta(entry.meta)}
        </span>
      )}
    </motion.div>
  );
};

const TerminalHeader = ({ activeTab, setActiveTab, onOpenArchiveModal }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-white/10 bg-black/60">
    <div className="flex items-center gap-2 text-xs text-white/80">
      <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
      <span className="h-3 w-3 rounded-full bg-amber-400" />
      <span className="h-3 w-3 rounded-full bg-emerald-400" />
      <span className="ml-3 text-sm font-medium">System Terminal</span>
    </div>
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={() => setActiveTab(TAB_LIVE)}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          activeTab === TAB_LIVE ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
        }`}
      >
        Live Logs
      </button>
      <button
        onClick={() => setActiveTab(TAB_ARCHIVE)}
        className={`px-3 py-1.5 rounded-md transition-colors ${
          activeTab === TAB_ARCHIVE ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
        }`}
      >
        Archived Logs
      </button>
      <button
        onClick={onOpenArchiveModal}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
      >
        <span role="img" aria-hidden="true">📜</span>
        View Archived Logs
      </button>
    </div>
  </div>
);

const LiveControls = ({ onClear, onRefresh, clearing, refreshing }) => (
  <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/5">
    <button
      onClick={() => onClear()}
      disabled={clearing}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        clearing
          ? 'bg-purple-500/20 text-purple-200 cursor-not-allowed'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {clearing ? 'Clearing…' : 'Clear Logs'}
    </button>
    <button
      onClick={onRefresh}
      disabled={refreshing}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
        refreshing
          ? 'bg-emerald-500/20 text-emerald-200 cursor-not-allowed'
          : 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
      }`}
    >
      {refreshing ? 'Refreshing…' : 'Refresh Now'}
    </button>
  </div>
  );

const ArchiveControls = ({ dates, selectedDate, onChangeDate, loading, onRefreshDates }) => (
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 py-3 border-b border-white/5 bg-white/5">
    <div className="text-xs text-slate-300 uppercase tracking-wide">
      Archived Logs (daily snapshots + manual archives)
    </div>
    <div className="flex items-center gap-3">
      <label className="text-xs text-slate-400">Select Date</label>
      <select
        value={selectedDate || ''}
        onChange={(event) => onChangeDate(event.target.value)}
        className="bg-black/40 text-slate-100 text-sm px-3 py-1.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        disabled={loading || dates.length === 0}
      >
        <option value="" disabled>
          {dates.length === 0 ? 'No archives available' : 'Choose date'}
        </option>
        {dates.map((date) => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>
      <button
        onClick={onRefreshDates}
        disabled={loading}
        className="px-3 py-1.5 text-xs font-medium rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        Refresh Dates
      </button>
    </div>
  </div>
);

const SystemLogsPanel = () => {
  const [activeTab, setActiveTab] = useState(TAB_LIVE);
  const [liveLogs, setLiveLogs] = useState([]);
  const [archivedLogs, setArchivedLogs] = useState([]);
  const [archiveDates, setArchiveDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingArchiveLogs, setLoadingArchiveLogs] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  const [archivedSnapshots, setArchivedSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [snapshotLogs, setSnapshotLogs] = useState([]);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  const liveIntervalRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80;

    if (isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [activeTab, liveLogs, archivedLogs]);

  const fetchLiveLogs = async () => {
    try {
      setRefreshing(true);
      const logs = await getSystemLogs({ limit: 200 });
      setLiveLogs(logs);
    } catch (error) {
      toast.error('Failed to load live logs');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchArchiveDates = async () => {
    try {
    const dates = await getAvailableLogDates();
    setArchiveDates(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
      }
    } catch (error) {
      toast.error('Failed to load archive dates');
    }
  };

  const fetchArchiveLogs = async (date) => {
    if (!date) {
      setArchivedLogs([]);
      return;
    }

    setLoadingArchiveLogs(true);
    try {
      const logs = await getSystemLogsByDate(date, 500);
      setArchivedLogs(logs);
    } catch (error) {
      toast.error('Failed to load archived logs for selected date');
    } finally {
      setLoadingArchiveLogs(false);
    }
  };

  const handleClearLogs = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      const result = await clearSystemLogs();
      toast.success(result?.message || 'System logs cleared and archived');
      setLiveLogs([]);
      await fetchLiveLogs();
      await fetchArchiveDates();
      if (archivedModalOpen) {
        await loadArchivedSnapshots({ autoSelect: true, silent: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to clear logs';
      toast.error(message);
    } finally {
      setClearing(false);
    }
  };

  const loadArchivedSnapshots = async ({ autoSelect = false, silent = false } = {}) => {
    if (!silent) {
      setSnapshotLoading(true);
    }
    try {
      const snapshots = await getArchivedLogSnapshots();
      setArchivedSnapshots(snapshots);
      if (autoSelect && snapshots.length > 0) {
        await handleSelectSnapshot(snapshots[0], { skipSpinner: true });
      } else if (autoSelect) {
        setSelectedSnapshot(null);
        setSnapshotLogs([]);
      }
    } catch (error) {
      toast.error('Failed to load archived log snapshots');
    } finally {
      if (!silent) {
        setSnapshotLoading(false);
      }
    }
  };

  const handleSelectSnapshot = async (snapshot, options = {}) => {
    if (!snapshot) return;
    const { skipSpinner = false } = options;

    if (!skipSpinner) {
      setSnapshotLoading(true);
    }

    setSelectedSnapshot(snapshot);
    try {
      const data = await getArchivedLogSnapshot(snapshot.fileName);
      setSnapshotLogs(data?.entries || data?.logs || []);
    } catch (error) {
      toast.error('Failed to load archived log file');
      setSnapshotLogs([]);
    } finally {
      if (!skipSpinner) {
        setSnapshotLoading(false);
      }
    }
  };

  const handleOpenArchiveModal = async () => {
    setArchivedModalOpen(true);
    await loadArchivedSnapshots({ autoSelect: true });
  };

  useEffect(() => {
    fetchLiveLogs();
    fetchArchiveDates();

    liveIntervalRef.current = setInterval(fetchLiveLogs, POLL_INTERVAL);
    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab === TAB_ARCHIVE && selectedDate) {
      fetchArchiveLogs(selectedDate);
    }
  }, [activeTab, selectedDate]);

  const displayLogs = useMemo(() => {
    if (activeTab === TAB_ARCHIVE) {
      return archivedLogs;
    }
    return liveLogs;
  }, [activeTab, archivedLogs, liveLogs]);

  const handleClearView = async () => {
    if (activeTab === TAB_LIVE) {
      await handleClearLogs();
    } else {
      setArchivedLogs([]);
    }
  };

  return (
    <div className="glass-card rounded-2xl bg-black/60 border border-white/10 overflow-hidden">
      <TerminalHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenArchiveModal={handleOpenArchiveModal}
      />

      {activeTab === TAB_LIVE ? (
        <LiveControls
          onClear={handleClearView}
          onRefresh={fetchLiveLogs}
          clearing={clearing}
          refreshing={refreshing}
        />
      ) : (
        <ArchiveControls
          dates={archiveDates}
          selectedDate={selectedDate}
          onChangeDate={(date) => {
            setSelectedDate(date);
            fetchArchiveLogs(date);
          }}
          loading={loadingArchiveLogs}
          onRefreshDates={fetchArchiveDates}
        />
      )}

      <div
        ref={containerRef}
        className="h-80 overflow-y-auto px-4 py-4 bg-black/40 backdrop-blur"
      >
        {displayLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            {activeTab === TAB_LIVE
              ? 'Listening for system events…'
              : loadingArchiveLogs
                ? 'Loading archived logs…'
                : 'No logs available for the selected date.'}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {displayLogs.map((log, index) => (
                <LogLine
                  key={`${log.timestamp}-${log.level}-${index}`}
                  entry={log}
                  index={index}
                  animate={activeTab === TAB_LIVE}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {archivedModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="glass-card rounded-3xl overflow-hidden w-full max-w-5xl border border-white/10 bg-black/80 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div>
                <h4 className="text-lg font-bold text-white">Archived Log Snapshots</h4>
                <p className="text-xs text-slate-300">
                  Snapshots are stored automatically when logs are cleared or rotated.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadArchivedSnapshots({ autoSelect: true })}
                  disabled={snapshotLoading}
                  className="px-3 py-1.5 text-xs rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  {snapshotLoading ? 'Refreshing…' : 'Refresh'}
                </button>
                <button
                  onClick={() => {
                    setArchivedModalOpen(false);
                    setSnapshotLogs([]);
                    setSelectedSnapshot(null);
                  }}
                  className="px-3 py-1.5 text-xs rounded-md bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-px lg:gap-0 flex-1 min-h-[20rem] max-h-[70vh]">
              <div className="border-r border-white/10 bg-black/70 overflow-hidden">
                <div className="h-full max-h-[70vh] overflow-y-auto">
                  {snapshotLoading && archivedSnapshots.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400">Loading snapshots…</div>
                  ) : archivedSnapshots.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400">No archived snapshots available.</div>
                  ) : (
                    archivedSnapshots.map((snapshot) => (
                      <button
                        key={snapshot.fileName}
                        onClick={() => handleSelectSnapshot(snapshot)}
                        className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                          selectedSnapshot?.fileName === snapshot.fileName
                            ? 'bg-white/10 text-white'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-sm font-semibold text-white">
                          {snapshot.date}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Archived {formatDateTime(snapshot.archivedAt)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {snapshot.entries} entries • {formatBytes(snapshot.size)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 bg-black/60 overflow-hidden flex flex-col">
                {snapshotLoading && (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                    Loading snapshot…
                  </div>
                )}
                {!snapshotLoading && !selectedSnapshot && (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
                    Select an archive to view its logs.
                  </div>
                )}
                {!snapshotLoading && selectedSnapshot && (
                  <div className="flex flex-col h-full">
                    <div className="px-4 py-3 border-b border-white/10 shrink-0">
                      <div className="text-sm font-semibold text-white">
                        {selectedSnapshot.fileName}
                      </div>
                      <div className="text-xs text-slate-300">
                        Archived {formatDateTime(selectedSnapshot.archivedAt)} • {selectedSnapshot.entries} entries
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-black/40">
                      {snapshotLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-slate-400">
                          No logs recorded in this snapshot.
                        </div>
                      ) : (
                        snapshotLogs.map((log, index) => (
                          <LogLine
                            key={`${log.timestamp}-${log.level}-${index}`}
                            entry={log}
                            index={index}
                            animate={false}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogsPanel;

