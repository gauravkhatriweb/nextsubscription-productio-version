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

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/api/admin/vendors/${id}`, {
        withCredentials: true
      });

      if (response.data.success) {
        setVendor(response.data.data.vendor);
        setAuditLog(response.data.data.auditLog || []);
      }
    } catch (error) {
      toast.error('Failed to load vendor details');
      navigate('/admin/vendors');
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
        `${apiBase}/api/admin/vendors/${id}/status`,
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
        `${apiBase}/api/admin/vendors/${id}/resend-credentials`,
        notificationOptions,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Credentials sent successfully');
        if (response.data.temporaryPassword) {
          // Password will be shown from vendor.adminPassword after refresh
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
        `${apiBase}/api/admin/vendors/${id}/reset-password`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Password reset successfully');
        // Password will be shown from vendor.adminPassword after refresh
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

  if (loading) {
    return (
      <AdminLayout currentPage="vendors">
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
    <AdminLayout currentPage="vendors">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/vendors')}
            className="text-theme-secondary hover:text-theme-primary transition-colors"
          >
            ← Back to Vendors
          </button>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {vendor.companyName}
          </h1>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(vendor.status)}`}>
            {vendor.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor Info */}
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
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Actions
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Change Status</label>
                  <select
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={actionLoading.status}
                    className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Notification Options */}
                <div className="glass-card rounded-xl p-4 bg-theme-surface/50">
                  <label className="block text-sm font-medium mb-3 text-theme-primary">Notification Options</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationOptions.sendEmail}
                        onChange={(e) => setNotificationOptions(prev => ({ ...prev, sendEmail: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-theme-primary">📧 Send Email</span>
                    </label>
                  </div>
                </div>

                {/* WhatsApp Templates Button */}
                <button
                  onClick={() => setWhatsappModal(true)}
                  className="w-full px-4 py-3 bg-success text-white rounded-xl font-semibold hover:bg-success/90 transition-colors"
                >
                  💬 WhatsApp Templates
                </button>

                <button
                  onClick={handleResendCredentials}
                  disabled={actionLoading.resend}
                  className="w-full px-4 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
                >
                  {actionLoading.resend ? 'Sending...' : 'Resend Credentials'}
                </button>

                <button
                  onClick={handleResetPassword}
                  disabled={actionLoading.reset}
                  className="w-full px-4 py-3 border border-error text-error rounded-xl font-semibold hover:bg-error/10 transition-colors disabled:opacity-50"
                >
                  {actionLoading.reset ? 'Resetting...' : 'Reset Password'}
                </button>

              </div>
            </div>

            {/* Password Display */}
            {vendor?.adminPassword && (
              <div className="glass-card rounded-2xl p-6 bg-warning/10 border-2 border-warning/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    🔑 Vendor Password
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(vendor.adminPassword);
                      setCopiedPassword(true);
                      toast.success('Password copied!');
                      setTimeout(() => setCopiedPassword(false), 2000);
                    }}
                    className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                  >
                    {copiedPassword ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div className="bg-black/30 rounded-lg p-4 mb-3">
                  <code className="text-lg font-mono font-bold text-theme-primary tracking-wider">
                    {vendor.adminPassword}
                  </code>
                </div>
                <p className="text-xs text-theme-secondary">
                  ⚠️ This is the permanent password for this vendor. Save it securely.
                </p>
              </div>
            )}

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
                    vendorPassword: vendor.adminPassword || '[Password not available]'
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

