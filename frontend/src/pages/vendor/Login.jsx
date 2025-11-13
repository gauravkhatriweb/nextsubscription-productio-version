/**
 * Vendor Login Page
 * 
 * Login page for vendor to access their portal.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const VendorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiBase}/api/vendor/login`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Login successful!');
        // CLEANUP: Removed setup redirect - vendor go directly to dashboard
        navigate('/vendor/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 border border-theme-base/30">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Vendor Portal
            </h1>
            <p className="text-theme-secondary">
              Sign in to manage your products and orders
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-theme-primary">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="vendor@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-theme-primary">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorLogin;

