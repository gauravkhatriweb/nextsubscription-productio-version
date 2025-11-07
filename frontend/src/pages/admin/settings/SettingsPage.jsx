/**
 * Admin Settings Page
 * 
 * Main settings page with sidebar navigation and tabbed content.
 * Allows admin to manage branding, content, theme, and preview changes.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import LogoUpload from './LogoUpload';
import FaviconUpload from './FaviconUpload';
import SiteTextEditor from './SiteTextEditor';
import ThemeEditor from './ThemeEditor';
import SettingsPreview from './SettingsPreview';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  // Fetch current settings on mount
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
    setHasChanges(false);
    fetchSettings(); // Refresh to get latest
  };

  const handlePreviewChange = (previewSettings) => {
    // Update settings state for preview (without saving)
    setSettings(prev => {
      const updated = { ...prev, ...previewSettings };
      // If content data comes as separate fields, merge them properly
      if (previewSettings.heroHeadline !== undefined || 
          previewSettings.heroTagline !== undefined || 
          previewSettings.primaryHeading !== undefined) {
        updated.heroHeadline = previewSettings.heroHeadline !== undefined ? previewSettings.heroHeadline : prev?.heroHeadline || '';
        updated.heroTagline = previewSettings.heroTagline !== undefined ? previewSettings.heroTagline : prev?.heroTagline || '';
        updated.primaryHeading = previewSettings.primaryHeading !== undefined ? previewSettings.primaryHeading : prev?.primaryHeading || '';
      }
      return updated;
    });
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'theme', label: 'Theme', icon: '🎨' },
    { id: 'preview', label: 'Preview', icon: '👁️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-base text-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage="settings">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Settings Tabs Sidebar - Mobile: Horizontal Scroll, Desktop: Vertical */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="glass-card rounded-2xl p-2 sm:p-4 space-y-2 lg:sticky lg:top-24 border border-theme-base/30">
            {/* Mobile: Horizontal Scroll */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 lg:w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-black shadow-lg font-semibold'
                      : 'text-theme-primary bg-theme-surface/30 hover:bg-theme-surface/50 border border-theme-base/30'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="glass-card rounded-3xl  p-4 sm:p-6 lg:p-8 border border-theme-base/30">
              {activeTab === 'branding' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-black" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                    🎨 Branding Settings
                  </h2>
                  <div className="space-y-6 sm:space-y-8">
                    <LogoUpload
                      currentLogo={settings?.logoUrl}
                      onUpdate={handleSettingsUpdate}
                    />
                    <FaviconUpload
                      currentFavicon={settings?.faviconUrl}
                      onUpdate={handleSettingsUpdate}
                    />
                    <div>
                      <label className="block text-sm font-medium mb-2 text-black">Site Name</label>
                      <input
                        type="text"
                        value={settings?.siteName || ''}
                        onChange={(e) => {
                          setSettings(prev => ({ ...prev, siteName: e.target.value }));
                          setHasChanges(true);
                          // Update preview immediately
                          handlePreviewChange({ siteName: e.target.value });
                        }}
                        className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-black placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        placeholder="Next Subscription"
                      />
                      <p className="text-xs text-black mt-1">
                        Changes are preview-only. Use "Publish" in Preview tab to go live.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <SiteTextEditor
                  settings={settings}
                  onUpdate={handleSettingsUpdate}
                  onPreviewChange={handlePreviewChange}
                />
              )}

              {activeTab === 'theme' && (
                <ThemeEditor
                  currentTheme={settings?.theme}
                  onUpdate={handleSettingsUpdate}
                  onPreviewChange={handlePreviewChange}
                />
              )}

              {activeTab === 'preview' && (
                <SettingsPreview 
                  settings={settings} 
                  onApplyAll={fetchSettings}
                />
              )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;

