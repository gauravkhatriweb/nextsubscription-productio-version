import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const DEFAULT_LIGHT = {
  primary: '#E43636',
  secondary: '#E2DDB4',
  background: '#F6EFD2',
  surface: '#FFFFFF',
  text: '#000000',
  button: '#E43636'
};

const DEFAULT_DARK = {
  primary: '#E43636',
  secondary: '#2B2B2B',
  background: '#000000',
  surface: '#1A1A1A',
  text: '#F6EFD2',
  button: '#E43636'
};

const COLOR_FIELDS = [
  { key: 'primary', label: 'Primary', description: 'Main brand accent & key actions' },
  { key: 'secondary', label: 'Secondary', description: 'Supporting accents & badges' },
  { key: 'background', label: 'Background', description: 'App background color' },
  { key: 'surface', label: 'Surface', description: 'Cards, panels, sheets' },
  { key: 'text', label: 'Text', description: 'Primary typography color' },
  { key: 'button', label: 'Button', description: 'Primary button background' }
];

const ThemeEditor = ({ currentTheme, onUpdate, onPreviewChange }) => {
  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const [lightPalette, setLightPalette] = useState({ ...DEFAULT_LIGHT });
  const [darkPalette, setDarkPalette] = useState({ ...DEFAULT_DARK });
  const [editingMode, setEditingMode] = useState('light');
  const [previewMode, setPreviewMode] = useState('light');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [contrastWarning, setContrastWarning] = useState('');

  useEffect(() => {
    if (!currentTheme) return;
    const nextLight = { ...DEFAULT_LIGHT, ...(currentTheme.themeLight || currentTheme.light || {}) };
    const nextDark = { ...DEFAULT_DARK, ...(currentTheme.themeDark || currentTheme.dark || {}) };
    setLightPalette(nextLight);
    setDarkPalette(nextDark);
    const mode = currentTheme.activeThemeMode === 'dark' ? 'dark' : 'light';
    setPreviewMode(mode);
    applyPaletteToDocument(mode === 'dark' ? nextDark : nextLight);
    notifyPreview(nextLight, nextDark, mode);
    setHasChanges(false);
    updateContrastHint(mode === 'dark' ? nextDark : nextLight);
  }, [currentTheme?.themeLight, currentTheme?.themeDark, currentTheme?.activeThemeMode]);

  const notifyPreview = (light, dark, mode) => {
    if (!onPreviewChange) return;
    onPreviewChange({
      themeLight: light,
      themeDark: dark,
      activeThemeMode: mode,
      theme: mode === 'dark' ? dark : light
    });
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

  const updateContrastHint = (palette) => {
    const ratio = contrastRatio(palette.text, palette.background);
    setContrastWarning(ratio < 4.5 ? '⚠️ Low contrast between text and background — consider adjusting.' : '');
  };

  const relLuminance = (hex) => {
    try {
      const normalized = hex.replace('#', '');
      const r = parseInt(normalized.substring(0, 2), 16) / 255;
      const g = parseInt(normalized.substring(2, 4), 16) / 255;
      const b = parseInt(normalized.substring(4, 6), 16) / 255;
      const convert = (value) => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
      return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
    } catch {
      return 0;
    }
  };

  const contrastRatio = (foreground, background) => {
    const l1 = relLuminance(foreground);
    const l2 = relLuminance(background);
    const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (lighter + 0.05) / (darker + 0.05);
  };

  const applyPaletteToDocument = (palette) => {
    // FIX: Broadcast active palette to CSS variables for global usage
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', palette.primary);
    root.style.setProperty('--brand-secondary', palette.secondary);
    root.style.setProperty('--brand-accent', palette.secondary);
    root.style.setProperty('--surface-base', palette.surface);
    root.style.setProperty('--surface-elevated', palette.surface);
    root.style.setProperty('--bg-base', palette.background);
    root.style.setProperty('--bg-surface', palette.surface);
    root.style.setProperty('--bg-light', palette.background);
    root.style.setProperty('--text-primary', palette.text);
    root.style.setProperty('--button-bg', palette.button);
    root.style.setProperty('--button-text', getReadableText(palette.button));
  };

  const handleColorChange = (mode, field, value) => {
    const current = mode === 'dark' ? darkPalette : lightPalette;
    const next = { ...current, [field]: value };

    if (mode === 'dark') {
      setDarkPalette(next);
      notifyPreview(lightPalette, next, previewMode);
      if (previewMode === 'dark') {
        applyPaletteToDocument(next);
        updateContrastHint(next);
      }
    } else {
      setLightPalette(next);
      notifyPreview(next, darkPalette, previewMode);
      if (previewMode === 'light') {
        applyPaletteToDocument(next);
        updateContrastHint(next);
      }
    }

    setHasChanges(true);
  };

  const handlePreviewModeChange = (mode) => {
    const normalized = mode === 'dark' ? 'dark' : 'light';
    setPreviewMode(normalized);
    applyPaletteToDocument(normalized === 'dark' ? darkPalette : lightPalette);
    updateContrastHint(normalized === 'dark' ? darkPalette : lightPalette);
    notifyPreview(lightPalette, darkPalette, normalized);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No theme changes to save');
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/settings/theme`,
        {
          lightTheme: lightPalette,
          darkTheme: darkPalette,
          activeThemeMode: previewMode
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('✅ Theme updated');
        const { themeLight: updatedLight, themeDark: updatedDark, activeThemeMode: updatedMode, theme: activeTheme } = response.data.settings;
        const normalizedLight = { ...DEFAULT_LIGHT, ...updatedLight };
        const normalizedDark = { ...DEFAULT_DARK, ...updatedDark };
        const activeMode = updatedMode === 'dark' ? 'dark' : 'light';
        setLightPalette(normalizedLight);
        setDarkPalette(normalizedDark);
        setPreviewMode(activeMode);
        applyPaletteToDocument(activeMode === 'dark' ? normalizedDark : normalizedLight);
        updateContrastHint(activeMode === 'dark' ? normalizedDark : normalizedLight);
        notifyPreview(normalizedLight, normalizedDark, activeMode);
        setHasChanges(false);
        onUpdate?.({
          theme: activeTheme,
          themeLight: updatedLight,
          themeDark: updatedDark,
          activeThemeMode: updatedMode
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await axios.post(
        `${apiBase}/api/admin/settings/theme/reset`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Theme reset to brand defaults');
        const nextLight = { ...DEFAULT_LIGHT };
        const nextDark = { ...DEFAULT_DARK };
        setLightPalette(nextLight);
        setDarkPalette(nextDark);
        setPreviewMode('light');
        applyPaletteToDocument(nextLight);
        updateContrastHint(nextLight);
        setHasChanges(false);
        notifyPreview(nextLight, nextDark, 'light');
        onUpdate?.({
          theme: response.data.settings.theme,
          themeLight: response.data.settings.themeLight,
          themeDark: response.data.settings.themeDark,
          activeThemeMode: response.data.settings.activeThemeMode
        });
      }
    } catch (error) {
      toast.error('Failed to reset theme');
    }
  };

  const renderPaletteSection = (mode, palette) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          {mode === 'light' ? 'Light Mode Colors' : 'Dark Mode Colors'}
        </h3>
        <span className="hidden lg:inline text-xs text-theme-secondary">Click swatch or hex to edit</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {COLOR_FIELDS.map(({ key, label, description }) => (
          <div key={`${mode}-${key}`} className="glass-card rounded-2xl p-4 border border-theme-base/30 space-y-3 transition-theme">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-theme-primary">{label}</span>
              <span className="text-xs text-theme-secondary">{palette[key]}</span>
            </div>
            <p className="text-xs text-theme-secondary">{description}</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={palette[key]}
                onChange={(event) => handleColorChange(mode, key, event.target.value)}
                title={`Select ${mode} ${label} color`}
                className="w-16 h-10 rounded-lg border border-theme-base cursor-pointer"
              />
              <input
                type="text"
                value={palette[key]}
                onChange={(event) => handleColorChange(mode, key, event.target.value)}
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="flex-1 rounded-xl border border-theme-base bg-theme-surface px-3 py-2 text-sm font-mono text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div
              className="h-12 rounded-xl border border-theme-base flex items-center justify-center"
              style={{ backgroundColor: palette[key], color: mode === 'dark' ? '#FFFFFF' : '#000000' }}
            >
              <span className="text-xs">Preview</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ThemePreviewCard = () => {
    const activePalette = previewMode === 'dark' ? darkPalette : lightPalette;
    const oppositePalette = previewMode === 'dark' ? lightPalette : darkPalette;
    const buttonTextColor = getReadableText(activePalette.button);

    return (
      <div className="glass-card rounded-3xl mt-8 border border-theme-base/30 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-theme-primary">Live Preview</h4>
          <div className="glass-card rounded-xl p-1 border border-theme-base/30">
            <div className="flex">
              <button
                onClick={() => handlePreviewModeChange('light')}
                className={`px-3 py-1 rounded-lg text-sm ${previewMode === 'light' ? 'bg-brand-primary text-black' : 'text-theme-primary hover:bg-theme-surface/50'}`}
              >
                Light
              </button>
              <button
                onClick={() => handlePreviewModeChange('dark')}
                className={`px-3 py-1 rounded-lg text-sm ${previewMode === 'dark' ? 'bg-brand-primary text-black' : 'text-theme-primary hover:bg-theme-surface/50'}`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        {contrastWarning && (
          <p className="text-xs text-warning">{contrastWarning}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-2xl p-6 space-y-3 border border-theme-base/30"
            style={{ backgroundColor: activePalette.surface, color: activePalette.text }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-theme-secondary">Dashboard</p>
            <h5 className="text-xl font-semibold">Glass-effect Panel</h5>
            <p className="text-sm text-theme-secondary">
              Buttons, typography, and cards adapt instantly to your palette selections.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                className="px-4 py-2 rounded-full text-sm font-semibold shadow-theme-brand transition-theme"
                style={{ backgroundColor: activePalette.button, color: buttonTextColor }}
              >
                Primary Action
              </button>
              <button
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-theme"
                style={{ borderColor: activePalette.primary, color: activePalette.primary }}
              >
                Secondary
              </button>
            </div>
          </div>
          <div
            className="rounded-2xl p-6 space-y-4 border border-theme-base/30"
            style={{ backgroundColor: oppositePalette.background, color: oppositePalette.text }}
          >
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: oppositePalette.secondary }}>
              Login Preview
            </p>
            <input
              type="text"
              placeholder="Email address"
              className="w-full rounded-xl border border-theme-base/40 bg-theme-surface px-4 py-3 text-sm"
              readOnly
              value="you@example.com"
            />
            <button
              className="w-full px-4 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: oppositePalette.button, color: getReadableText(oppositePalette.button) }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Theme Settings
          </h2>
          <p className="text-sm text-theme-secondary mt-1">Customize light & dark palettes. Changes preview instantly; save to persist.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleReset}
            className="btn-standard bg-theme-surface text-theme-primary border border-theme-base/40 hover:bg-theme-surface/70 transition-theme"
          >
            Reset to defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn-standard px-6 font-semibold transition-theme ${saving ? 'bg-brand-primary/60 text-black cursor-wait' : 'bg-brand-primary text-black hover:bg-brand-primary/90'}`}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="lg:hidden glass-card rounded-2xl border border-theme-base/30 p-2 flex gap-2">
        <button
          onClick={() => setEditingMode('light')}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-theme ${editingMode === 'light' ? 'bg-brand-primary text-black' : 'bg-theme-surface text-theme-primary'}`}
        >
          Light Palette
        </button>
        <button
          onClick={() => setEditingMode('dark')}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-theme ${editingMode === 'dark' ? 'bg-brand-primary text-black' : 'bg-theme-surface text-theme-primary'}`}
        >
          Dark Palette
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`${editingMode === 'light' ? 'block' : 'hidden lg:block'}`}>
          {renderPaletteSection('light', lightPalette)}
        </div>
        <div className={`${editingMode === 'dark' ? 'block' : 'hidden lg:block'}`}>
          {renderPaletteSection('dark', darkPalette)}
        </div>
      </div>

      <ThemePreviewCard />
    </div>
  );
};

export default ThemeEditor;

