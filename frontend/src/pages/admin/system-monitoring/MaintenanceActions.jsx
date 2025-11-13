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
  runSystemDiagnostics,
  maintenanceCache,
  maintenanceUsers,
  maintenanceGlobal
} from '../../../lib/api/health';

const MaintenanceActions = ({ onActionComplete }) => {
  const [loading, setLoading] = useState({});
  const [confirmAction, setConfirmAction] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    userId: '',
    email: '',
    mode: 'anonymize',
    inactiveDays: ''
  });

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

  const maintenanceActions = [
    {
      id: 'flush-cache',
      icon: '🧹',
      label: 'Flush In-Memory Cache',
      description: 'Reset health cache and request metrics',
      requiresConfirm: false,
      apiFunction: maintenanceCache
    },
    {
      id: 'cleanup-users',
      icon: '🧑‍💻',
      label: 'Cleanup User Data',
      description: 'Anonymize or delete users safely',
      requiresConfirm: false,
      customHandler: () => setUserModalOpen(true)
    },
    {
      id: 'global-cleanup',
      icon: '♻️',
      label: 'Global Cleanup',
      description: 'Run cache, user, and log cleanup',
      requiresConfirm: true,
      apiFunction: () => maintenanceGlobal({ keepLogsForDays: 30 }),
      confirmMessage: 'This will run cache maintenance, prune old logs, and optional user cleanup. Proceed?'
    }
  ];

  const diagnosticActions = [
    {
      id: 'refresh-cache',
      icon: '🔄',
      label: 'Refresh API Cache',
      description: 'Regenerate cached API responses',
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

  const submitUserMaintenance = async (event) => {
    event.preventDefault();
    if (loading['cleanup-users']) return;

    const payload = {
      mode: userForm.mode
    };

    if (userForm.userId.trim()) {
      payload.userId = userForm.userId.trim();
    }
    if (userForm.email.trim()) {
      payload.email = userForm.email.trim();
    }
    if (userForm.inactiveDays) {
      payload.inactiveDays = Number(userForm.inactiveDays);
    }

    if (!payload.userId && !payload.email && !payload.inactiveDays) {
      toast.error('Provide user ID, email, or inactive days');
      return;
    }

    setLoading(prev => ({ ...prev, 'cleanup-users': true }));
    try {
      const result = await maintenanceUsers(payload);
      if (result.success) {
        toast.success(result.message || 'User maintenance completed');
        if (onActionComplete) {
          onActionComplete('cleanup-users', result);
        }
        setUserModalOpen(false);
        setUserForm({
          userId: '',
          email: '',
          mode: 'anonymize',
          inactiveDays: ''
        });
      } else {
        toast.error(result.message || 'User maintenance failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'User maintenance failed';
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, 'cleanup-users': false }));
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
        Maintenance Controls
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {maintenanceActions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              if (action.customHandler) {
                action.customHandler();
                return;
              }
              if (action.requiresConfirm) {
                handleActionWithConfirm(
                  action.id,
                  action.label,
                  action.apiFunction,
                  action.confirmMessage || `Are you sure you want to ${action.label.toLowerCase()}?`
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

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-theme-secondary uppercase tracking-wide mb-3">
          Diagnostic Actions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diagnosticActions.map((action) => (
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
      </div>

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
                onClick={() =>
                  handleAction(
                    confirmAction.action,
                    confirmAction.actionName,
                    confirmAction.apiFunction
                  )
                }
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {userModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg mx-4">
            <h4 className="text-lg font-bold text-theme-primary mb-2">User Maintenance</h4>
            <p className="text-sm text-theme-secondary mb-4">
              Provide user details or inactive days. Leaving user id/email blank with inactive days
              will target all users inactive beyond the specified threshold.
            </p>
            <form onSubmit={submitUserMaintenance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-theme-secondary mb-1">User ID</label>
                  <input
                    type="text"
                    value={userForm.userId}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, userId: event.target.value }))
                    }
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-theme-secondary mb-1">User Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-theme-secondary mb-1">Mode</label>
                  <select
                    value={userForm.mode}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, mode: event.target.value }))
                    }
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  >
                    <option value="anonymize">Anonymize</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-theme-secondary mb-1">Inactive Days</label>
                  <input
                    type="number"
                    min="1"
                    value={userForm.inactiveDays}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, inactiveDays: event.target.value }))
                    }
                    placeholder="Optional"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-md text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading['cleanup-users']}
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    loading['cleanup-users']
                      ? 'bg-brand-primary/30 cursor-not-allowed'
                      : 'bg-brand-primary hover:bg-brand-primary/80'
                  }`}
                >
                  {loading['cleanup-users'] ? 'Processing…' : 'Execute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceActions;