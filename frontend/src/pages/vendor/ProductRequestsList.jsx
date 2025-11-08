/**
 * Product Requests List
 * 
 * Shows vendor's submitted product requests and their status.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';

const ProductRequestsList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/vendor/products/requests`, {
        withCredentials: true
      });
      if (response.data.success) {
        setRequests(response.data.requests);
        setStats({
          total: response.data.total,
          pending: response.data.pending,
          approved: response.data.approved,
          rejected: response.data.rejected
        });
      }
    } catch (error) {
      toast.error('Failed to load product requests');
    } finally {
      setLoading(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              My Product Requests
            </h1>
            <p className="text-theme-secondary">View and track your submitted product proposals</p>
          </div>
          <button
            onClick={() => navigate('/vendor/products/requests/new')}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg"
          >
            + New Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-theme-base/30">
            <div className="text-2xl font-bold text-theme-primary">{stats.total}</div>
            <div className="text-sm text-theme-secondary">Total Requests</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-warning/30 bg-warning/5">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-theme-secondary">Pending Review</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-success/30 bg-success/5">
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
            <div className="text-sm text-theme-secondary">Approved</div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-error/30 bg-error/5">
            <div className="text-2xl font-bold text-error">{stats.rejected}</div>
            <div className="text-sm text-theme-secondary">Rejected</div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-theme-secondary mb-4">No product requests yet</p>
              <button
                onClick={() => navigate('/vendor/products/requests/new')}
                className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors"
              >
                Submit Your First Request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-base/30">
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Title</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Provider</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Plans</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Stock</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Submitted</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-theme-primary font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id} className="border-b border-theme-base/10 hover:bg-theme-surface/50">
                      <td className="py-3 px-4 text-theme-primary">{request.title}</td>
                      <td className="py-3 px-4 text-theme-secondary capitalize">{request.provider}</td>
                      <td className="py-3 px-4 text-theme-secondary">
                        {request.plans.length} plan(s)
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
                          onClick={() => navigate(`/vendor/products/requests/${request._id}`)}
                          className="text-brand-primary hover:text-brand-primary-hover text-sm font-medium"
                        >
                          View
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
    </VendorLayout>
  );
};

export default ProductRequestsList;

