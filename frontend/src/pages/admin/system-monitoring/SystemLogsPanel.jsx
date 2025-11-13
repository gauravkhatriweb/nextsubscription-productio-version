/**
 * SystemLogsPanel
 *
 * Renders live and archived system logs inside a terminal-style UI powered by
 * Shadcn-inspired styling with framer-motion animations.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSystemLogs,
  getSystemLogsByDate,
  getAvailableLogDates
} from '../../../lib/api/health';

const TAB_LIVE = 'live';
const TAB_ARCHIVE = 'archive';
const POLL_INTERVAL = 5000;

const LOG_LEVEL_COLORS = {
  info: 'text-emerald-400',
  warn: 'text-amber-300',
  warning: 'text-amber-300',
  error: 'text-rose-400'
};

const terminalLineVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour12: false });
};

const getLevelColor = (level = 'info') => {
  const normalized = String(level).toLowerCase();
  return LOG_LEVEL_COLORS[normalized] || 'text-slate-200';
};

const TerminalHeader = ({ activeTab, setActiveTab }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-rose-500" />
      <span className="h-3 w-3 rounded-full bg-amber-400" />
      <span className="h-3 w-3 rounded-full bg-emerald-400" />
      <span className="ml-4 text-sm font-medium text-slate-200">
        System Terminal
      </span>
    </div>
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={() => setActiveTab(TAB_LIVE)}
        className={`px-3 py-1 rounded-md transition-colors ${
          activeTab === TAB_LIVE ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
        }`}
      >
        Live Logs
      </button>
      <button
        onClick={() => setActiveTab(TAB_ARCHIVE)}
        className={`px-3 py-1 rounded-md transition-colors ${
          activeTab === TAB_ARCHIVE ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
        }`}
      >
        Archived Logs
      </button>
    </div>
  </div>
);

const LogLine = ({ entry }) => {
  const levelColor = getLevelColor(entry.level);
  return (
    <motion.div
      variants={terminalLineVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.2 }}
      className="font-mono text-xs md:text-sm text-slate-200 break-words"
    >
      <span className="text-slate-500 mr-2">[{formatTimestamp(entry.timestamp)}]</span>
      <span className={`${levelColor} font-semibold mr-2`}>{(entry.level || 'info').toUpperCase()}</span>
      <span>{entry.message}</span>
      {entry.meta && (
        <span className="text-slate-500 ml-2">
          {JSON.stringify(entry.meta)}
        </span>
      )}
    </motion.div>
  );
};

const ArchiveControls = ({ dates, selectedDate, onChangeDate, loading }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-white/5 bg-white/5">
    <div className="text-xs text-slate-300 uppercase tracking-wide">
      Archived Logs
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
        {dates.map(date => (
          <option key={date} value={date}>
            {date}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const LiveControls = ({ onClear, onRefresh, refreshing }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/5">
    <button
      onClick={onClear}
      className="px-3 py-1.5 text-xs font-medium rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
    >
      Clear View
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

const SystemLogsPanel = () => {
  const [activeTab, setActiveTab] = useState(TAB_LIVE);
  const [liveLogs, setLiveLogs] = useState([]);
  const [archivedLogs, setArchivedLogs] = useState([]);
  const [archiveDates, setArchiveDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const liveIntervalRef = useRef(null);
  const logEndRef = useRef(null);

  // LOGS: Auto-scroll when live logs update
  useEffect(() => {
    if (activeTab === TAB_LIVE) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs, activeTab]);

  useEffect(() => {
    if (activeTab === TAB_ARCHIVE) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [archivedLogs, activeTab, selectedDate]);

  const fetchLiveLogs = async () => {
    try {
      setRefreshing(true);
      const logs = await getSystemLogs({ limit: 200 });
      setLiveLogs(logs);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchArchiveDates = async () => {
    const dates = await getAvailableLogDates();
    setArchiveDates(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
  };

  const fetchArchiveLogs = async (date) => {
    if (!date) {
      setArchivedLogs([]);
      return;
    }

    setLoading(true);
    try {
      const logs = await getSystemLogsByDate(date, 500);
      setArchivedLogs(logs);
    } finally {
      setLoading(false);
    }
  };

  // LOGS: Initialize live polling
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

  // LOGS: When archive tab is active, load logs for selected date
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

  const handleClear = () => {
    if (activeTab === TAB_LIVE) {
      setLiveLogs([]);
    } else {
      setArchivedLogs([]);
    }
  };

  return (
    <div className="glass-card rounded-2xl bg-black/60 border border-white/10 overflow-hidden">
      <TerminalHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === TAB_LIVE ? (
        <LiveControls
          onClear={handleClear}
          onRefresh={fetchLiveLogs}
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
          loading={loading}
        />
      )}

      <div className="h-80 overflow-y-auto px-4 py-4 bg-black/40 backdrop-blur">
        {displayLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            {activeTab === TAB_LIVE
              ? 'Listening for system events…'
              : loading
                ? 'Loading archived logs…'
                : 'No logs available for the selected date.'}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {displayLogs.map((log) => (
                <LogLine key={`${log.timestamp}-${log.message}`} entry={log} />
              ))}
            </AnimatePresence>
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogsPanel;

