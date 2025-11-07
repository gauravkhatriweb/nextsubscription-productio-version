/**
 * Theme Editor Component
 * 
 * Allows editing of theme colors with color pickers and contrast validation.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ThemeEditor = ({ currentTheme, onUpdate, onPreviewChange }) => {
  const [theme, setTheme] = useState({
    primary: currentTheme?.primary || '#E43636',
    background: currentTheme?.background || '#F6EFD2',
    surface: currentTheme?.surface || '#E2DDB4',
    text: currentTheme?.text || '#000000'
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [contrastWarning, setContrastWarning] = useState('');

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, [currentTheme]);

  const handleColorChange = (field, value) => {
    const newTheme = { ...theme, [field]: value };
    setTheme(newTheme);
    setHasChanges(true);
    
    // Update preview immediately
    if (onPreviewChange) {
      onPreviewChange({ theme: newTheme });
    }
    
    // Check contrast
    if (field === 'background' || field === 'text') {
      checkContrast();
    }
  };

  const checkContrast = () => {
    // Basic contrast check (simplified)
    const bg = theme.background;
    const text = theme.text;
    
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const getLuminance = (rgb) => {
      const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(val => {
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const bgRgb = hexToRgb(bg);
    const textRgb = hexToRgb(text);

    if (bgRgb && textRgb) {
      const bgLum = getLuminance(bgRgb);
      const textLum = getLuminance(textRgb);
      const contrast = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);

      if (contrast < 4.5) {
        setContrastWarning(`Low contrast ratio: ${contrast.toFixed(2)}:1 (WCAG AA requires 4.5:1)`);
      } else {
        setContrastWarning('');
      }
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    if (contrastWarning) {
      if (!window.confirm('Color contrast is below WCAG AA standards. Continue anyway?')) {
        return;
      }
    }

    // Just update preview - don't save to live site
    // Only Preview tab's "Publish" button saves to live
    if (onPreviewChange) {
      onPreviewChange({ theme });
      toast.info('Theme updated in preview. Click "Publish to Live Website" in Preview tab to make it live.');
      setHasChanges(false);
      setContrastWarning('');
      // Apply theme to preview only (not saved yet)
      applyThemeToDocument(theme);
      return;
    }

    // Fallback: if no preview handler, save directly (old behavior)
    setSaving(true);
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/settings/theme`,
        theme,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('Theme updated successfully');
        onUpdate({ theme: response.data.settings.theme });
        setHasChanges(false);
        setContrastWarning('');
        
        // Apply theme immediately
        applyThemeToDocument(response.data.settings.theme);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const defaults = {
      primary: '#E43636',
      background: '#F6EFD2',
      surface: '#E2DDB4',
      text: '#000000'
    };
    setTheme(defaults);
    setHasChanges(true);
    
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/settings/theme/reset`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Theme reset to defaults');
        onUpdate({ theme: response.data.settings.theme });
        setHasChanges(false);
        applyThemeToDocument(response.data.settings.theme);
      }
    } catch (error) {
      toast.error('Failed to reset theme');
    }
  };

  const applyThemeToDocument = (themeData) => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', themeData.primary);
    root.style.setProperty('--bg-light', themeData.background);
    root.style.setProperty('--bg-surface', themeData.surface);
    root.style.setProperty('--text-primary', themeData.text);
  };

  const colorFields = [
    { key: 'primary', label: 'Primary Accent', description: 'Main brand color for buttons and highlights' },
    { key: 'background', label: 'Background', description: 'Light mode background color' },
    { key: 'surface', label: 'Surface', description: 'Card and panel background color' },
    { key: 'text', label: 'Text Color', description: 'Primary text color' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          Theme Settings
        </h2>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-theme-surface text-theme-primary hover:bg-theme-base transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              hasChanges && !saving
                ? 'bg-theme-surface text-theme-primary hover:bg-theme-base border border-theme-base'
                : 'bg-theme-surface text-theme-secondary cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : '💾 Update Preview'}
          </button>
          <p className="text-xs text-theme-secondary mt-1">
            Changes are preview-only. Use "Publish" in Preview tab to go live.
          </p>
        </div>
      </div>

      {contrastWarning && (
        <div className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/30 text-warning">
          <p className="text-sm font-medium">⚠️ {contrastWarning}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colorFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium">
              {field.label}
            </label>
            <p className="text-xs text-theme-secondary mb-2">
              {field.description}
            </p>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={theme[field.key]}
                onChange={(e) => handleColorChange(field.key, e.target.value)}
                className="w-20 h-12 rounded-lg border border-theme-base cursor-pointer"
              />
              <input
                type="text"
                value={theme[field.key]}
                onChange={(e) => handleColorChange(field.key, e.target.value)}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="flex-1 rounded-xl border border-theme-base bg-theme-surface px-4 py-2 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                placeholder="#E43636"
              />
            </div>
            {/* Preview */}
            <div
              className="h-16 rounded-lg border border-theme-base flex items-center justify-center"
              style={{
                backgroundColor: field.key === 'background' ? theme.background : theme.surface,
                color: theme.text
              }}
            >
              <span className="text-sm font-medium">Preview</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeEditor;

