/**
 * Vendors List Component
 * 
 * Displays list of vendors with search, filters, password display, and WhatsApp templates.
 * 
 * @component
 * @version 2.2
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import { getAllTemplates, generateTemplateMessage } from '../../../utils/whatsappTemplates';

const VendorsList = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [whatsappModal, setWhatsappModal] = useState({ open: false, vendor: null });
  const [copiedPassword, setCopiedPassword] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showWhatsAppGenerator, setShowWhatsAppGenerator] = useState(false);
  const [manualWhatsAppNumber, setManualWhatsAppNumber] = useState('');
  const [manualWhatsAppMessage, setManualWhatsAppMessage] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [rowActionLoading, setRowActionLoading] = useState({});
  const [passwordCache, setPasswordCache] = useState({});
  const [passwordLoading, setPasswordLoading] = useState({});
  const [passwordModal, setPasswordModal] = useState({ open: false, vendor: null, password: '', context: null });
  const [showOverview, setShowOverview] = useState(true);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';
  const actionCardClass = 'glass-card flex flex-col justify-between gap-3 min-w-[180px] w-full rounded-xl border border-theme-base/30 bg-theme-surface/60 px-3 py-3 sm:px-4 sm:py-4 shadow-sm hover:border-brand-primary/50 transition-all';

  useEffect(() => {
    fetchVendors();
  }, [statusFilter, search]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const response = await axios.get(`${apiBase}/api/admin/vendors`, {
        params,
        withCredentials: true
      });

      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const updateRowLoading = (vendorId, action, value) => {
    setRowActionLoading((prev) => ({
      ...prev,
      [vendorId]: {
        ...(prev[vendorId] || {}),
        [action]: value
      }
    }));
  };

  const getNotificationStatus = (vendor) => {
    if (vendor?.notificationPreferences?.sendEmail !== undefined) {
      return Boolean(vendor.notificationPreferences.sendEmail);
    }
    if (vendor?.notificationOptions?.sendEmail !== undefined) {
      return Boolean(vendor.notificationOptions.sendEmail);
    }
    return true;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/20 text-success',
      pending: 'bg-warning/20 text-warning',
      suspended: 'bg-error/20 text-error',
      rejected: 'bg-theme-subtle/20 text-theme-subtle'
    };
    return colors[status] || colors.pending;
  };

  const updateVendorStatusInline = async (vendorId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [vendorId]: true }));
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/vendors/${vendorId}/status`,
        { status: newStatus, sendEmail: true },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Status updated');
        fetchVendors();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [vendorId]: false }));
    }
  };

  const hasCachedPassword = (vendorId) => Object.prototype.hasOwnProperty.call(passwordCache, vendorId);

  const ensureVendorPassword = async (vendor) => {
    const vendorId = vendor?._id;
    if (!vendorId) return null;

    if (hasCachedPassword(vendorId)) {
      return passwordCache[vendorId];
    }

    if (!vendor.adminPasswordAvailable) {
      setPasswordCache((prev) => ({ ...prev, [vendorId]: null }));
      return null;
    }

    setPasswordLoading((prev) => ({ ...prev, [vendorId]: true }));
    try {
      const response = await axios.get(`${apiBase}/api/admin/vendors/${vendorId}/password`, {
        withCredentials: true
      });

      if (response.data?.success && response.data.password) {
        const password = response.data.password;
        setPasswordCache((prev) => ({ ...prev, [vendorId]: password }));
        return password;
      }

      const errorMessage = response.data?.message || 'Password not available for this vendor. Reset to generate a new one.';
      toast.error(errorMessage);
      setPasswordCache((prev) => ({ ...prev, [vendorId]: null }));
      return null;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retrieve password');
      setPasswordCache((prev) => ({ ...prev, [vendorId]: null }));
      return null;
    } finally {
      setPasswordLoading((prev) => ({ ...prev, [vendorId]: false }));
    }
  };

  const togglePasswordVisibility = async (vendor) => {
    const vendorId = vendor?._id;
    if (!vendorId) return;

    const isVisible = Boolean(visiblePasswords[vendorId]);
    if (!isVisible) {
      const cachedPassword = hasCachedPassword(vendorId) ? passwordCache[vendorId] : null;
      if (!cachedPassword) {
        const fetched = await ensureVendorPassword(vendor);
        if (!fetched) {
          return;
        }
      }
    }

    setVisiblePasswords((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId]
    }));
  };

  const handleCopyPassword = async (vendor) => {
    const vendorId = vendor?._id;
    if (!vendorId) return;

    const password = hasCachedPassword(vendorId)
      ? passwordCache[vendorId]
      : await ensureVendorPassword(vendor);

    if (!password) {
      toast.info('Password not available. Reset to generate a new one.');
      return;
    }

    navigator.clipboard.writeText(password);
    setCopiedPassword(vendorId);
    toast.success('Password copied!');
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  const getMaskedPassword = (password = '') => {
    if (!password) return '—';
    const maskLength = Math.max(password.length, 6);
    return '•'.repeat(maskLength);
  };

  const prefillWhatsAppMessage = () => {
    const template = `Hello! 👋\n\nThis is a message from Next Subscription Admin Portal.\n\nYou can use this feature to send quick WhatsApp messages to vendors or team members.\n\nTo use:\n1. Enter the recipient's WhatsApp number (with country code, e.g., +1234567890)\n2. Type your message\n3. Click "Generate WhatsApp Link" to create a shareable link\n4. Copy the link or open it directly in WhatsApp\n\nFeatures:\n✅ Send vendor credentials\n✅ Notify about account status changes\n✅ Share important updates\n✅ Quick communication\n\nNeed help? Contact support.`;
    setManualWhatsAppMessage(template);
  };

  const buildWhatsAppUrl = () => {
    const cleanPhone = manualWhatsAppNumber.replace(/[^\d+]/g, '');
    if (!cleanPhone) {
      return null;
    }
    const encodedMessage = encodeURIComponent(manualWhatsAppMessage);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const handleGenerateWhatsAppLink = () => {
    if (!manualWhatsAppNumber) {
      toast.error('Please enter a WhatsApp number');
      return;
    }
    if (!manualWhatsAppMessage) {
      toast.error('Please enter a message');
      return;
    }

    const whatsappUrl = buildWhatsAppUrl();
    if (!whatsappUrl) {
      toast.error('Please enter a valid WhatsApp number');
      return;
    }

    navigator.clipboard.writeText(whatsappUrl);
    toast.success('WhatsApp link copied to clipboard!');
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyWhatsAppLink = () => {
    if (!manualWhatsAppMessage) {
      toast.error('Write a message before copying the link');
      return;
    }

    const whatsappUrl = buildWhatsAppUrl();
    if (!whatsappUrl) {
      toast.error('Please enter a valid WhatsApp number');
      return;
    }

    navigator.clipboard.writeText(whatsappUrl);
    toast.success('WhatsApp link copied!');
  };

  const handleCopyTemplate = async (templateId, vendor) => {
    let vendorPassword = hasCachedPassword(vendor._id) ? passwordCache[vendor._id] : null;
    if (!vendorPassword && vendor.adminPasswordAvailable) {
      vendorPassword = await ensureVendorPassword(vendor);
    }

    const message = generateTemplateMessage(templateId, {
      vendorName: vendor.companyName || vendor.displayName,
      vendorEmail: vendor.primaryEmail,
      vendorPassword: vendorPassword || '[Password not available]'
    });
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard!');
  };

  const openWhatsAppModal = async (vendor) => {
    if (!vendor) return;
    if (vendor.adminPasswordAvailable) {
      await ensureVendorPassword(vendor);
    }
    setWhatsappModal({ open: true, vendor });
  };

  const closePasswordModal = () => {
    setPasswordModal({ open: false, vendor: null, password: '', context: null });
  };

  const handlePasswordModalCopy = () => {
    if (!passwordModal.password) return;
    navigator.clipboard.writeText(passwordModal.password);
    toast.success('Password copied!');
  };

  const handleResendCredentials = async (vendor) => {
    if (!vendor?._id) return;
    updateRowLoading(vendor._id, 'resend', true);
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/vendors/${vendor._id}/resend-credentials`,
        { sendEmail: true },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Credentials sent successfully');
        if (response.data.temporaryPassword) {
          setPasswordCache((prev) => ({ ...prev, [vendor._id]: response.data.temporaryPassword }));
          setPasswordModal({ open: true, vendor, password: response.data.temporaryPassword, context: 'resend' });
          setVisiblePasswords((prev) => ({ ...prev, [vendor._id]: false }));
        }
        fetchVendors();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend credentials');
    } finally {
      updateRowLoading(vendor._id, 'resend', false);
    }
  };

  const handleResetPassword = async (vendor) => {
    if (!vendor?._id) return;
    if (!window.confirm(`Generate a fresh password for ${vendor.companyName}?`)) {
      return;
    }
    updateRowLoading(vendor._id, 'reset', true);
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/vendors/${vendor._id}/reset-password`,
        { sendEmail: true },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Password reset successfully');
        if (response.data.password) {
          setPasswordCache((prev) => ({ ...prev, [vendor._id]: response.data.password }));
          setPasswordModal({ open: true, vendor, password: response.data.password, context: 'reset' });
          setVisiblePasswords((prev) => ({ ...prev, [vendor._id]: false }));
        }
        fetchVendors();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      updateRowLoading(vendor._id, 'reset', false);
    }
  };

  const getTextColor = (bgColor) => {
    // Auto-adjust text color based on background brightness
    // Light backgrounds (beige/white) -> dark text
    // Dark backgrounds (black/red) -> light text
    if (bgColor?.includes('success') || bgColor?.includes('warning') || bgColor?.includes('error')) {
      return 'text-theme-primary'; // Status badges use theme colors
    }
    return 'text-theme-primary'; // Default to theme primary
  };

  const stats = useMemo(() => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.status === 'active').length;
    const pendingVendors = vendors.filter(v => v.status === 'pending').length;
    const suspendedVendors = vendors.filter(v => v.status === 'suspended').length;
    const recentVendors = vendors.slice(0, 5);

    // Approximate average response time based on account age since creation
    const avgMs = totalVendors > 0
      ? Math.floor(vendors.reduce((sum, v) => sum + Math.max(0, Date.now() - new Date(v.createdAt).getTime()), 0) / totalVendors)
      : 0;

    const msToHuman = (ms) => {
      if (!ms || ms <= 0) return '—';
      const days = Math.floor(ms / (24 * 60 * 60 * 1000));
      const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    const averageResponseTime = msToHuman(avgMs);

    return {
      totalVendors,
      activeVendors,
      pendingVendors,
      suspendedVendors,
      recentVendors,
      averageResponseTime
    };
  }, [vendors]);

  return (
    <AdminLayout currentPage="vendors">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Vendor Management
          </h1>
          <button
            onClick={() => navigate('/admin/vendors/create')}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-brand-primary text-black rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg text-sm sm:text-base"
          >
            + Create Vendor
          </button>
        </div>

        {/* Vendor Overview (Collapsible) */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-theme-base/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Vendor Overview
              </h2>
              <p className="text-theme-secondary text-sm">Track totals, distribution, and recent additions</p>
            </div>
            <button
              onClick={() => setShowOverview(prev => !prev)}
              className="px-4 py-2 rounded-xl border border-theme-base/30 bg-theme-surface/40 text-theme-primary hover:bg-theme-surface/60 transition-colors"
              aria-expanded={showOverview}
              aria-controls="vendor-overview-cards"
            >
              {showOverview ? 'Hide' : 'Show'} Overview
            </button>
          </div>

          {showOverview && (
            <div id="vendor-overview-cards" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-theme-base/30">
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="text-3xl font-bold text-theme-primary">{stats.totalVendors}</div>
                  <p className="text-sm text-theme-secondary">Total Vendors</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-theme-base/30">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-3xl font-bold text-success">{stats.activeVendors}</div>
                  <p className="text-sm text-theme-secondary">Active</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-theme-base/30">
                  <div className="text-3xl mb-2">⏳</div>
                  <div className="text-3xl font-bold text-warning">{stats.pendingVendors}</div>
                  <p className="text-sm text-theme-secondary">Pending</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-theme-base/30">
                  <div className="text-3xl mb-2">⛔</div>
                  <div className="text-3xl font-bold text-error">{stats.suspendedVendors}</div>
                  <p className="text-sm text-theme-secondary">Suspended</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-theme-base/30">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-3xl font-bold text-theme-primary">{stats.averageResponseTime}</div>
                  <p className="text-sm text-theme-secondary">Avg Response Time</p>
                </div>
              </div>

              {stats.recentVendors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-theme-primary">Recent Vendors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.recentVendors.map(vendor => (
                      <button
                        key={vendor._id}
                        onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                        className="glass-card rounded-2xl p-4 text-left border border-theme-base/30 hover:border-brand-primary/40 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-theme-primary text-sm sm:text-base">{vendor.companyName}</p>
                            <p className="text-xs sm:text-sm text-theme-secondary">{vendor.primaryEmail}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            vendor.status === 'active' ? 'bg-success/20 text-success' :
                            vendor.status === 'pending' ? 'bg-warning/20 text-warning' :
                            vendor.status === 'suspended' ? 'bg-error/20 text-error' :
                            'bg-theme-subtle/20 text-theme-subtle'
                          }`}>
                            {vendor.status.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Communication Toolkit */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-theme-base/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Communication Toolkit
              </h2>
              <p className="text-sm text-theme-secondary">
                Launch the WhatsApp generator for custom outreach or open vendor-specific templates from the table.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (!manualWhatsAppMessage) {
                    prefillWhatsAppMessage();
                  }
                  setShowWhatsAppGenerator(true);
                }}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg text-sm"
              >
                Open WhatsApp Generator
              </button>
              <button
                onClick={prefillWhatsAppMessage}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl border border-theme-base/40 text-theme-primary hover:bg-theme-surface/40 transition-colors text-sm"
              >
                Load Sample Message
              </button>
            </div>
          </div>
          <p className="text-xs text-theme-secondary">
            Tip: the 💬 icon in each vendor row opens templates with auto-filled credentials.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-theme-base/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-theme-primary">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company name or email..."
                className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-theme-primary">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-theme-base/30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-theme-secondary">Loading vendors...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-theme-base/30">
            <p className="text-theme-secondary">No vendors found</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden border border-theme-base/30">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] table-fixed">
                <thead className="bg-theme-surface/50">
                  <tr>
                    <th className="w-[30%] px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary">Company</th>
                    <th className="w-[28%] px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary hidden md:table-cell">Email</th>
                    <th className="w-[12%] px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary">Status</th>
                    <th className="w-[20%] px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary">Password</th>
                    <th className="w-[10%] px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary hidden xl:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-base/30">
                  {vendors.map((vendor) => {
                    const rowLoading = rowActionLoading[vendor._id] || {};
                    const resendLoading = Boolean(rowLoading.resend);
                    const resetLoading = Boolean(rowLoading.reset);
                    const notificationsEnabled = getNotificationStatus(vendor);
                    const passwordLoaded = hasCachedPassword(vendor._id);
                    const cachedPassword = passwordLoaded ? passwordCache[vendor._id] : null;
                    const isPasswordVisible = Boolean(visiblePasswords[vendor._id]);
                    const isPasswordLoading = Boolean(passwordLoading[vendor._id]);
                    const defaultMaskedDisplay = vendor.adminPasswordAvailable ? '••••••' : '—';

                    return (
                    <tr
                      key={vendor._id}
                      className="hover:bg-theme-surface/30 hover:border-brand-primary/20 hover:shadow-theme-brand/20 transition-all cursor-pointer border-b border-theme-base/20 align-middle"
                      onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="max-w-[320px]">
                          <p className="font-semibold text-theme-primary text-sm sm:text-base truncate" title={vendor.companyName}>{vendor.companyName}</p>
                          {vendor.displayName && (
                            <p className="text-xs sm:text-sm text-theme-secondary truncate" title={vendor.displayName}>{vendor.displayName}</p>
                          )}
                          <p className="text-xs text-theme-secondary md:hidden mt-1 truncate" title={vendor.primaryEmail}>{vendor.primaryEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <p className="text-theme-primary text-sm truncate max-w-[300px]" title={vendor.primaryEmail}>{vendor.primaryEmail}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>
                          {vendor.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 min-h-[36px]">
                          <button
                            onClick={() => togglePasswordVisibility(vendor)}
                            disabled={isPasswordLoading || !vendor.adminPasswordAvailable}
                            className="px-2 py-1 rounded-lg border border-theme-base/30 bg-theme-surface/40 text-sm hover:bg-theme-surface/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            title={isPasswordVisible ? 'Hide password' : (vendor.adminPasswordAvailable ? 'Reveal password' : 'Password unavailable')}
                            aria-label={isPasswordVisible ? 'Hide password' : (vendor.adminPasswordAvailable ? 'Reveal password' : 'Password unavailable')}
                          >
                            {isPasswordLoading ? (
                              <span className="inline-block h-4 w-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                              isPasswordVisible ? '🙈' : '👁️'
                            )}
                          </button>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => handleCopyPassword(vendor)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                handleCopyPassword(vendor);
                              }
                            }}
                            className={`font-mono text-xs sm:text-sm px-3 py-1 rounded-lg border border-theme-base/30 bg-theme-surface/40 cursor-pointer truncate max-w-[180px] ${
                              copiedPassword === vendor._id ? 'text-success' : 'text-theme-primary'
                            }`}
                            title="Click to copy password"
                          >
                            {isPasswordVisible
                              ? (passwordLoaded ? (cachedPassword || 'Not available') : defaultMaskedDisplay)
                              : passwordLoaded
                                ? (cachedPassword ? getMaskedPassword(cachedPassword) : '—')
                                : defaultMaskedDisplay}
                          </span>
                          {copiedPassword === vendor._id && (
                            <span className="text-success text-xs">Copied!</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden xl:table-cell">
                        <p className="text-xs sm:text-sm text-theme-secondary whitespace-nowrap">
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Password Reveal Modal */}
        {passwordModal.open && passwordModal.vendor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 max-w-lg w-full border border-theme-base/30 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    Admin Password Access
                  </h2>
                  <p className="text-sm text-theme-secondary mt-1">
                    {passwordModal.context === 'reset'
                      ? 'A new temporary password was generated. Share securely with the vendor.'
                      : 'Latest vendor password retrieved for admin reference.'}
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

              <div className="space-y-2">
                <p className="text-sm text-theme-secondary">Vendor</p>
                <p className="text-theme-primary font-semibold text-sm sm:text-base">
                  {passwordModal.vendor.companyName || passwordModal.vendor.displayName}
                </p>
                <p className="text-xs text-theme-secondary break-all">{passwordModal.vendor.primaryEmail}</p>
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
                Passwords are visible to admins only. All access is tracked in the audit log.
              </p>
            </div>
          </div>
        )}

        {/* WhatsApp Templates Modal */}
        {whatsappModal.open && whatsappModal.vendor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 max-w-3xl w-full border border-theme-base/30 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  WhatsApp Message Templates
                </h2>
                <button
                  onClick={() => setWhatsappModal({ open: false, vendor: null })}
                  className="text-theme-secondary hover:text-theme-primary transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-theme-surface/50 rounded-xl border border-theme-base/30">
                <p className="text-sm text-theme-secondary mb-1">Vendor:</p>
                <p className="font-semibold text-theme-primary">{whatsappModal.vendor.companyName}</p>
                <p className="text-sm text-theme-secondary">{whatsappModal.vendor.primaryEmail}</p>
              </div>

              <div className="space-y-4">
                {getAllTemplates().map((template) => {
                  const cachedPassword = hasCachedPassword(whatsappModal.vendor._id)
                    ? passwordCache[whatsappModal.vendor._id]
                    : null;
                  const message = generateTemplateMessage(template.id, {
                    vendorName: whatsappModal.vendor.companyName || whatsappModal.vendor.displayName,
                    vendorEmail: whatsappModal.vendor.primaryEmail,
                    vendorPassword: cachedPassword || '[Password not available]'
                  });
                  
                  return (
                    <div key={template.id} className="glass-card rounded-xl p-6 border border-theme-base/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-theme-primary mb-1">{template.name}</h3>
                          <p className="text-sm text-theme-secondary">{template.description}</p>
                        </div>
                        <button
                          onClick={() => handleCopyTemplate(template.id, whatsappModal.vendor)}
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

        {/* WhatsApp Generator Modal */}
        {showWhatsAppGenerator && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 max-w-2xl w-full border border-theme-base/30 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  WhatsApp Message Generator
                </h2>
                <button
                  onClick={() => setShowWhatsAppGenerator(false)}
                  className="text-theme-secondary hover:text-theme-primary transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-theme-primary">
                    WhatsApp Number (with country code)
                  </label>
                  <input
                    type="tel"
                    value={manualWhatsAppNumber}
                    onChange={(e) => setManualWhatsAppNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-theme-primary">
                      Message
                    </label>
                    <button
                      onClick={prefillWhatsAppMessage}
                      className="text-xs text-brand-primary hover:text-brand-primary-hover"
                    >
                      Use Sample Message
                    </button>
                  </div>
                  <textarea
                    value={manualWhatsAppMessage}
                    onChange={(e) => setManualWhatsAppMessage(e.target.value)}
                    rows={10}
                    placeholder="Type your WhatsApp message here..."
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGenerateWhatsAppLink}
                    className="flex-1 px-6 py-3 bg-success text-white rounded-xl font-semibold hover:bg-success/90 transition-colors"
                  >
                    📱 Generate & Open WhatsApp
                  </button>
                  <button
                    onClick={handleCopyWhatsAppLink}
                    className="flex-1 px-6 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VendorsList;
