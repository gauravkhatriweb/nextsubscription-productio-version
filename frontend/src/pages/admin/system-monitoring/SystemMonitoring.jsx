/**
 * System Monitoring Page
 * 
 * Main system monitoring dashboard with real-time metrics, charts, and maintenance controls.
 * Uses comprehensive health endpoint for full system status.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AdminLayout from '../../../components/AdminLayout';
import SystemCard from './SystemCard';
import MetricChart from './MetricChart';
import MaintenanceActions from './MaintenanceActions';
import LogViewer from './LogViewer';
import LineChart from '../../../components/admin/system-monitoring/LineChart';
import AreaChart from '../../../components/admin/system-monitoring/AreaChart';
import BarChart from '../../../components/admin/system-monitoring/BarChart';
import PieChart from '../../../components/admin/system-monitoring/PieChart';
import { useHealthStatus } from '../../../hooks/useHealthStatus';
import { getSystemLogs, clearSystemLogs } from '../../../lib/api/health';

const SystemMonitoring = () => {
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // MONITORING: Use health status hook with 10-second polling
  // Use admin endpoint for authenticated requests
  const { data: healthData, loading, error, lastUpdated, history, getChartData, refresh } = useHealthStatus({
    pollInterval: 10000, // 10 seconds
    enabled: autoRefresh,
    useAdminEndpoint: true // MONITORING: Use admin endpoint for authenticated requests
  });

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const logsData = await getSystemLogs(50);
      setLogs(logsData);
    } catch (error) {
      // Silent fail for logs
      console.error('Failed to fetch logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Refresh logs every 30 seconds
    const logsInterval = setInterval(() => {
      fetchLogs();
    }, 30000);
    
    return () => clearInterval(logsInterval);
  }, []);

  const handleActionComplete = () => {
    // Refresh status after action
    setTimeout(() => {
      refresh();
      fetchLogs();
    }, 1000);
  };

  const handleClearLogs = async () => {
    try {
      await clearSystemLogs();
      setLogs([]);
      toast.success('Logs cleared successfully');
    } catch (error) {
      toast.error('Failed to clear logs');
    }
  };

  if (loading && !healthData) {
    return (
      <AdminLayout currentPage="monitoring">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading system status...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && !healthData) {
    return (
      <AdminLayout currentPage="monitoring">
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-error mb-4">Failed to load system status</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  // MONITORING: Extract health data from response
  // Admin endpoint returns { success: true, data: healthStatus }
  // Public endpoint returns healthStatus directly
  // Since we're using useAdminEndpoint=true, healthData should already be the health status object
  const health = healthData || {};
  const app = health?.app || {};
  const database = health?.database || {};
  const api = health?.api || {};
  const system = health?.system || {};
  const externalServices = health?.externalServices || {};
  const frontend = health?.frontend || {};
  const security = health?.security || {};
  
  // MONITORING: Extract overall status
  const overallStatus = health?.status || 'UNKNOWN';

  // MONITORING: Get status from value helper
  const getStatusFromValue = (value, thresholds = { critical: 90, warning: 70 }) => {
    if (typeof value === 'string') {
      const numValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
      if (numValue >= thresholds.critical) return 'critical';
      if (numValue >= thresholds.warning) return 'warning';
      return 'healthy';
    }
    const numValue = parseFloat(value) || 0;
    if (numValue >= thresholds.critical) return 'critical';
    if (numValue >= thresholds.warning) return 'warning';
    return 'healthy';
  };

  // MONITORING: Get status color
  const getStatusColor = (status) => {
    if (status === 'UP' || status === 'healthy' || status === 'OK') return 'success';
    if (status === 'DEGRADED' || status === 'warning' || status === 'WARNING') return 'warning';
    if (status === 'DOWN' || status === 'critical' || status === 'CRITICAL' || status === 'ERROR') return 'critical';
    return 'healthy';
  };

  // MONITORING: Prepare chart data from history
  // History items store data directly (already extracted from response)
  const apiLatencyData = history.map(item => {
    const healthData = item.data || {};
    const latency = healthData?.api?.avgResponseTimeMs || 0;
    return {
      time: new Date(item.timestamp).toLocaleTimeString(),
      timestamp: item.timestamp,
      value: latency
    };
  });

  const dbLatencyData = history.map(item => {
    const healthData = item.data || {};
    const latency = healthData?.database?.latencyMs || 0;
    return {
      time: new Date(item.timestamp).toLocaleTimeString(),
      timestamp: item.timestamp,
      value: latency
    };
  });

  // MONITORING: Prepare area chart data (CPU and Memory)
  const systemResourcesData = history.map(item => {
    const healthData = item.data || {};
    const systemData = healthData?.system || {};
    return {
      time: new Date(item.timestamp).toLocaleTimeString(),
      timestamp: item.timestamp,
      cpu: systemData.cpuUsagePercent || parseFloat(systemData.cpuUsage?.replace('%', '')) || 0,
      memory: systemData.memory?.usagePercent || 0
    };
  });

  // MONITORING: Prepare bar chart data (API metrics)
  const apiMetricsData = [
    {
      name: 'Avg Response',
      value: api.avgResponseTimeMs || 0,
      requests: api.requestsLastMinute || 0
    },
    {
      name: 'DB Latency',
      value: database.latencyMs || 0,
      requests: 0
    },
    {
      name: 'Error Rate',
      value: api.errorRatePercent || 0,
      requests: api.requestsLastMinute || 0
    }
  ];

  // MONITORING: Prepare pie chart data (external services)
  const externalServicesData = Object.entries(externalServices).map(([key, value]) => {
    const status = value?.status || value || 'UNKNOWN';
    return {
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: status === 'UP' ? 1 : status === 'DOWN' ? 0 : 0.5,
      status: status
    };
  }).filter(item => item.value !== undefined);

  return (
    <AdminLayout currentPage="monitoring">
      <div className="space-y-6">
        {/* Header with Auto-refresh Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-2" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              System Health Overview
            </h2>
            <p className="text-theme-secondary text-sm">
              {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}`}
              {health?.cached && ` (Cached)`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-theme-primary cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded cursor-pointer"
              />
              <span className="text-theme-secondary">Auto-refresh</span>
            </label>
            <div className={`h-3 w-3 rounded-full ${autoRefresh ? 'bg-success animate-pulse' : 'bg-theme-subtle'}`} title={autoRefresh ? 'Live' : 'Paused'} />
            <button
              onClick={refresh}
              className="px-4 py-2 text-sm bg-brand-primary/20 text-brand-primary rounded-lg hover:bg-brand-primary/30 transition-colors"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* System Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border-2"
          style={{
            borderColor: overallStatus === 'UP' ? 'rgba(16, 185, 129, 0.3)' : 
                        overallStatus === 'DEGRADED' ? 'rgba(245, 158, 11, 0.3)' : 
                        'rgba(228, 54, 54, 0.3)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-theme-primary mb-1">Overall Status</h3>
              <p className="text-theme-secondary text-sm">
                {app.name} v{app.version} • {app.environment} • {app.uptime}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-lg font-bold ${
              getStatusColor(overallStatus) === 'success' ? 'bg-success/20 text-success' :
              getStatusColor(overallStatus) === 'warning' ? 'bg-warning/20 text-warning' :
              'bg-error/20 text-error'
            }`}>
              {overallStatus}
            </div>
          </div>
        </motion.div>

        {/* System Health Summary - Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <SystemCard
              title="CPU Usage"
              value={system.cpuUsage || '0%'}
              status={getStatusFromValue(system.cpuUsagePercent || system.cpuUsage)}
              icon="⚡"
              subtitle={`${system.cpuCount || 'N/A'} cores • ${system.cpuTemperature || 'N/A'}`}
            >
              <MetricChart
                value={system.cpuUsagePercent || parseFloat(system.cpuUsage) || 0}
                label="CPU"
              />
            </SystemCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SystemCard
              title="Memory Usage"
              value={system.memory?.display || system.memory || '0GB / 0GB'}
              status={getStatusFromValue(system.memory?.usagePercent || 0)}
              icon="💾"
              subtitle={`${system.memory?.usagePercent || 0}% used`}
            >
              <MetricChart
                value={system.memory?.usagePercent || 0}
                label="Memory"
              />
            </SystemCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SystemCard
              title="Disk Usage"
              value={system.diskUsage?.display || system.diskUsage || 'N/A'}
              status={getStatusFromValue(system.diskUsage?.usagePercent || 0)}
              icon="💿"
              subtitle={`${system.diskUsage?.usagePercent || 0}% • ${system.diskUsage?.filesystem || 'N/A'}`}
            >
              {system.diskUsage?.usagePercent !== undefined && (
                <MetricChart
                  value={system.diskUsage.usagePercent}
                  label="Disk"
                />
              )}
            </SystemCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <SystemCard
              title="API Latency"
              value={`${api.avgResponseTimeMs || 0}ms`}
              status={getStatusFromValue(api.avgResponseTimeMs, { critical: 500, warning: 300 })}
              icon="🌐"
              subtitle={`${api.requestsLastMinute || 0} req/min • ${api.errorRatePercent || 0}% errors`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <SystemCard
              title="Database Latency"
              value={`${database.latencyMs || 0}ms`}
              status={getStatusFromValue(database.latencyMs, { critical: 200, warning: 100 })}
              icon="🗄️"
              subtitle={`${database.status || 'UNKNOWN'} • ${database.collectionsCount || 0} collections`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <SystemCard
              title="System Uptime"
              value={system.uptime || app.uptime || 'N/A'}
              status="healthy"
              icon="✅"
              subtitle={`${app.environment || 'N/A'} • ${system.hostname || 'N/A'}`}
            />
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Latency Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-theme-primary mb-4">API Latency Trend</h3>
            <LineChart
              data={apiLatencyData}
              dataKey="value"
              name="Latency (ms)"
              color="#E43636"
              height={250}
            />
          </motion.div>

          {/* Database Latency Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-theme-primary mb-4">Database Latency Trend</h3>
            <LineChart
              data={dbLatencyData}
              dataKey="value"
              name="Latency (ms)"
              color="#3B82F6"
              height={250}
            />
          </motion.div>

          {/* System Resources (CPU & Memory) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-theme-primary mb-4">System Resources</h3>
            <AreaChart
              data={systemResourcesData}
              dataKeys={[
                { key: 'cpu', name: 'CPU Usage (%)', color: '#E43636' },
                { key: 'memory', name: 'Memory Usage (%)', color: '#3B82F6' }
              ]}
              height={250}
            />
          </motion.div>

          {/* API Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-theme-primary mb-4">API Metrics</h3>
            <BarChart
              data={apiMetricsData}
              dataKeys={[
                { key: 'value', name: 'Value', color: '#E43636' },
                { key: 'requests', name: 'Requests', color: '#3B82F6' }
              ]}
              height={250}
            />
          </motion.div>

          {/* External Services Status */}
          {externalServicesData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-theme-primary mb-4">External Services</h3>
              <PieChart
                data={externalServicesData}
                dataKey="value"
                nameKey="name"
                height={250}
              />
              <div className="mt-4 space-y-2">
                {Object.entries(externalServices).map(([key, value]) => {
                  const status = value?.status || value || 'UNKNOWN';
                  return (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-theme-secondary">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        status === 'UP' ? 'bg-success/20 text-success' :
                        status === 'DOWN' ? 'bg-error/20 text-error' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Maintenance Actions */}
        <MaintenanceActions onActionComplete={handleActionComplete} />

        {/* System Logs */}
        <LogViewer 
          logs={logs} 
          onClear={handleClearLogs}
        />
      </div>
    </AdminLayout>
  );
};

export default SystemMonitoring;
