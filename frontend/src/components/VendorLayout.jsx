/**
 * Vendor Layout Component
 * 
 * Shared layout for vendor portal pages with navigation sidebar.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const VendorLayout = ({ children, currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vendorInfo, setVendorInfo] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    const fetchVendorInfo = async () => {
      try {
        const response = await axios.get(`${apiBase}/api/vendor/me`, {
          withCredentials: true,
        });
        if (response.data.success) {
          setVendorInfo(response.data.vendor);
        }
      } catch (error) {
        console.error('Failed to fetch vendor info:', error);
        navigate('/vendor/login');
      }
    };
    fetchVendorInfo();
  }, [navigate, apiBase]);

  const handleLogout = async () => {
    try {
      await axios.post(`${apiBase}/api/vendor/logout`, {}, { withCredentials: true });
      toast.success('Logged out successfully!');
      document.cookie = 'vendorToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      navigate('/vendor/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/vendor/dashboard' },
    { id: 'products', label: 'Products', icon: '📦', path: '/vendor/products' },
    { id: 'requests', label: 'Admin Requests', icon: '📥', path: '/vendor/requests' },
    { id: 'orders', label: 'Orders', icon: '📋', path: '/vendor/orders' },
    { id: 'team', label: 'Loaders & Team', icon: '👥', path: '/vendor/team' },
    { id: 'policies', label: 'Policies', icon: '📜', path: '/vendor/policies' },
    { id: 'reports', label: 'Reports', icon: '📊', path: '/vendor/reports' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/vendor/settings' },
    { id: 'support', label: 'Support', icon: '💬', path: '/vendor/support' }
  ];

  const isActive = (item) => {
    if (item.id === 'dashboard' && location.pathname === '/vendor/dashboard') return true;
    if (item.id !== 'dashboard' && location.pathname.startsWith(item.path)) return true;
    return false;
  };

  const getStatusMessage = (status) => {
    const messages = {
      pending: {
        text: 'Your account is under review. Please contact the admin at 📧 gauravkhatriweb@gmail.com.',
        color: 'bg-warning/10 border-warning/30 text-warning'
      },
      active: {
        text: 'Your account is active. You can access your dashboard and manage your subscriptions.',
        color: 'bg-success/10 border-success/30 text-success'
      },
      suspended: {
        text: 'Your account has been suspended. Please contact the admin (📧 gauravkhatriweb@gmail.com) for details.',
        color: 'bg-error/10 border-error/30 text-error'
      },
      rejected: {
        text: 'Your account request was rejected. Please contact the admin for clarification.',
        color: 'bg-error/10 border-error/30 text-error'
      }
    };
    return messages[status] || messages.pending;
  };

  const statusMessage = vendorInfo?.status ? getStatusMessage(vendorInfo.status) : null;

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary">
      {/* Status Message Banner */}
      {statusMessage && vendorInfo?.status !== 'active' && (
        <div className={`border-b ${statusMessage.color} py-3`}>
          <div className="container mx-auto px-6">
            <p className="text-sm font-medium text-center">{statusMessage.text}</p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="border-b border-theme-base/30 bg-theme-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {vendorInfo?.logo && (
                <img src={vendorInfo.logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-theme-base/30" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  {vendorInfo?.displayName || vendorInfo?.companyName || 'Vendor Portal'}
                </h1>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  vendorInfo?.status === 'active' ? 'bg-success/20 text-success' : 
                  vendorInfo?.status === 'pending' ? 'bg-warning/20 text-warning' :
                  vendorInfo?.status === 'suspended' ? 'bg-error/20 text-error' :
                  'bg-theme-subtle/20 text-theme-subtle'
                }`}>
                  {vendorInfo?.status || 'pending'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-theme-primary hover:text-brand-primary transition-colors focus:outline-none"
                >
                  <span className="font-medium hidden md:inline text-theme-primary">{vendorInfo?.primaryEmail || 'Vendor'}</span>
                  <svg
                    className={`w-4 h-4 transition-transform text-theme-primary ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-theme-surface rounded-lg shadow-lg py-2 z-10 glass-card border border-theme-base/30">
                    <div className="px-4 py-2 text-sm text-theme-secondary border-b border-theme-base/30">
                      Logged in as: <span className="font-semibold text-theme-primary">{vendorInfo?.primaryEmail || 'Vendor'}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-theme-primary hover:bg-theme-surface/50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0">
          <nav className="glass-card rounded-2xl p-4 space-y-2 sticky top-24 border border-theme-base/30">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                  isActive(item)
                    ? 'bg-brand-primary text-white shadow-lg'
                    : 'text-theme-secondary hover:bg-theme-surface/50 hover:text-theme-primary'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Page Specific Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;

