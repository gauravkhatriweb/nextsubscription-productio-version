/**
 * Vendor Create Component
 * 
 * Form for creating new vendor accounts.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import { CURRENCIES, COUNTRIES } from '../../../utils/constants';

const VendorCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vendorPassword, setVendorPassword] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    displayName: '',
    primaryEmail: '',
    contactPhone: '',
    country: '',
    currency: 'USD',
    status: 'pending',
    notes: '',
    sendEmail: true
  });

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.primaryEmail) {
      toast.error('Company name and email are required');
      return;
    }

    if (!validateEmail(formData.primaryEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/vendor`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Vendor created successfully!');
        if (response.data.data.temporaryPassword) {
          setVendorPassword(response.data.data.temporaryPassword);
        }
        if (!response.data.data.temporaryPassword) {
          navigate('/admin/vendor');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create vendor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout currentPage="vendor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/vendor')}
            className="text-theme-secondary hover:text-theme-primary transition-colors"
          >
            ← Back to vendor
          </button>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Create Vendor
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Acme"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                name="primaryEmail"
                value={formData.primaryEmail}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="vendor@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select Country</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Initial Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Internal Notes <span className="text-theme-subtle text-xs">(Admin only, not sent to vendor)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Internal notes about this vendor (not visible to vendor)..."
            />
          </div>

          {/* Notification Options */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Send Credentials Via
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-theme-primary">📧 Send Email</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Vendor'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/vendor')}
              className="px-8 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Password Display */}
          {vendorPassword && (
            <div className="mt-6 p-6 bg-warning/10 border-2 border-warning/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  🔑 Vendor Password
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(vendorPassword);
                    toast.success('Password copied!');
                  }}
                  className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                >
                  📋 Copy
                </button>
              </div>
              <div className="bg-black/30 rounded-lg p-4 mb-3">
                <code className="text-2xl font-mono font-bold text-theme-primary tracking-wider">
                  {vendorPassword}
                </code>
              </div>
              <p className="text-xs text-theme-secondary mb-4">
                ⚠️ This is the permanent password for this vendor. Save it securely.
              </p>
            </div>
          )}

          {/* WhatsApp Message Removed: Manual templates used in vendor List / Detail */}
        </form>
      </div>
    </AdminLayout>
  );
};

export default VendorCreate;

