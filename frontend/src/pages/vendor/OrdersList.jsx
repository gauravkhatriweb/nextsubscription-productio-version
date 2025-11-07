/**
 * Orders List
 * 
 * Displays vendor orders with fulfillment actions.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/api/vendor/orders`, {
        withCredentials: true,
        params: filter ? { status: filter } : {}
      });
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (orderId) => {
    try {
      const response = await axios.put(
        `${apiBase}/api/vendor/orders/${orderId}/fulfill`,
        { status: 'fulfilled' },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Order fulfilled');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to fulfill order');
    }
  };

  if (loading) {
    return (
      <VendorLayout currentPage="orders">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading orders...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout currentPage="orders">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Orders
          </h1>
          <p className="text-theme-secondary">Manage and fulfill customer orders</p>
        </div>

        {/* Filter */}
        <div className="glass-card rounded-2xl p-4 border border-theme-base/30">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="disputed">Disputed</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-theme-base/30">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-theme-surface/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-theme-primary">Order #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-theme-primary">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-theme-primary">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-theme-primary">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-theme-primary">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-theme-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-t border-theme-base hover:bg-theme-surface/30">
                    <td className="px-6 py-4 text-theme-primary font-mono text-sm">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-theme-primary">{order.customerEmail}</td>
                    <td className="px-6 py-4 text-theme-primary font-semibold">${order.totalAmount} {order.currency}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        order.status === 'fulfilled' ? 'bg-success/20 text-success' :
                        order.status === 'pending' ? 'bg-warning/20 text-warning' :
                        order.status === 'disputed' ? 'bg-error/20 text-error' :
                        'bg-theme-surface text-theme-subtle'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-theme-secondary text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleFulfill(order._id)}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-brand-primary-hover transition-colors"
                        >
                          Fulfill
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/vendor/orders/${order._id}`)}
                        className="ml-2 px-4 py-2 border border-theme-base rounded-lg text-sm font-semibold hover:bg-theme-surface transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {orders.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center border border-theme-base/30">
            <p className="text-theme-secondary">No orders found</p>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default OrdersList;

