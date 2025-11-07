/**
 * Admin Layout Component
 * 
 * Shared layout for all admin pages with sidebar navigation, profile, and logout.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import devImage from '../assets/personal/dev_image.png';

const AdminLayout = ({ children, currentPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleLogout = async () => {
    try {
      // Clear admin token cookie by calling logout endpoint or clearing cookie
      await axios.post(
        `${apiBase}/api/admin/logout`,
        {},
        { withCredentials: true }
      ).catch(() => {
        // If endpoint doesn't exist, just clear cookie client-side
      });
      
      // Clear any client-side tokens
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      toast.success('Logged out successfully');
      navigate('/admin');
    } catch (error) {
      // Force logout even if API fails
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      navigate('/admin');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' },
    { id: 'monitoring', label: 'System Monitoring', icon: '🛰️', path: '/admin/monitoring' },
    { id: 'vendors', label: 'Vendors', icon: '🏢', path: '/admin/vendors' }
  ];

  const isActive = (item) => {
    if (item.id === 'dashboard' && location.pathname === '/admin/dashboard') return true;
    if (item.id === 'settings' && location.pathname.startsWith('/admin/settings')) return true;
    if (item.id === 'monitoring' && location.pathname.startsWith('/admin/monitoring')) return true;
    if (item.id === 'vendors' && location.pathname.startsWith('/admin/vendors')) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary">
      {/* Top Header Bar */}
      <header className="border-b border-theme-base/30 bg-theme-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Admin Panel
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Profile Picture & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={devImage}
                    alt="Admin Profile"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-brand-primary object-cover"
                  />
                  <span className="text-theme-primary font-medium hidden sm:block">Admin</span>
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-2 shadow-lg z-50 border border-theme-base/30">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-theme-surface/50 text-theme-primary transition-colors flex items-center gap-2"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar Navigation - Mobile: Horizontal Scroll, Desktop: Vertical */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="glass-card rounded-2xl p-2 sm:p-4 space-y-2 lg:sticky lg:top-24 border border-theme-base/30">
              {/* Mobile: Horizontal Scroll */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all ${
                      isActive(item)
                        ? 'bg-brand-primary text-black shadow-lg font-semibold'
                        : 'text-theme-primary bg-theme-surface/30 hover:bg-theme-surface/50 border border-theme-base/30'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

