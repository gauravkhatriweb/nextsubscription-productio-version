/**
 * Maintenance Actions Component
 * 
 * Buttons for system maintenance actions.
 * Uses health API service for maintenance operations.
 * 
 * @component
 */

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  refreshCache,
  pingDatabase,
  pingApiEndpoints,
  runSystemDiagnostics
} from '../../../lib/api/health';

const MaintenanceActions = ({ onActionComplete }) => {
  const [loading, setLoading] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);

  // MONITORING: Handle maintenance action
  const handleAction = async (action, actionName, apiFunction) => {
    if (loading[action]) return;

    setLoading(prev => ({ ...prev, [action]: true }));
    try {
      const result = await apiFunction();
      
      if (result.success) {
        toast.success(`${actionName} completed successfully`);
        if (onActionComplete) {
          onActionComplete(action, result);
        }
      } else {
        toast.error(result.message || `${actionName} failed`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || `${actionName} failed`;
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
      setConfirmAction(null);
    }
  };

  // MONITORING: Handle action with confirmation
  const handleActionWithConfirm = (action, actionName, apiFunction, confirmMessage) => {
    setConfirmAction({ action, actionName, apiFunction, confirmMessage });
  };

  const actions = [
    {
      id: 'refresh-cache',
      icon: '🔄',
      label: 'Flush Cache',
      description: 'Clear cached data',
      requiresConfirm: false,
      apiFunction: refreshCache
    },
    {
      id: 'ping-database',
      icon: '🧠',
      label: 'Recheck Database',
      description: 'Verify DB connection',
      requiresConfirm: false,
      apiFunction: pingDatabase
    },
    {
      id: 'ping-api',
      icon: '🛰️',
      label: 'Ping API Endpoints',
      description: 'Check API health',
      requiresConfirm: false,
      apiFunction: pingApiEndpoints
    },
    {
      id: 'diagnostics',
      icon: '⚙️',
      label: 'System Diagnostics',
      description: 'Run full diagnostics',
      requiresConfirm: false,
      apiFunction: runSystemDiagnostics
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
            onClick={() => {
              if (action.requiresConfirm) {
                handleActionWithConfirm(
                  action.id,
                  action.label,
                  action.apiFunction,
                  `Are you sure you want to ${action.label.toLowerCase()}?`
                );
              } else {
                handleAction(action.id, action.label, action.apiFunction);
              }
            }}
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

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-bold text-theme-primary mb-4">Confirm Action</h4>
            <p className="text-theme-secondary mb-6">{confirmAction.confirmMessage}</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(
                  confirmAction.action,
                  confirmAction.actionName,
                  confirmAction.apiFunction
                )}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceActions;

