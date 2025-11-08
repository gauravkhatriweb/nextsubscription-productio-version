/**
 * Site Text Editor Component
 * 
 * Allows editing of hero headline, tagline, and primary heading.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const SiteTextEditor = ({ settings, onUpdate, onPreviewChange }) => {
  const [formData, setFormData] = useState({
    heroHeadline: '',
    heroTagline: '',
    primaryHeading: '',
    ctaText: ''
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  // Sync formData with settings when they change
  useEffect(() => {
    if (settings) {
      setFormData({
        heroHeadline: settings.heroHeadline || '',
        heroTagline: settings.heroTagline || '',
        primaryHeading: settings.primaryHeading || '',
        ctaText: settings.ctaText || ''
      });
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    setHasChanges(true);
    
    // Update preview immediately with complete formData
    if (onPreviewChange) {
      onPreviewChange(updatedFormData);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    // Just update preview - don't save to live site
    // Only Preview tab's "Publish" button saves to live
    if (onPreviewChange) {
      onPreviewChange(formData);
      toast.success('Content updated for preview. Publish from Preview tab to go live.');
      setHasChanges(false);
      return;
    }

    // Fallback: if no preview handler, save directly (old behavior)
    setSaving(true);
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/settings/content`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('Content updated successfully');
        onUpdate(response.data.settings);
        setHasChanges(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update content');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const defaults = {
      heroHeadline: 'Simplify how you manage your subscriptions — securely and beautifully.',
      heroTagline: 'Take control of your recurring payments with intelligent tracking, automated reminders, and powerful insights — all in one elegant platform.',
      primaryHeading: 'For Subscribers'
    };
    setFormData(defaults);
    setHasChanges(true);
    
    // Auto-save after reset
    setSaving(true);
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/settings/content`,
        defaults,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('Content reset to defaults');
        onUpdate(response.data.settings);
        setHasChanges(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          Content Settings
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
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
          <p className="text-xs text-theme-secondary">
            Changes are preview-only. Use "Publish" in Preview tab to go live.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Hero Title + Subheading */}
        <div className="space-y-6">
          {/* Hero Headline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Hero Title
              </label>
              <span className="text-xs text-theme-secondary" title="Short, bold statement at the top of the homepage.">
                {formData.heroHeadline.length} / 200
              </span>
            </div>
            <textarea
              value={formData.heroHeadline}
              onChange={(e) => handleChange('heroHeadline', e.target.value)}
              rows={2}
              maxLength={200}
              className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              placeholder="e.g., Manage your subscriptions beautifully."
              aria-label="Hero Title"
            />
            <p className="text-xs text-theme-secondary mt-1">Tip: Keep it concise and impactful.</p>
          </div>

          {/* Hero Subheading */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Subheading
              </label>
              <span className="text-xs text-theme-secondary" title="One-liner expanding on the hero title">
                {formData.heroTagline.length} / 300
              </span>
            </div>
            <textarea
              value={formData.heroTagline}
              onChange={(e) => handleChange('heroTagline', e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
              placeholder="e.g., Track, optimize, and stay on top of every renewal."
              aria-label="Subheading"
            />
            <p className="text-xs text-theme-secondary mt-1">Tip: Focus on benefits and clarity.</p>
          </div>
        </div>

        {/* Right column: Main Heading + CTA Text */}
        <div className="space-y-6">
          {/* Main Heading */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Main Heading
              </label>
              <span className="text-xs text-theme-secondary" title="Section title used below the hero area">
                {formData.primaryHeading.length} / 100
              </span>
            </div>
            <input
              type="text"
              value={formData.primaryHeading}
              onChange={(e) => handleChange('primaryHeading', e.target.value)}
              maxLength={100}
              className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g., For Subscribers"
              aria-label="Main Heading"
            />
            <p className="text-xs text-theme-secondary mt-1">Tip: Short and descriptive.</p>
          </div>

          {/* CTA Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                CTA Text
              </label>
              <span className="text-xs text-theme-secondary" title="Label for your primary call-to-action button">
                {formData.ctaText.length} / 40
              </span>
            </div>
            <input
              type="text"
              value={formData.ctaText}
              onChange={(e) => handleChange('ctaText', e.target.value)}
              maxLength={40}
              className="w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="e.g., Get Started Free"
              aria-label="CTA Text"
            />
            <p className="text-xs text-theme-secondary mt-1">Tip: Action-oriented and specific.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteTextEditor;

