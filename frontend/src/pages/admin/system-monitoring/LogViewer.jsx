/**
 * Log Viewer Component
 * 
 * Scrollable console-style log viewer for system logs.
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';

const LogViewer = ({ logs, onClear }) => {
  const logEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (level) => {
    if (level === 'error') return 'text-error';
    if (level === 'warning') return 'text-warning';
    return 'text-theme-secondary';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          System Logs
        </h3>
        {logs.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium bg-error/20 text-error hover:bg-error/30 rounded-lg transition-colors border border-error/30"
          >
            🗑️ Clear Logs
          </button>
        )}
      </div>
      <div className="bg-black/30 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-theme-secondary text-center py-8">
            No logs available
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`${getLogColor(log.level)} flex flex-col sm:flex-row gap-1 sm:gap-3 break-words`}>
                <span className="text-theme-subtle flex-shrink-0 text-xs">
                  [{formatTimestamp(log.timestamp)}]
                </span>
                <span className="flex-shrink-0 font-semibold text-xs sm:text-sm">
                  {log.level.toUpperCase()}:
                </span>
                <span className="flex-1 text-xs sm:text-sm">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;

