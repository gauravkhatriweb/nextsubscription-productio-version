/**
 * System Monitoring Page
 * 
 * Main system monitoring dashboard with real-time metrics and maintenance controls.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import SystemCard from './SystemCard';
import MetricChart from './MetricChart';
import MaintenanceActions from './MaintenanceActions';
import LogViewer from './LogViewer';

const SystemMonitoring = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/admin/system/status`, {
        withCredentials: true
      });
      if (response.data.success) {
        setSystemStatus(response.data.data);
      }
    } catch (error) {
      if (loading) {
        toast.error('Failed to load system status');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/admin/system/logs`, {
        withCredentials: true,
        params: { limit: 50 }
      });
      if (response.data.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      // Silent fail for logs
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    fetchLogs();

    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSystemStatus();
        fetchLogs();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleActionComplete = () => {
    // Refresh status after action
    setTimeout(() => {
      fetchSystemStatus();
      fetchLogs();
    }, 1000);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="monitoring">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading system status...</p>
        </div>
      </AdminLayout>
    );
  }

  const getStatusFromValue = (value, thresholds = { critical: 90, warning: 70 }) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= thresholds.critical) return 'critical';
    if (numValue >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  return (
    <AdminLayout currentPage="monitoring">
      <div className="space-y-6">
        {/* Header with Auto-refresh Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            System Health Overview
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-theme-primary">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-theme-secondary">Auto-refresh</span>
            </label>
            <div className={`h-3 w-3 rounded-full ${autoRefresh ? 'bg-success animate-pulse' : 'bg-theme-subtle'}`} title={autoRefresh ? 'Live' : 'Paused'} />
          </div>
        </div>

        {/* System Health Summary - Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SystemCard
            title="CPU Usage"
            value={systemStatus?.cpuUsage || '0%'}
            status={getStatusFromValue(systemStatus?.cpuUsage)}
            icon="⚡"
            subtitle="Processor load"
          >
            <MetricChart
              value={systemStatus?.cpuUsage || '0'}
              label="CPU"
            />
          </SystemCard>

          <SystemCard
            title="Memory Usage"
            value={systemStatus?.memoryUsage || '0%'}
            status={getStatusFromValue(systemStatus?.memoryUsage)}
            icon="💾"
            subtitle="RAM consumption"
          >
            <MetricChart
              value={systemStatus?.memoryUsage || '0'}
              label="Memory"
            />
          </SystemCard>

          <SystemCard
            title="Disk Usage"
            value={systemStatus?.diskUsage || '0%'}
            status={getStatusFromValue(systemStatus?.diskUsage)}
            icon="💿"
            subtitle="Storage space"
          >
            <MetricChart
              value={systemStatus?.diskUsage || '0'}
              label="Disk"
            />
          </SystemCard>

          <SystemCard
            title="API Latency"
            value={systemStatus?.apiLatency || '0ms'}
            status={getStatusFromValue(systemStatus?.apiLatency, { critical: 500, warning: 300 })}
            icon="🌐"
            subtitle="Response time"
          />

          <SystemCard
            title="Database Latency"
            value={systemStatus?.dbLatency || '0ms'}
            status={getStatusFromValue(systemStatus?.dbLatency, { critical: 200, warning: 100 })}
            icon="🗄️"
            subtitle="DB response time"
          />
        </div>

        {/* Performance & Activity Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SystemCard
            title="Active Users"
            value={systemStatus?.activeUsers || 0}
            status="healthy"
            icon="👥"
            subtitle="Currently online"
          />
          <SystemCard
            title="System Uptime"
            value={systemStatus?.uptime || '99.99%'}
            status="healthy"
            icon="✅"
            subtitle="Availability"
          />
          <SystemCard
            title="Last Check"
            value={systemStatus?.lastChecked ? new Date(systemStatus.lastChecked).toLocaleTimeString() : 'N/A'}
            status="healthy"
            icon="🕐"
            subtitle="Status update"
          />
        </div>

        {/* Maintenance Actions */}
        <MaintenanceActions onActionComplete={handleActionComplete} />

        {/* System Logs */}
        <LogViewer 
          logs={logs} 
          onClear={async () => {
            try {
              // Call backend to clear logs
              await axios.post(`${apiBase}/api/admin/system/clear-logs`, {}, { withCredentials: true });
              setLogs([]);
              toast.success('Logs cleared successfully');
            } catch (error) {
              // Fallback to client-side clear
              setLogs([]);
              toast.success('Logs cleared');
            }
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default SystemMonitoring;

