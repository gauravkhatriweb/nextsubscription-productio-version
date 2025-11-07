/**
 * Vendor Dashboard
 * 
 * Main dashboard for vendors showing overview stats and quick actions.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalOrders: 0,
    totalRevenue: 0,
    teamMembers: 0
  });
  const [loading, setLoading] = useState(true);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch products count
      const productsRes = await axios.get(`${apiBase}/api/vendor/products`, {
        withCredentials: true,
        params: { limit: 1 }
      });

      // Fetch orders count
      const ordersRes = await axios.get(`${apiBase}/api/vendor/orders`, {
        withCredentials: true,
        params: { limit: 1 }
      });

      // Fetch team count
      const teamRes = await axios.get(`${apiBase}/api/vendor/team`, {
        withCredentials: true
      });

      setStats({
        totalProducts: productsRes.data?.total || 0,
        activeProducts: productsRes.data?.active || 0,
        pendingOrders: ordersRes.data?.pending || 0,
        totalOrders: ordersRes.data?.total || 0,
        totalRevenue: ordersRes.data?.totalRevenue || 0,
        teamMembers: teamRes.data?.team?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <VendorLayout currentPage="dashboard">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading dashboard...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-8 border border-theme-base/30">
          <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Dashboard
          </h1>
          <p className="text-theme-secondary">
            Overview of your vendor account and operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-theme-base/30" onClick={() => navigate('/vendor/products')}>
            <div className="text-4xl mb-3">📦</div>
            <div className="text-3xl font-bold text-theme-primary mb-1">{stats.totalProducts}</div>
            <div className="text-sm text-theme-secondary">Total Products</div>
            <div className="text-xs text-theme-subtle mt-2">{stats.activeProducts} active</div>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-theme-base/30" onClick={() => navigate('/vendor/orders')}>
            <div className="text-4xl mb-3">📋</div>
            <div className="text-3xl font-bold text-theme-primary mb-1">{stats.totalOrders}</div>
            <div className="text-sm text-theme-secondary">Total Orders</div>
            <div className="text-xs text-warning mt-2">{stats.pendingOrders} pending</div>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-theme-base/30" onClick={() => navigate('/vendor/reports')}>
            <div className="text-4xl mb-3">💰</div>
            <div className="text-3xl font-bold text-theme-primary mb-1">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-theme-secondary">Total Revenue</div>
            <div className="text-xs text-theme-subtle mt-2">All time</div>
          </div>

          <div className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer border border-theme-base/30" onClick={() => navigate('/vendor/team')}>
            <div className="text-4xl mb-3">👥</div>
            <div className="text-3xl font-bold text-theme-primary mb-1">{stats.teamMembers}</div>
            <div className="text-sm text-theme-secondary">Team Members</div>
            <div className="text-xs text-theme-subtle mt-2">Loaders & support</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl p-8 border border-theme-base/30">
          <h2 className="text-2xl font-bold mb-6 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/vendor/products/create')}
              className="glass-card rounded-xl p-6 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-brand-primary/30"
            >
              <div className="text-3xl mb-3">➕</div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">Add New Product</h3>
              <p className="text-sm text-theme-secondary">Create a new product listing</p>
            </button>

            <button
              onClick={() => navigate('/vendor/orders')}
              className="glass-card rounded-xl p-6 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-brand-primary/30"
            >
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">View Orders</h3>
              <p className="text-sm text-theme-secondary">Manage and fulfill orders</p>
            </button>

            <button
              onClick={() => navigate('/vendor/team')}
              className="glass-card rounded-xl p-6 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-brand-primary/30"
            >
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">Manage Team</h3>
              <p className="text-sm text-theme-secondary">Add loaders and team members</p>
            </button>

            <button
              onClick={() => navigate('/vendor/reports')}
              className="glass-card rounded-xl p-6 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-brand-primary/30"
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-theme-primary mb-2">View Reports</h3>
              <p className="text-sm text-theme-secondary">Sales analytics and payouts</p>
            </button>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default Dashboard;

