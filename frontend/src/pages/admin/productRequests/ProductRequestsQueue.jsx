/**
 * Product Requests Queue
 * 
 * Admin queue for reviewing vendor product requests.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';

const ProductRequestsQueue = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    changesRequested: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, action: null, request: null });
  const [comment, setComment] = useState('');

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(`${apiBase}/api/admin/product-requests`, {
        params,
        withCredentials: true
      });

      if (response.data.success) {
        setRequests(response.data.requests);
        setStats({
          total: response.data.total,
          pending: response.data.pending,
          approved: response.data.approved,
          rejected: response.data.rejected,
          changesRequested: response.data.changesRequested
        });
      }
    } catch (error) {
      toast.error('Failed to load product requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestDetails = async (id) => {
    try {
      const response = await axios.get(`${apiBase}/api/admin/product-requests/${id}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setSelectedRequest(response.data);
      }
    } catch (error) {
      toast.error('Failed to load request details');
    }
  };

  const handleAction = async (action, requestId) => {
    if (action === 'approve' || action === 'reject' || action === 'request-changes') {
      if (!comment.trim() && action !== 'approve') {
        toast.error('Comment is required for this action');
        return;
      }
    }

    try {
      let endpoint = '';
      if (action === 'approve') {
        endpoint = `${apiBase}/api/admin/product-requests/${requestId}/approve`;
      } else if (action === 'reject') {
        endpoint = `${apiBase}/api/admin/product-requests/${requestId}/reject`;
      } else if (action === 'request-changes') {
        endpoint = `${apiBase}/api/admin/product-requests/${requestId}/request-changes`;
      }

      const response = await axios.post(
        endpoint,
        { comment: comment.trim() || null },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(`Request ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes requested'} successfully`);
        setActionModal({ open: false, action: null, request: null });
        setComment('');
        fetchRequests();
        if (selectedRequest && selectedRequest.request._id === requestId) {
          fetchRequestDetails(requestId);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_review: 'bg-warning/20 text-warning border-warning/30',
      approved: 'bg-success/20 text-success border-success/30',
      rejected: 'bg-error/20 text-error border-error/30',
      changes_requested: 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'
    };
    return badges[status] || 'bg-theme-subtle/20 text-theme-subtle border-theme-subtle/30';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_review: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      changes_requested: 'Changes Requested'
    };
    return labels[status] || status;
  };

  const filteredRequests = requests.filter(req => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      req.title?.toLowerCase().includes(searchLower) ||
      req.provider?.toLowerCase().includes(searchLower) ||
      req.vendorId?.companyName?.toLowerCase().includes(searchLower) ||
      req.vendorId?.displayName?.toLowerCase().includes(searchLower)
    );
  });

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
            Product Requests Queue
          </h1>
          <p className="text-theme-secondary">Review and manage vendor product proposals</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-theme-base/30">
            <div className="text-2xl font-bold text-theme-primary">{stats.total}</div>
            <div className="text-sm text-theme-secondary">Total</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-warning/30 bg-warning/5">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-theme-secondary">Pending</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-success/30 bg-success/5">
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
            <div className="text-sm text-theme-secondary">Approved</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-error/30 bg-error/5">
            <div className="text-2xl font-bold text-error">{stats.rejected}</div>
            <div className="text-sm text-theme-secondary">Rejected</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-brand-primary/30 bg-brand-primary/5">
            <div className="text-2xl font-bold text-brand-primary">{stats.changesRequested}</div>
            <div className="text-sm text-theme-secondary">Changes Requested</div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 border border-theme-base/30 flex gap-4">
          <input
            type="text"
            placeholder="Search by title, provider, or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary placeholder:text-theme-subtle"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
          >
            <option value="all">All Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="changes_requested">Changes Requested</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-theme-secondary">No product requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-base/30">
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Vendor</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Product Title</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Provider</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Plans</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Stock</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Submitted</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="border-b border-theme-base/10 hover:bg-theme-surface/50">
                      <td className="py-3 px-4 text-theme-primary">
                        {request.vendorId?.displayName || request.vendorId?.companyName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-theme-primary">{request.title}</td>
                      <td className="py-3 px-4 text-theme-secondary capitalize">{request.provider}</td>
                      <td className="py-3 px-4 text-theme-secondary">
                        {request.plans?.length || 0} plan(s)
                      </td>
                      <td className="py-3 px-4 text-theme-secondary">{request.stock}</td>
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
                            fetchRequestDetails(request._id);
                            setSelectedRequest({ request, auditLog: [] });
                          }}
                          className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium mr-3"
                        >
                          View
                        </button>
                        {request.status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => setActionModal({ open: true, action: 'approve', request })}
                              className="text-success hover:text-success/80 text-sm font-medium mr-3"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setActionModal({ open: true, action: 'reject', request })}
                              className="text-error hover:text-error/80 text-sm font-medium mr-3"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setActionModal({ open: true, action: 'request-changes', request })}
                              className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium"
                            >
                              Request Changes
                            </button>
                          </>
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

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
          <div className="glass-card rounded-3xl p-8 border border-theme-base/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-theme-primary">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-theme-secondary hover:text-theme-primary"
              >
                ✕
              </button>
            </div>

            {selectedRequest.request && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Vendor</label>
                    <p className="text-theme-primary">{selectedRequest.request.vendorId?.displayName || selectedRequest.request.vendorId?.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Status</label>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedRequest.request.status)}`}>
                        {getStatusLabel(selectedRequest.request.status)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Title</label>
                    <p className="text-theme-primary">{selectedRequest.request.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Provider</label>
                    <p className="text-theme-primary capitalize">{selectedRequest.request.provider}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Service Type</label>
                    <p className="text-theme-primary capitalize">{selectedRequest.request.serviceType?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Stock</label>
                    <p className="text-theme-primary">{selectedRequest.request.stock}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-theme-secondary">Plans</label>
                  <div className="mt-2 space-y-2">
                    {selectedRequest.request.plans?.map((plan, idx) => (
                      <div key={idx} className="p-3 bg-theme-surface rounded-lg border border-theme-base/30">
                        <p className="text-theme-primary">
                          {plan.durationDays} days - {plan.currency} {plan.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedRequest.request.description && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Description</label>
                    <p className="text-theme-primary mt-1">{selectedRequest.request.description}</p>
                  </div>
                )}

                {selectedRequest.request.replacementPolicy && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Replacement Policy</label>
                    <p className="text-theme-primary mt-1">{selectedRequest.request.replacementPolicy}</p>
                  </div>
                )}

                {selectedRequest.request.rules && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Rules</label>
                    <p className="text-theme-primary mt-1">{selectedRequest.request.rules}</p>
                  </div>
                )}

                {selectedRequest.request.adminComment && (
                  <div>
                    <label className="text-sm font-medium text-theme-secondary">Admin Comment</label>
                    <p className="text-theme-primary mt-1">{selectedRequest.request.adminComment}</p>
                  </div>
                )}

                {selectedRequest.request.status === 'pending_review' && (
                  <div className="flex gap-3 pt-4 border-t border-theme-base/30">
                    <button
                      onClick={() => handleAction('approve', selectedRequest.request._id)}
                      className="px-6 py-2 bg-success text-white rounded-lg hover:bg-success/80 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setActionModal({ open: true, action: 'reject', request: selectedRequest.request })}
                      className="px-6 py-2 bg-error text-white rounded-lg hover:bg-error/80 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setActionModal({ open: true, action: 'request-changes', request: selectedRequest.request })}
                      className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                    >
                      Request Changes
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setActionModal({ open: false, action: null, request: null })}>
          <div className="glass-card rounded-3xl p-8 border border-theme-base/30 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-theme-primary mb-4">
              {actionModal.action === 'approve' ? 'Approve Request' : actionModal.action === 'reject' ? 'Reject Request' : 'Request Changes'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">
                  Comment {actionModal.action !== 'approve' && <span className="text-error">*</span>}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required={actionModal.action !== 'approve'}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  placeholder={actionModal.action === 'approve' ? 'Optional comment...' : 'Required reason...'}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(actionModal.action, actionModal.request._id)}
                  className="flex-1 px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setActionModal({ open: false, action: null, request: null });
                    setComment('');
                  }}
                  className="flex-1 px-6 py-2 border border-theme-base rounded-lg hover:bg-theme-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductRequestsQueue;

