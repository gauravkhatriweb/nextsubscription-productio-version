/**
 * Branding Settings Page
 * 
 * Handles logo, favicon, and site name configuration.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import LogoUpload from './LogoUpload';
import FaviconUpload from './FaviconUpload';

const BrandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  // ROUTE-FIX: Debug logging for route tracking
  useEffect(() => {
    console.log('[DEBUG] BrandingPage - Active path:', location.pathname);
    console.log('[DEBUG] BrandingPage - Component mounted');
  }, [location.pathname]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/admin/settings`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = (updatedSettings) => {
    setSettings(prev => ({ ...prev, ...updatedSettings }));
  };

  const handlePreviewChange = (previewSettings) => {
    setSettings(prev => {
      if (!prev) return previewSettings;
      return { ...prev, ...previewSettings };
    });
  };

  if (loading) {
    return (
      <AdminLayout currentPage="settings">
        <div className="glass-card rounded-3xl p-8 border border-theme-base/30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-theme-secondary">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="glass-card rounded-3xl p-4 sm:p-6 lg:p-8 border border-theme-base/30">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          🎨 Branding Settings
        </h2>
        <p className="text-sm text-theme-secondary mb-6">
          Update your brand visuals and identity. Upload optimized assets for best results.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30 h-full">
            <LogoUpload
              currentLogo={settings?.logoUrl}
              onUpdate={handleSettingsUpdate}
            />
          </div>
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30 h-full">
            <FaviconUpload
              currentFavicon={settings?.faviconUrl}
              onUpdate={handleSettingsUpdate}
            />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 border border-theme-base/30 mt-6">
          <label className="block text-sm font-medium mb-2 text-theme-primary">Site Name</label>
          <input
            type="text"
            value={settings?.siteName || ''}
            onChange={(e) => {
              const newSiteName = e.target.value;
              setSettings(prev => ({ ...prev, siteName: newSiteName }));
              handlePreviewChange({ siteName: newSiteName });
            }}
            className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Next Subscription"
          />
          <p className="text-xs text-theme-secondary mt-1">
            Changes update the preview instantly. Publish to make them live.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BrandingPage;

