/**
 * Vendor Detail Component
 * 
 * Displays vendor details, audit log, and management actions.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import { getAllTemplates, generateTemplateMessage } from '../../../utils/whatsappTemplates';

const VendorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [notificationOptions, setNotificationOptions] = useState({
    sendEmail: true,
    rejectionReason: ''
  });
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInfo, setPasswordInfo] = useState({ value: null, loading: false, available: false });
  const [passwordError, setPasswordError] = useState('');
  const [passwordModal, setPasswordModal] = useState({ open: false, password: '', context: null });

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';
  const actionTileClass = 'glass-card rounded-2xl p-5 text-left border border-theme-base/30 hover:border-brand-primary/50 hover:bg-brand-secondary/10 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed';

  useEffect(() => {
    fetchVendor();
  }, [id]);

  useEffect(() => {
  setShowPassword(false);
  setCopiedPassword(false);
}, [passwordInfo.value]);

const fetchVendorPassword = async ({ silent = false } = {}) => {
  if (!id) return null;

  setPasswordError('');
  setPasswordInfo((prev) => ({ ...prev, loading: true }));

  try {
    const response = await axios.get(`${apiBase}/api/admin/vendor/${id}/password`, {
      withCredentials: true
    });

    if (response.data?.success && response.data.password) {
      const password = response.data.password;
      setPasswordInfo({ value: password, loading: false, available: true });
      return password;
    }

    const message = response.data?.message || 'Password not available. Reset to generate a new one.';
    setPasswordInfo({ value: null, loading: false, available: false });
    setPasswordError(message);
    if (!silent) {
      toast.info(message);
    }
    return null;
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to retrieve password';
    setPasswordInfo({ value: null, loading: false, available: false });
    setPasswordError(message);
    if (!silent) {
      toast.error(message);
    }
    return null;
  }
};

const handlePasswordCopy = () => {
  if (!passwordInfo.value) {
    toast.info(passwordError || 'Password not available.');
    return;
  }
  navigator.clipboard.writeText(passwordInfo.value);
  setCopiedPassword(true);
  toast.success('Password copied!');
  setTimeout(() => setCopiedPassword(false), 2000);
};

const closePasswordModal = () => {
  setPasswordModal({ open: false, password: '', context: null });
};

const handlePasswordModalCopy = () => {
  if (!passwordModal.password) return;
  navigator.clipboard.writeText(passwordModal.password);
  toast.success('Password copied!');
};

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/api/admin/vendor/${id}`, {
        withCredentials: true
      });

    if (response.data.success) {
      const vendorData = response.data.data.vendor;
      setVendor(vendorData);
      setAuditLog(response.data.data.auditLog || []);

      if (vendorData?.adminPasswordAvailable) {
        await fetchVendorPassword({ silent: true });
      } else {
        setPasswordInfo({ value: null, loading: false, available: false });
        setPasswordError('Password not available. Reset to generate a new one.');
      }
    }
    } catch (error) {
      toast.error('Failed to load vendor details');
      navigate('/admin/vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'rejected') {
      const reason = window.prompt('Please provide a reason for rejection (optional):');
      if (reason === null) return; // User cancelled
      setNotificationOptions(prev => ({ ...prev, rejectionReason: reason || '' }));
    }

    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, status: true }));
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/vendor/${id}/status`,
        {
          status: newStatus,
          ...notificationOptions
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Status updated successfully');
        fetchVendor();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(prev => ({ ...prev, status: false }));
    }
  };

  const handleResendCredentials = async () => {
    setActionLoading(prev => ({ ...prev, resend: true }));
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/vendor/${id}/resend-credentials`,
        notificationOptions,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Credentials sent successfully');
        if (response.data.temporaryPassword) {
        setPasswordInfo({ value: response.data.temporaryPassword, loading: false, available: true });
        setPasswordError('');
        setPasswordModal({ open: true, password: response.data.temporaryPassword, context: 'resend' });
        fetchVendor();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend credentials');
    } finally {
      setActionLoading(prev => ({ ...prev, resend: false }));
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm('Are you sure you want to reset the vendor password? A new permanent password will be generated and shown to you.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, reset: true }));
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/vendor/${id}/reset-password`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Password reset successfully');
      if (response.data.password) {
        setPasswordInfo({ value: response.data.password, loading: false, available: true });
        setPasswordError('');
        setPasswordModal({ open: true, password: response.data.password, context: 'reset' });
      }
        fetchVendor();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setActionLoading(prev => ({ ...prev, reset: false }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/20 text-success',
      pending: 'bg-warning/20 text-warning',
      suspended: 'bg-error/20 text-error',
      rejected: 'bg-theme-subtle text-theme-secondary'
    };
    return colors[status] || colors.pending;
  };

  const handleOpenWhatsappModal = async () => {
    if (!vendor) return;
    if (vendor.adminPasswordAvailable && !passwordInfo.value && !passwordInfo.loading) {
      await fetchVendorPassword({ silent: true });
    }
    setWhatsappModal(true);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="vendor">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading vendor details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!vendor) {
    return null;
  }

  return (
    <AdminLayout currentPage="vendor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/vendor')}
            className="text-theme-secondary hover:text-theme-primary transition-colors"
          >
            ← Back to vendor
          </button>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {vendor.companyName}
          </h1>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(vendor.status)}`}>
            {vendor.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VENDOR-UI: Vendor Info & Audit Log */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Vendor Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-theme-secondary">Company Name</label>
                  <p className="text-theme-primary font-semibold">{vendor.companyName}</p>
                </div>
                {vendor.displayName && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Display Name</label>
                    <p className="text-theme-primary">{vendor.displayName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-theme-secondary">Primary Email</label>
                  <p className="text-theme-primary">{vendor.primaryEmail}</p>
                </div>
                {vendor.contactPhone && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Contact Phone</label>
                    <p className="text-theme-primary">{vendor.contactPhone}</p>
                  </div>
                )}
                {vendor.country && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Country</label>
                    <p className="text-theme-primary">{vendor.country}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-theme-secondary">Currency</label>
                  <p className="text-theme-primary">{vendor.currency}</p>
                </div>
                {vendor.notes && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Notes</label>
                    <p className="text-theme-primary whitespace-pre-wrap">{vendor.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Audit Log
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLog.length === 0 ? (
                  <p className="text-theme-secondary text-center py-4">No audit entries</p>
                ) : (
                  auditLog.map((entry, index) => (
                    <div key={index} className="border-b border-theme-base pb-2 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-theme-primary">{entry.action.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-theme-subtle">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-theme-secondary">By: {entry.adminId}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-5">
            {/* Stock Request Card */}
            <div className="glass-card rounded-2xl p-5 border border-theme-base/30 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Stock Request
                  </h3>
                  <p className="text-xs text-theme-secondary">Request stock from this vendor</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/vendor/${id}/requests/new`)}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm bg-brand-primary text-black hover:bg-brand-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span>📦</span>
                <span>Create Stock Request</span>
              </button>
            </div>
            {/* VENDOR-UI: Credentials Management Card */}
            <div className="glass-card rounded-2xl p-5 border border-theme-base/30 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Credentials Management
                  </h3>
                  <p className="text-xs text-theme-secondary">Manage vendor login credentials</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResendCredentials}
                  disabled={actionLoading.resend}
                  className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    actionLoading.resend 
                      ? 'bg-theme-surface/40 text-theme-secondary cursor-not-allowed' 
                      : 'bg-brand-primary text-black hover:bg-brand-primary/90 shadow-lg hover:shadow-xl'
                  }`}
                  title="Send latest password and onboarding email to vendor"
                >
                  {actionLoading.resend ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <span>📧</span>
                      <span>Resend Credentials</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={actionLoading.reset}
                  className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    actionLoading.reset 
                      ? 'bg-theme-surface/40 text-theme-secondary cursor-not-allowed' 
                      : 'bg-theme-surface/70 text-theme-primary hover:bg-theme-surface/90 border border-theme-base/40'
                  }`}
                  title="Generate a new admin-controlled password"
                >
                  {actionLoading.reset ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-theme-primary border-t-transparent rounded-full"></span>
                      <span>Resetting…</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handlePasswordCopy}
                  disabled={!passwordInfo.value}
                  className={`w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    !passwordInfo.value
                      ? 'bg-theme-surface/40 text-theme-secondary cursor-not-allowed'
                      : 'bg-theme-surface/70 text-theme-primary hover:bg-theme-surface/90 border border-theme-base/40'
                  }`}
                  title="Copy vendor password to clipboard"
                >
                  <span>📋</span>
                  <span>Copy Password</span>
                </button>
              </div>
            </div>

            {/* VENDOR-UI: Notifications & Messaging Card */}
            <div className="glass-card rounded-2xl p-5 border border-theme-base/30 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Notifications & Messaging
                  </h3>
                  <p className="text-xs text-theme-secondary">Send messages and manage email preferences</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleOpenWhatsappModal}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm bg-brand-primary text-black hover:bg-brand-primary/90 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  title="Open WhatsApp message templates with auto-filled credentials"
                >
                  <span>💬</span>
                  <span>Send WhatsApp Template</span>
                </button>
                <label className="flex items-center gap-3 px-3 py-2 rounded-xl bg-theme-surface/30 hover:bg-theme-surface/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationOptions.sendEmail}
                    onChange={(e) => setNotificationOptions(prev => ({ ...prev, sendEmail: e.target.checked }))}
                    className="rounded h-4 w-4 text-brand-primary focus:ring-brand-primary border-theme-base bg-theme-surface"
                  />
                  <span className="text-sm text-theme-primary">Send email on status change</span>
                </label>
                {notificationOptions.rejectionReason && (
                  <div className="p-3 bg-theme-surface/50 rounded-xl border border-theme-base/30">
                    <p className="text-xs text-theme-secondary mb-1">Last rejection reason:</p>
                    <p className="text-sm text-theme-primary">{notificationOptions.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* VENDOR-UI: Account Controls Card */}
            <div className="glass-card rounded-2xl p-5 border border-theme-base/30 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Account Controls
                  </h3>
                  <p className="text-xs text-theme-secondary">Manage vendor account status</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-2">Account Status</label>
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={actionLoading.status}
                    className="w-full rounded-xl border border-theme-base/40 bg-theme-surface px-4 py-2.5 text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-60 transition-all"
                    title="Update vendor account status"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <p className="text-xs text-theme-secondary mt-1.5">Change the vendor account status</p>
                </div>
              </div>
            </div>

            {/* Password Display */}
            <div className="glass-card rounded-2xl p-6 border border-warning/40 bg-warning/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  🔑 Vendor Password
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchVendorPassword()}
                    disabled={passwordInfo.loading}
                    className="px-3 py-1 text-sm rounded-lg border border-theme-base/30 bg-theme-surface/40 hover:bg-theme-surface/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Refresh password"
                  >
                    {passwordInfo.loading ? (
                      <span className="inline-block h-4 w-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      '↻'
                    )}
                  </button>
                  <button
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={!passwordInfo.available || passwordInfo.loading}
                    className="px-3 py-1 text-sm rounded-lg border border-theme-base/30 bg-theme-surface/40 hover:bg-theme-surface/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                  <button
                    onClick={handlePasswordCopy}
                    disabled={!passwordInfo.value}
                    className="px-3 py-1 text-sm rounded-lg border border-brand-primary/40 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Copy password"
                  >
                    {copiedPassword ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {passwordInfo.loading ? (
                <div className="flex items-center gap-3 text-sm text-theme-secondary">
                  <span className="inline-block h-5 w-5 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
                  <span>Fetching secure password…</span>
                </div>
              ) : passwordInfo.available && passwordInfo.value ? (
                <div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handlePasswordCopy}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        handlePasswordCopy();
                      }
                    }}
                    className="bg-black/30 rounded-lg p-4 mb-2 cursor-pointer hover:bg-black/40 transition-colors"
                    title="Click to copy password"
                  >
                    <code className="text-xl font-mono font-semibold text-theme-primary tracking-wider break-all">
                      {showPassword ? passwordInfo.value : '•'.repeat(Math.max(passwordInfo.value.length, 6))}
                    </code>
                  </div>
                  {copiedPassword && (
                    <p className="text-xs text-success mb-1">Copied!</p>
                  )}
                  <p className="text-xs text-theme-secondary">
                    ⚠️ Admin-only password. Reset or resend credentials from the actions above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-theme-secondary">
                    {passwordError || 'Password not available. Reset to generate a new one.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => fetchVendorPassword()}
                      className="px-4 py-2 rounded-lg bg-theme-surface/40 border border-theme-base/30 text-sm text-theme-primary hover:bg-theme-surface/60 transition-colors"
                    >
                      🔄 Try Fetching Again
                    </button>
                    <button
                      onClick={handleResetPassword}
                      className="px-4 py-2 rounded-lg bg-brand-primary text-black text-sm font-semibold hover:bg-brand-primary/90 transition-colors"
                    >
                      🔐 Generate New Password
                    </button>
                  </div>
                  <p className="text-xs text-theme-secondary">
                    Resetting will create a fresh password and notify the vendor via email.
                  </p>
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Account Info
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-theme-secondary">Created:</span>
                  <p className="text-theme-primary">{new Date(vendor.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-theme-secondary">Created By:</span>
                  <p className="text-theme-primary">{vendor.createdBy}</p>
                </div>
                <div>
                  <span className="text-theme-secondary">Password Management:</span>
                  <p className="text-theme-primary">Admin-controlled (vendor cannot change)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Reveal Modal */}
        {passwordModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 max-w-lg w-full border border-theme-base/30 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Admin Password Access
                  </h2>
                  <p className="text-sm text-theme-secondary mt-1">
                    {passwordModal.context === 'reset'
                      ? 'A new password was generated. Share securely with the vendor.'
                      : 'Latest vendor password retrieved for reference.'}
                  </p>
                </div>
                <button
                  onClick={closePasswordModal}
                  className="text-theme-secondary hover:text-theme-primary transition-colors text-2xl"
                  aria-label="Close password modal"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-theme-secondary">Vendor</p>
                <p className="text-theme-primary font-semibold text-sm sm:text-base">
                  {vendor.companyName || vendor.displayName}
                </p>
                <p className="text-xs text-theme-secondary break-all">{vendor.primaryEmail}</p>
              </div>

              <div className="bg-black/40 rounded-xl p-5 border border-theme-base/30 text-center">
                <code className="text-2xl font-mono text-theme-primary tracking-wider break-all">
                  {passwordModal.password}
                </code>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handlePasswordModalCopy}
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-black font-semibold hover:bg-brand-primary/90 transition-colors"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-theme-base/40 text-theme-primary hover:bg-theme-surface/40 transition-colors"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-theme-secondary">
                Password visibility is restricted to admins. All access is recorded in the audit log.
              </p>
            </div>
          </div>
        )}

        {/* WhatsApp Templates Modal */}
        {whatsappModal && vendor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 max-w-3xl w-full border border-theme-base/30 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  WhatsApp Message Templates
                </h2>
                <button
                  onClick={() => setWhatsappModal(false)}
                  className="text-theme-secondary hover:text-theme-primary transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-theme-surface/50 rounded-xl border border-theme-base/30">
                <p className="text-sm text-theme-secondary mb-1">Vendor:</p>
                <p className="font-semibold text-theme-primary">{vendor.companyName}</p>
                <p className="text-sm text-theme-secondary">{vendor.primaryEmail}</p>
              </div>

              <div className="space-y-4">
                {getAllTemplates().map((template) => {
                  const message = generateTemplateMessage(template.id, {
                    vendorName: vendor.companyName || vendor.displayName,
                    vendorEmail: vendor.primaryEmail,
                    vendorPassword: passwordInfo.value || '[Password not available]'
                  });
                  
                  return (
                    <div key={template.id} className="glass-card rounded-xl p-6 border border-theme-base/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-theme-primary mb-1">{template.name}</h3>
                          <p className="text-sm text-theme-secondary">{template.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(message);
                            toast.success('Message copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 mt-3">
                        <pre className="text-sm text-theme-primary whitespace-pre-wrap font-mono overflow-x-auto">
                          {message}
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};


export default VendorDetail;