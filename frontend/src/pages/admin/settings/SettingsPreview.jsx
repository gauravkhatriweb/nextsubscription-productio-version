/**
 * Settings Preview Component
 * 
 * Shows a live preview of how the settings will look on the landing page.
 * Includes a submit button to apply all changes to the main website.
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const SettingsPreview = ({ settings, onApplyAll }) => {
  const [applying, setApplying] = useState(false);
  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const logoUrl = settings?.logoUrl ? `${apiBase}${settings.logoUrl}` : null;
  const [mode, setMode] = useState(settings?.activeThemeMode === 'dark' ? 'dark' : 'light');
  const theme = (mode === 'dark' ? settings?.themeDark : settings?.themeLight) || settings?.theme || {
    primary: '#E43636',
    secondary: '#E2DDB4',
    background: '#F6EFD2',
    surface: '#FFFFFF',
    text: '#000000',
    button: '#E43636'
  };

  const getReadableText = (hex) => {
    if (!hex) return '#FFFFFF';
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16) / 255;
    const g = parseInt(color.substring(2, 4), 16) / 255;
    const b = parseInt(color.substring(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.55 ? '#000000' : '#FFFFFF';
  };

  useEffect(() => {
    if (settings?.activeThemeMode) {
      setMode(settings.activeThemeMode === 'dark' ? 'dark' : 'light');
    }
  }, [settings?.activeThemeMode]);

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

      // Save theme (support advanced payload)
      if (settings.themeLight || settings.themeDark || settings.theme) {
        const lightPayload = settings.themeLight || settings.theme;
        const darkPayload = settings.themeDark || settings.theme;
        promises.push(
          axios.put(
            `${apiBase}/api/admin/settings/theme`,
            {
              lightTheme: lightPayload,
              darkTheme: darkPayload,
              activeThemeMode: settings.activeThemeMode || mode
            },
            { withCredentials: true }
          )
        );
      }

      await Promise.all(promises);

      // Apply theme to document immediately
      if (settings.themeLight || settings.themeDark || settings.theme) {
        const root = document.documentElement;
        const active = (mode === 'dark' ? settings.themeDark : settings.themeLight) || settings.theme;
        root.style.setProperty('--brand-primary', active.primary);
        root.style.setProperty('--brand-secondary', active.secondary || '#E2DDB4');
        root.style.setProperty('--bg-light', active.background);
        root.style.setProperty('--bg-surface', active.surface);
        root.style.setProperty('--text-primary', active.text);
        root.style.setProperty('--button-bg', active.button || active.primary);
        root.style.setProperty('--button-text', getReadableText(active.button || active.primary));
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
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Preview
          </h2>
          <div className="glass-card rounded-xl p-1 border border-theme-base/30">
            <div className="flex">
              <button onClick={() => setMode('light')} className={`px-3 py-1 rounded-lg text-sm ${mode==='light'?'bg-brand-primary text-black':'text-theme-primary hover:bg-theme-surface/50'}`}>Light</button>
              <button onClick={() => setMode('dark')} className={`px-3 py-1 rounded-lg text-sm ${mode==='dark'?'bg-brand-primary text-black':'text-theme-primary hover:bg-theme-surface/50'}`}>Dark</button>
            </div>
          </div>
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

      {/* Preview Container (Condensed hero) */}
      <div
        className="glass-card rounded-3xl p-8 sm:p-12"
        style={{
          backgroundColor: theme.background,
          color: theme.text
        }}
      >
        {/* Logo & Site Name */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-8 sm:h-10 w-auto"
            />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.primary }}>
            {settings?.siteName || 'Next Subscription'}
          </h1>
        </div>

        {/* Hero Section Preview */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {settings?.heroHeadline || 'Simplify how you manage your subscriptions — securely and beautifully.'}
          </h2>
          <p className="text-sm sm:text-lg text-theme-secondary max-w-2xl mx-auto">
            {settings?.heroTagline || 'Take control of your recurring payments with intelligent tracking, automated reminders, and powerful insights — all in one elegant platform.'}
          </p>
        </div>

        {/* Primary Heading Preview */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4" style={{ color: theme.primary }}>
            {settings?.primaryHeading || 'For Subscribers'}
          </h3>
        </div>

        {/* Button Preview */}
        <div className="flex justify-center gap-3 sm:gap-4">
          <button
            className="px-5 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-lg transition-all hover:shadow-xl"
            style={{ backgroundColor: theme.button || theme.primary, color: getReadableText(theme.button || theme.primary) }}
          >
            {settings?.ctaText || 'Get Started'}
          </button>
          <button
            className="px-5 sm:px-8 py-3 sm:py-4 rounded-full font-semibold border-2 transition-all"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                style={{ backgroundColor: theme.secondary || '#E2DDB4' }}
              />
              <p className="text-xs font-medium">Secondary</p>
              <p className="text-xs text-theme-secondary font-mono">{theme.secondary || '#E2DDB4'}</p>
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
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2 border border-theme-base"
                style={{ backgroundColor: theme.button || theme.primary, color: getReadableText(theme.button || theme.primary) }}
              />
              <p className="text-xs font-medium">Button</p>
              <p className="text-xs text-theme-secondary font-mono">{theme.button || theme.primary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPreview;

