/**
 * Reports & Payouts
 * 
 * View sales reports, earnings, and payout information.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [payouts, setPayouts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchReports();
  }, [range]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, payoutsRes] = await Promise.all([
        axios.get(`${apiBase}/api/vendor/reports/sales`, {
          withCredentials: true,
          params: { range }
        }),
        axios.get(`${apiBase}/api/vendor/reports/payouts`, {
          withCredentials: true
        })
      ]);

      if (salesRes.data.success) {
        setReport(salesRes.data.report);
      }
      if (payoutsRes.data.success) {
        setPayouts(payoutsRes.data.payouts);
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <VendorLayout currentPage="reports">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading reports...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout currentPage="reports">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Reports & Payouts
            </h1>
            <p className="text-theme-secondary">View sales analytics and earnings</p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="365d">Last Year</option>
          </select>
        </div>

        {/* Sales Summary */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-theme-primary mb-1">${report.totalSales.toFixed(2)}</div>
              <div className="text-sm text-theme-secondary">Total Sales</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-theme-primary mb-1">{report.totalOrders}</div>
              <div className="text-sm text-theme-secondary">Total Orders</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
              <div className="text-3xl mb-2">💸</div>
              <div className="text-2xl font-bold text-theme-primary mb-1">${report.platformFee.toFixed(2)}</div>
              <div className="text-sm text-theme-secondary">Platform Fee</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
              <div className="text-3xl mb-2">💵</div>
              <div className="text-2xl font-bold text-success mb-1">${report.netPayout.toFixed(2)}</div>
              <div className="text-sm text-theme-secondary">Net Payout</div>
            </div>
          </div>
        )}

        {/* Payouts Info */}
        {payouts && (
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-2xl font-bold mb-4 text-theme-primary">Payout Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-theme-secondary mb-1">Total Earnings</div>
                <div className="text-2xl font-bold text-theme-primary">${payouts.totalEarnings.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-theme-secondary mb-1">Platform Fees</div>
                <div className="text-2xl font-bold text-theme-primary">${payouts.platformFees.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-theme-secondary mb-1">Total Payouts</div>
                <div className="text-2xl font-bold text-success">${payouts.totalPayouts.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-theme-secondary mb-1">Payout Schedule</div>
                <div className="text-lg font-semibold text-theme-primary capitalize">{payouts.payoutSchedule}</div>
              </div>
            </div>
          </div>
        )}

        {/* Product Sales */}
        {report && report.productSales && report.productSales.length > 0 && (
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-2xl font-bold mb-4 text-theme-primary">Product Sales</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-theme-surface/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-theme-primary">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-theme-primary">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-theme-primary">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.productSales.map((item, idx) => (
                    <tr key={idx} className="border-t border-theme-base">
                      <td className="px-4 py-3 text-theme-primary">{item.product}</td>
                      <td className="px-4 py-3 text-theme-primary">{item.quantity}</td>
                      <td className="px-4 py-3 text-theme-primary font-semibold">${item.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default Reports;

