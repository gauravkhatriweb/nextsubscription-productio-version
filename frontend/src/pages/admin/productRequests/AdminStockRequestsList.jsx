/**
 * Admin Stock Requests List
 * 
 * Admin page to view and manage stock requests sent to vendors.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';

const AdminStockRequestsList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    fulfilled: 0,
    partially_fulfilled: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [vendors, setVendors] = useState([]);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchRequests();
    fetchVendors();
  }, [statusFilter, vendorFilter]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/admin/vendors`, {
        withCredentials: true
      });
      if (response.data.success) {
        setVendors(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (vendorFilter !== 'all') {
        // Fetch for specific vendor
        const response = await axios.get(`${apiBase}/api/admin/vendors/${vendorFilter}/requests`, {
          params,
          withCredentials: true
        });
        if (response.data.success) {
          setRequests(response.data.requests);
          setStats({
            total: response.data.total,
            requested: response.data.requested || 0,
            fulfilled: response.data.fulfilled || 0,
            partially_fulfilled: response.data.partially_fulfilled || 0
          });
        }
      } else {
        // Fetch all requests
        const response = await axios.get(`${apiBase}/api/admin/stock-requests`, {
          params,
          withCredentials: true
        });
        if (response.data.success) {
          setRequests(response.data.requests);
          setStats({
            total: response.data.total,
            requested: response.data.requested || 0,
            fulfilled: response.data.fulfilled || 0,
            partially_fulfilled: response.data.partially_fulfilled || 0
          });
        }
      }
    } catch (error) {
      toast.error('Failed to load stock requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestCredentials = async (requestId) => {
    try {
      const response = await axios.get(`${apiBase}/api/admin/product-requests/${requestId}/credentials`, {
        withCredentials: true
      });
      if (response.data.success) {
        setCredentials(response.data.credentials);
        setSelectedRequest(response.data.request);
      }
    } catch (error) {
      toast.error('Failed to load credentials');
    }
  };

  const handleDecrypt = async (credentialId) => {
    try {
      const response = await axios.get(
        `${apiBase}/api/admin/product-requests/${selectedRequest._id}/credentials/${credentialId}/decrypt`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setDecryptedData(response.data.credential);
        setSelectedCredential(credentialId);
      }
    } catch (error) {
      toast.error('Failed to decrypt credential');
    }
  };

  const handleApprove = async (credentialId) => {
    if (!window.confirm('Approve this credential and add it to product stock?')) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiBase}/api/admin/product-requests/${selectedRequest._id}/credentials/${credentialId}/approve`,
        { comment: 'Approved by admin' },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Credential approved successfully');
        fetchRequestCredentials(selectedRequest._id);
        setDecryptedData(null);
      }
    } catch (error) {
      toast.error('Failed to approve credential');
    }
  };

  const handleReject = async (credentialId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim().length === 0) {
      return;
    }

    try {
      const response = await axios.post(
        `${apiBase}/api/admin/product-requests/${selectedRequest._id}/credentials/${credentialId}/reject`,
        { reason: reason.trim() },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Credential rejected successfully');
        fetchRequestCredentials(selectedRequest._id);
        setDecryptedData(null);
      }
    } catch (error) {
      toast.error('Failed to reject credential');
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
      <AdminLayout>
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading requests...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Admin Stock Requests
          </h1>
          <p className="text-theme-secondary">View and manage stock requests sent to vendors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-theme-base/30">
            <div className="text-2xl font-bold text-theme-primary">{stats.total}</div>
            <div className="text-sm text-theme-secondary">Total</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-warning/30 bg-warning/5">
            <div className="text-2xl font-bold text-warning">{stats.requested}</div>
            <div className="text-sm text-theme-secondary">Pending</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-brand-primary/30 bg-brand-primary/5">
            <div className="text-2xl font-bold text-brand-primary">{stats.partially_fulfilled}</div>
            <div className="text-sm text-theme-secondary">Partially Fulfilled</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-success/30 bg-success/5">
            <div className="text-2xl font-bold text-success">{stats.fulfilled}</div>
            <div className="text-sm text-theme-secondary">Fulfilled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 border border-theme-base/30 flex gap-4">
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
          >
            <option value="all">All Vendors</option>
            {vendors.map(vendor => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.displayName || vendor.companyName}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
          >
            <option value="all">All Status</option>
            <option value="requested">Pending</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-theme-secondary">No stock requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-base/30">
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Request ID</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Vendor</th>
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
                        {request.vendorId?.displayName || request.vendorId?.companyName || 'N/A'}
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
                        <button
                          onClick={() => {
                            fetchRequestCredentials(request._id);
                            setSelectedRequest(request);
                          }}
                          className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium"
                        >
                          View Credentials
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Credentials Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => {
          setSelectedRequest(null);
          setCredentials([]);
          setDecryptedData(null);
          setSelectedCredential(null);
        }}>
          <div className="glass-card rounded-3xl p-8 border border-theme-base/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-theme-primary">Credentials for Request #{selectedRequest._id.toString().slice(-8)}</h2>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setCredentials([]);
                  setDecryptedData(null);
                  setSelectedCredential(null);
                }}
                className="text-theme-secondary hover:text-theme-primary"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <p className="text-theme-secondary">
                <strong>Product:</strong> {selectedRequest.productId?.title || 'N/A'}
              </p>
              <p className="text-theme-secondary">
                <strong>Requested:</strong> {selectedRequest.quantityRequested} | <strong>Fulfilled:</strong> {selectedRequest.quantityFulfilled || 0}
              </p>
            </div>

            {credentials.length === 0 ? (
              <p className="text-theme-secondary text-center py-8">No credentials uploaded yet</p>
            ) : (
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div key={credential._id} className="border border-theme-base/30 rounded-xl p-4 bg-theme-surface">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-theme-primary font-semibold">
                          Batch #{credential.batchNumber} - {credential.credentialType}
                        </p>
                        <p className="text-sm text-theme-secondary">
                          Total: {credential.totalCount} | Available: {credential.availableCount} | Assigned: {credential.assignedCount}
                        </p>
                        {credential.accountEmail && (
                          <p className="text-sm text-theme-secondary">Account: {credential.accountEmail}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDecrypt(credential._id)}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors text-sm"
                        >
                          Decrypt
                        </button>
                        <button
                          onClick={() => handleApprove(credential._id)}
                          className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/80 transition-colors text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(credential._id)}
                          className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/80 transition-colors text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {selectedCredential === credential._id && decryptedData && (
                      <div className="mt-4 p-4 bg-theme-base rounded-lg border border-brand-primary/30">
                        <h4 className="font-semibold text-theme-primary mb-2">Decrypted Credentials:</h4>
                        <pre className="text-sm text-theme-primary bg-theme-surface p-3 rounded overflow-x-auto">
                          {JSON.stringify(decryptedData.decryptedData, null, 2)}
                        </pre>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(decryptedData.decryptedData, null, 2));
                              toast.success('Copied to clipboard!');
                            }}
                            className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:bg-brand-primary-hover"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {credential.profiles && credential.profiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-theme-primary mb-2">Profiles:</p>
                        <div className="space-y-1">
                          {credential.profiles.map((profile, idx) => (
                            <div key={idx} className="text-sm text-theme-secondary">
                              {profile.profileName} {profile.isAssigned ? '(Assigned)' : '(Available)'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminStockRequestsList;

