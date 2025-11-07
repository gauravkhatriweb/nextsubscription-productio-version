/**
 * Settings Preview Component
 * 
 * Shows a live preview of how the settings will look on the landing page.
 * Includes a submit button to apply all changes to the main website.
 * 
 * @component
 */

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const SettingsPreview = ({ settings, onApplyAll }) => {
  const [applying, setApplying] = useState(false);
  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const logoUrl = settings?.logoUrl ? `${apiBase}${settings.logoUrl}` : null;
  const theme = settings?.theme || {
    primary: '#E43636',
    background: '#F6EFD2',
    surface: '#E2DDB4',
    text: '#000000'
  };

  const handleApplyAll = async () => {
    if (!settings) {
      toast.error('No settings to apply');
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      '⚠️ WARNING: This will apply ALL changes to the LIVE website immediately.\n\n' +
      'This includes:\n' +
      '• Site name and branding\n' +
      '• All content (headlines, taglines)\n' +
      '• Theme colors\n' +
      '• Logo and favicon\n\n' +
      'These changes will be visible to ALL visitors.\n\n' +
      'Are you sure you want to proceed?'
    );

    if (!confirmed) {
      return;
    }

    setApplying(true);
    try {
      // Apply all settings - save branding, content, and theme
      const promises = [];

      // Save branding (siteName only, files are saved separately when uploaded)
      if (settings.siteName !== undefined) {
        promises.push(
          axios.put(
            `${apiBase}/api/admin/settings/branding`,
            { siteName: settings.siteName },
            { withCredentials: true }
          )
        );
      }

      // Save content (use current settings values - ensure we have all fields)
      const contentData = {
        heroHeadline: settings.heroHeadline || '',
        heroTagline: settings.heroTagline || '',
        primaryHeading: settings.primaryHeading || ''
      };
      
      promises.push(
        axios.put(
          `${apiBase}/api/admin/settings/content`,
          contentData,
          { 
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true 
          }
        )
      );

      // Save theme (use current theme values)
      if (settings.theme) {
        promises.push(
          axios.put(
            `${apiBase}/api/admin/settings/theme`,
            settings.theme,
            { withCredentials: true }
          )
        );
      }

      await Promise.all(promises);

      // Apply theme to document immediately
      if (settings.theme) {
        const root = document.documentElement;
        root.style.setProperty('--brand-primary', settings.theme.primary);
        root.style.setProperty('--bg-light', settings.theme.background);
        root.style.setProperty('--bg-surface', settings.theme.surface);
        root.style.setProperty('--text-primary', settings.theme.text);
      }

      // Update favicon if available
      if (settings.faviconUrl) {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = `${apiBase}${settings.faviconUrl}`;
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      // Update page title
      if (settings.siteName) {
        document.title = settings.siteName;
      }

      toast.success('✅ All settings published successfully! Changes are now LIVE on the website.');
      
      // Call the callback to refresh settings
      if (onApplyAll) {
        onApplyAll();
      }

      // Show success message and reload after delay
      setTimeout(() => {
        const reload = window.confirm(
          'Settings have been published successfully!\n\n' +
          'Would you like to reload the page to see the changes?'
        );
        if (reload) {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply settings');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Preview
          </h2>
          <p className="text-black mt-2">
            Preview how your settings will appear on the landing page.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleApplyAll}
            disabled={applying || !settings}
            className={`px-8 py-4 rounded-full font-semibold text-black shadow-lg transition-all hover:shadow-xl ${
              applying || !settings
                ? 'bg-theme-surface text-black cursor-not-allowed'
                : 'bg-brand-primary hover:scale-105'
            }`}
          >
            {applying ? (
              <span className="flex items-center gap-2 text-black">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
                Applying to Live Site...
              </span>
            ) : (
              '🚀 Publish to Live Website'
            )}
          </button>
          <p className="text-xs text-black text-right max-w-xs">
            ⚠️ This will make changes visible to all visitors immediately
          </p>
        </div>
      </div>

      {/* Preview Container */}
      <div
        className="glass-card rounded-3xl p-12"
        style={{
          backgroundColor: theme.background,
          color: theme.text
        }}
      >
        {/* Logo & Site Name */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-12 w-auto"
            />
          )}
          <h1 className="text-3xl font-bold" style={{ color: theme.primary }}>
            {settings?.siteName || 'Next Subscription'}
          </h1>
        </div>

        {/* Hero Section Preview */}
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-4xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {settings?.heroHeadline || 'Simplify how you manage your subscriptions — securely and beautifully.'}
          </h2>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            {settings?.heroTagline || 'Take control of your recurring payments with intelligent tracking, automated reminders, and powerful insights — all in one elegant platform.'}
          </p>
        </div>

        {/* Primary Heading Preview */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.primary }}>
            {settings?.primaryHeading || 'For Subscribers'}
          </h3>
        </div>

        {/* Button Preview */}
        <div className="flex justify-center gap-4">
          <button
            className="px-8 py-4 rounded-full font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            style={{ backgroundColor: theme.primary }}
          >
            Get Started
          </button>
          <button
            className="px-8 py-4 rounded-full font-semibold border-2 transition-all"
            style={{
              borderColor: theme.primary,
              color: theme.primary,
              backgroundColor: 'transparent'
            }}
          >
            Learn More
          </button>
        </div>

        {/* Color Palette Preview */}
        <div className="mt-12 pt-8 border-t border-theme-base">
          <h4 className="text-lg font-semibold mb-4">Color Palette</h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2 border border-theme-base"
                style={{ backgroundColor: theme.primary }}
              />
              <p className="text-xs font-medium">Primary</p>
              <p className="text-xs text-theme-secondary font-mono">{theme.primary}</p>
            </div>
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2 border border-theme-base"
                style={{ backgroundColor: theme.background }}
              />
              <p className="text-xs font-medium">Background</p>
              <p className="text-xs text-theme-secondary font-mono">{theme.background}</p>
            </div>
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2 border border-theme-base"
                style={{ backgroundColor: theme.surface }}
              />
              <p className="text-xs font-medium">Surface</p>
              <p className="text-xs text-theme-secondary font-mono">{theme.surface}</p>
            </div>
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2 border border-theme-base"
                style={{ backgroundColor: theme.text }}
              />
              <p className="text-xs font-medium">Text</p>
              <p className="text-xs text-theme-secondary font-mono">{theme.text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPreview;

