/**
 * Maintenance Actions Component
 * 
 * Buttons for system maintenance actions.
 * 
 * @component
 */

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const MaintenanceActions = ({ onActionComplete }) => {
  const [loading, setLoading] = useState({});
  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleAction = async (action, endpoint, actionName) => {
    if (loading[action]) return;

    setLoading(prev => ({ ...prev, [action]: true }));
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/system/${endpoint}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`${actionName} completed successfully`);
        if (onActionComplete) {
          onActionComplete(action, response.data);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || `${actionName} failed`;
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  const actions = [
    {
      id: 'refresh-cache',
      icon: '🔄',
      label: 'Flush Cache',
      endpoint: 'refresh-cache',
      description: 'Clear cached data'
    },
    {
      id: 'ping-database',
      icon: '🧠',
      label: 'Recheck Database',
      endpoint: 'ping-database',
      description: 'Verify DB connection'
    },
    {
      id: 'ping-api',
      icon: '🛰️',
      label: 'Ping API Endpoints',
      endpoint: 'ping-api',
      description: 'Check API health'
    },
    {
      id: 'diagnostics',
      icon: '⚙️',
      label: 'System Diagnostics',
      endpoint: 'diagnostics',
      description: 'Run full diagnostics'
    }
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
        Maintenance Controls
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id, action.endpoint, action.label)}
            disabled={loading[action.id]}
            className={`glass-card rounded-xl p-4 text-left hover:shadow-lg transition-all group ${
              loading[action.id] ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{action.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                  {action.label}
                </h4>
                <p className="text-xs text-theme-secondary">{action.description}</p>
              </div>
              {loading[action.id] && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceActions;

