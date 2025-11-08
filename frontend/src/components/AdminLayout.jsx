/**
 * Admin Layout Component
 * 
 * Shared layout for all admin pages with sidebar navigation, profile, and logout.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import devImage from '../assets/personal/dev_image.png';

const AdminLayout = ({ children, currentPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // NAV: Settings sub-tabs expanded state (auto-expand if on settings page)
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  // ROUTE-FIX: Debug logging for route tracking
  useEffect(() => {
    console.log('[DEBUG] AdminLayout - Active path:', location.pathname);
    console.log('[DEBUG] AdminLayout - Settings expanded:', settingsExpanded);
  }, [location.pathname, settingsExpanded]);

  // NAV: Auto-expand settings if on settings page
  // FIX: Ensure settings sub-tabs are expanded when on any settings route
  useEffect(() => {
    if (location.pathname.startsWith('/admin/settings')) {
      setSettingsExpanded(true);
    } else {
      // Collapse when navigating away from settings
      setSettingsExpanded(false);
    }
  }, [location.pathname]);

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
      sessionStorage.removeItem('adminToken'); // FIX: Ensure admin session is fully cleared
      
      toast.success('Logged out successfully');
      navigate('/admin');
    } catch (error) {
      // Force logout even if API fails
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      sessionStorage.removeItem('adminToken');
      navigate('/admin');
    }
  };

  // NAV: Main menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/admin/dashboard' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings', hasSubItems: true },
    { id: 'monitoring', label: 'System Monitoring', icon: '🛰️', path: '/admin/monitoring' },
    { id: 'vendors', label: 'Vendors', icon: '🏢', path: '/admin/vendors' }
  ];

  // NAV: Settings sub-tabs
  const settingsSubTabs = [
    { id: 'branding', label: 'Branding', icon: '🎨', path: '/admin/settings/branding' },
    { id: 'content', label: 'Content', icon: '📝', path: '/admin/settings/content' },
    { id: 'theme', label: 'Theme', icon: '🎨', path: '/admin/settings/theme' },
    { id: 'preview', label: 'Preview', icon: '👁️', path: '/admin/settings/preview' }
  ];

  // NAV: Check if main tab is active
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
          {/* NAV: Mobile Hamburger Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed top-20 left-4 z-40 glass-card p-3 rounded-xl border border-theme-base/30 hover:bg-theme-surface/50 transition-all shadow-lg"
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            <svg className="w-6 h-6 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* NAV: Sidebar Navigation - Collapsible on mobile, always visible on desktop */}
          <aside className={`
            w-64 lg:w-64 flex-shrink-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:relative top-0 left-0 h-full lg:h-auto z-30 lg:z-auto
            bg-theme-base/95 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none
            transition-transform duration-300 ease-in-out
            pt-20 lg:pt-0
          `}>
            <nav className="glass-card rounded-2xl p-2 sm:p-4 space-y-2 lg:sticky lg:top-24 border border-theme-base/30 h-full lg:h-auto overflow-y-auto lg:overflow-y-visible">
              {/* NAV: Main Menu Items */}
              <div className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <div key={item.id}>
                    {/* NAV: Main Tab Button */}
                    <button
                      onClick={() => {
                        if (item.hasSubItems) {
                          // FIX: Toggle settings sub-tabs without forcing navigation if already on settings page
                          if (!settingsExpanded) {
                            setSettingsExpanded(true);
                            // Only navigate if not already on a settings sub-page
                            if (!location.pathname.startsWith('/admin/settings/')) {
                              navigate('/admin/settings/branding');
                            }
                          } else {
                            setSettingsExpanded(!settingsExpanded);
                          }
                        } else {
                          // Navigate to page and close mobile sidebar
                          navigate(item.path);
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all flex items-center justify-between ${
                        isActive(item)
                          ? 'bg-brand-primary text-black shadow-lg font-semibold'
                          : 'text-theme-primary bg-theme-surface/30 hover:bg-theme-surface/50 border border-theme-base/30'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{item.icon}</span>
                        <span className="text-sm sm:text-base">{item.label}</span>
                      </div>
                      {/* NAV: Chevron for Settings */}
                      {item.hasSubItems && (
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            settingsExpanded ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>

                    {/* NAV: Settings Sub-tabs (Nested) */}
                    {item.hasSubItems && item.id === 'settings' && settingsExpanded && (
                      <div className="mt-1 ml-4 sm:ml-6 space-y-1 border-l-2 border-theme-base/20 pl-2 sm:pl-3">
                        {settingsSubTabs.map((subTab) => {
                          // ROUTE-FIX: Use location.pathname for active state - more reliable than isActive prop
                          // Also handle exact match and redirect case
                          const isSubTabActive = location.pathname === subTab.path || 
                                                 (subTab.path === '/admin/settings/branding' && location.pathname === '/admin/settings');
                          
                          // ROUTE-FIX: Debug log active state
                          if (isSubTabActive) {
                            console.log('[DEBUG] AdminLayout - Active subtab:', subTab.id, 'Path:', location.pathname);
                          }
                          
                          return (
                            <NavLink
                              key={subTab.id}
                              to={subTab.path}
                              onClick={() => {
                                console.log('[DEBUG] AdminLayout - Clicked subtab:', subTab.id, 'Navigating to:', subTab.path);
                                setSidebarOpen(false);
                              }}
                              className={`
                                block w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-all text-sm
                                ${isSubTabActive
                                  ? 'bg-brand-primary/20 text-brand-primary font-semibold border-l-2 border-brand-primary -ml-2 sm:-ml-3 pl-4 sm:pl-5'
                                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-surface/30'
                                }
                              `}
                            >
                              <span className="mr-2 text-xs">{subTab.icon}</span>
                              <span>{subTab.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </aside>

          {/* NAV: Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

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

