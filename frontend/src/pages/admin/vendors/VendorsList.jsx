/**
 * Vendors List Component
 * 
 * Displays list of vendors with search, filters, password display, and WhatsApp templates.
 * 
 * @component
 * @version 2.2
 */

import React, { useState, useEffect } from 'react';
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

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

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

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/20 text-success',
      pending: 'bg-warning/20 text-warning',
      suspended: 'bg-error/20 text-error',
      rejected: 'bg-theme-subtle/20 text-theme-subtle'
    };
    return colors[status] || colors.pending;
  };

  const handleCopyPassword = (password, vendorId) => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(vendorId);
    toast.success('Password copied to clipboard!');
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  const handleCopyTemplate = (templateId, vendor) => {
    const message = generateTemplateMessage(templateId, {
      vendorName: vendor.companyName || vendor.displayName,
      vendorEmail: vendor.primaryEmail,
      vendorPassword: vendor.adminPassword || '[Password not available]'
    });
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard!');
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
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg text-sm sm:text-base"
          >
            + Create Vendor
          </button>
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
              <table className="w-full min-w-[800px]">
                <thead className="bg-theme-surface/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary">Company</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary hidden md:table-cell">Email</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary">Status</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary hidden lg:table-cell">Password</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-theme-primary hidden xl:table-cell">Created</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-theme-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-base/30">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="hover:bg-theme-surface/30 transition-colors cursor-pointer border-b border-theme-base/20"
                      onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-semibold text-theme-primary text-sm sm:text-base">{vendor.companyName}</p>
                          {vendor.displayName && (
                            <p className="text-xs sm:text-sm text-theme-secondary">{vendor.displayName}</p>
                          )}
                          <p className="text-xs text-theme-secondary md:hidden mt-1">{vendor.primaryEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <p className="text-theme-primary text-sm">{vendor.primaryEmail}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vendor.status)}`}>
                          {vendor.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                        {vendor.adminPassword ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs sm:text-sm font-mono text-theme-primary bg-theme-surface/50 px-2 py-1 rounded">
                              {vendor.adminPassword}
                            </code>
                            <button
                              onClick={() => handleCopyPassword(vendor.adminPassword, vendor._id)}
                              className="p-1 hover:bg-theme-surface rounded transition-colors"
                              title="Copy password"
                            >
                              {copiedPassword === vendor._id ? (
                                <span className="text-success text-sm">✓</span>
                              ) : (
                                <span className="text-theme-secondary text-sm">📋</span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-theme-subtle text-xs sm:text-sm">Not available</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 hidden xl:table-cell">
                        <p className="text-xs sm:text-sm text-theme-secondary">
                          {new Date(vendor.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setWhatsappModal({ open: true, vendor })}
                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                          >
                            💬
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  const message = generateTemplateMessage(template.id, {
                    vendorName: whatsappModal.vendor.companyName || whatsappModal.vendor.displayName,
                    vendorEmail: whatsappModal.vendor.primaryEmail,
                    vendorPassword: whatsappModal.vendor.adminPassword || '[Password not available]'
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
      </div>
    </AdminLayout>
  );
};

export default VendorsList;
