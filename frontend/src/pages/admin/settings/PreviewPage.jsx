/**
 * Settings Preview Page
 * 
 * Shows live preview of all settings changes before publishing.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import SettingsPreview from './SettingsPreview';

const PreviewPage = () => {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  // ROUTE-FIX: Debug logging for route tracking
  useEffect(() => {
    console.log('[DEBUG] PreviewPage - Active path:', location.pathname);
    console.log('[DEBUG] PreviewPage - Component mounted');
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
        <SettingsPreview 
          settings={settings} 
          onApplyAll={fetchSettings}
        />
      </div>
    </AdminLayout>
  );
};

export default PreviewPage;

