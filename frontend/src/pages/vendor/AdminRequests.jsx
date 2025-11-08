/**
 * Admin Requests
 * 
 * Vendor page to view and fulfill admin stock requests.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';

const AdminRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    fulfilled: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [fulfillModal, setFulfillModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(`${apiBase}/api/vendor/admin-requests`, {
        params,
        withCredentials: true
      });

      if (response.data.success) {
        setRequests(response.data.requests || []);
        setStats({
          total: response.data.total || 0,
          pending: response.data.pending || 0,
          fulfilled: response.data.fulfilled || 0
        });
      } else {
        toast.error(response.data.message || 'Failed to load admin requests');
      }
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load admin requests';
      toast.error(errorMessage);
      
      // Set empty state on error
      setRequests([]);
      setStats({
        total: 0,
        pending: 0,
        fulfilled: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      const response = await axios.get(`${apiBase}/api/vendor/admin-requests/${requestId}/fulfill`, {
        withCredentials: true
      });

      if (response.data.success) {
        setSelectedRequest(response.data);
        setFulfillModal(true);
      }
    } catch (error) {
      toast.error('Failed to load request details');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      requested: 'bg-warning/20 text-warning border-warning/30',
      fulfilled: 'bg-success/20 text-success border-success/30',
      partially_fulfilled: 'bg-brand-primary/20 text-brand-primary border-brand-primary/30',
      rejected: 'bg-error/20 text-error border-error/30',
      cancelled: 'bg-theme-subtle/20 text-theme-subtle border-theme-subtle/30'
    };
    return badges[status] || 'bg-theme-subtle/20 text-theme-subtle border-theme-subtle/30';
  };

  const getStatusLabel = (status) => {
    const labels = {
      requested: 'Pending',
      fulfilled: 'Fulfilled',
      partially_fulfilled: 'Partially Fulfilled',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <VendorLayout currentPage="products">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading requests...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout currentPage="products">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Requests from Admin
          </h1>
          <p className="text-theme-secondary">View and fulfill stock requests from admin</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-theme-base/30">
            <div className="text-2xl font-bold text-theme-primary">{stats.total}</div>
            <div className="text-sm text-theme-secondary">Total Requests</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-warning/30 bg-warning/5">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-theme-secondary">Pending</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-success/30 bg-success/5">
            <div className="text-2xl font-bold text-success">{stats.fulfilled}</div>
            <div className="text-sm text-theme-secondary">Fulfilled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 border border-theme-base/30">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
          >
            <option value="all">All Status</option>
            <option value="requested">Pending</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
          {!loading && requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-theme-secondary mb-2">No admin requests found</p>
              <p className="text-sm text-theme-subtle">Admin requests will appear here when they are created</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
              <p className="text-theme-secondary">Loading requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-base/30">
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Request ID</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Product</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Qty Requested</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Qty Fulfilled</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Submitted</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id} className="border-b border-theme-base/10 hover:bg-theme-surface/50">
                      <td className="py-3 px-4 text-theme-primary font-mono text-sm">
                        #{request._id.toString().slice(-8)}
                      </td>
                      <td className="py-3 px-4 text-theme-primary">
                        {request.productId?.title || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-theme-secondary">{request.quantityRequested}</td>
                      <td className="py-3 px-4 text-theme-secondary">{request.quantityFulfilled || 0}</td>
                      <td className="py-3 px-4 text-theme-secondary">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {request.status === 'requested' || request.status === 'partially_fulfilled' ? (
                          <button
                            onClick={() => handleFulfill(request._id)}
                            className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium"
                          >
                            Fulfill
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // View details
                            }}
                            className="text-theme-secondary hover:text-theme-primary text-sm font-medium"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Fulfill Modal */}
      {fulfillModal && selectedRequest && (
        <FulfillRequestModal
          request={selectedRequest.request}
          product={selectedRequest.product}
          onClose={() => {
            setFulfillModal(false);
            setSelectedRequest(null);
            fetchRequests();
          }}
        />
      )}
    </VendorLayout>
  );
};

/**
 * Fulfill Request Modal Component
 */
const FulfillRequestModal = ({ request, product, onClose }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual');
  const [credentials, setCredentials] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountEmail: '',
    accountPassword: '',
    profiles: [{ profileName: '', pin: '' }]
  });

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('mode', mode);

      if (mode === 'csv' && csvFile) {
        submitData.append('csvFile', csvFile);
      } else if (mode === 'manual') {
        // Prepare credentials array
        const creds = [{
          accountEmail: formData.accountEmail,
          accountPassword: formData.accountPassword,
          profiles: formData.profiles.filter(p => p.profileName)
        }];
        submitData.append('credentials', JSON.stringify(creds));
      }

      const response = await axios.post(
        `${apiBase}/api/vendor/requests/${request._id}/fulfill`,
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fulfill request');
    } finally {
      setLoading(false);
    }
  };

  const addProfile = () => {
    setFormData(prev => ({
      ...prev,
      profiles: [...prev.profiles, { profileName: '', pin: '' }]
    }));
  };

  const updateProfile = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      profiles: prev.profiles.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-card rounded-3xl p-8 border border-theme-base/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-theme-primary">Fulfill Request</h2>
          <button onClick={onClose} className="text-theme-secondary hover:text-theme-primary">✕</button>
        </div>

        <div className="mb-6">
          <p className="text-theme-secondary mb-2">
            <strong>Product:</strong> {product.title}
          </p>
          <p className="text-theme-secondary mb-2">
            <strong>Requested:</strong> {request.quantityRequested} | <strong>Fulfilled:</strong> {request.quantityFulfilled || 0} | <strong>Remaining:</strong> {request.remainingQuantity}
          </p>
          {request.notes && (
            <p className="text-theme-secondary">
              <strong>Notes:</strong> {request.notes}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-theme-primary">Upload Mode</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="manual"
                  checked={mode === 'manual'}
                  onChange={(e) => setMode(e.target.value)}
                />
                <span>Manual Entry</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="csv"
                  checked={mode === 'csv'}
                  onChange={(e) => setMode(e.target.value)}
                />
                <span>CSV Upload</span>
              </label>
            </div>
          </div>

          {mode === 'manual' && product.serviceType === 'account_share' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Account Email</label>
                <input
                  type="email"
                  value={formData.accountEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountEmail: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Account Password</label>
                <input
                  type="password"
                  value={formData.accountPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountPassword: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-theme-primary">Profiles</label>
                  <button type="button" onClick={addProfile} className="text-brand-primary text-sm">
                    + Add Profile
                  </button>
                </div>
                {formData.profiles.map((profile, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={profile.profileName}
                      onChange={(e) => updateProfile(index, 'profileName', e.target.value)}
                      placeholder="Profile name"
                      required
                      className="flex-1 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
                    />
                    <input
                      type="text"
                      value={profile.pin}
                      onChange={(e) => updateProfile(index, 'pin', e.target.value)}
                      placeholder={product.provider === 'netflix' ? 'PIN (required)' : 'PIN (optional)'}
                      required={product.provider === 'netflix'}
                      className="w-24 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'csv' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-theme-primary">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                required
                className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
              />
              <p className="text-xs text-theme-secondary mt-2">
                CSV format: accountEmail, accountPassword, profile1Name, profile1Pin, profile2Name, profile2Pin, ...
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Credentials'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-theme-base rounded-lg hover:bg-theme-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRequests;

