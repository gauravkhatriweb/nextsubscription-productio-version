/**
 * Logo Upload Component
 * 
 * Handles logo upload with drag-drop, preview, and delete functionality.
 * 
 * @component
 */

import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const LogoUpload = ({ currentLogo, onUpdate }) => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // FIX: Validate logo upload type & size before sending
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Accepted formats: PNG, JPG, JPEG, SVG');
      toast.error('Logo must be PNG, JPG, JPEG, or SVG');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File too large. Maximum size is 2MB');
      toast.error('Logo must be less than 2MB');
      return;
    }

    setError('');

    let objectUrl;
    try {
      objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } catch (error) {
      toast.error('Unable to generate preview for this file');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.put(
        `${apiBase}/api/admin/settings/branding`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('✅ Logo updated successfully');
        onUpdate({ logoUrl: response.data.settings.logoUrl });
        if (objectUrl) {
          try { URL.revokeObjectURL(objectUrl); } catch {}
        }
        setPreview(null);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload logo';
      setError(message);
      toast.error(message);
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch {}
      }
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the logo? This cannot be undone.')) {
      return;
    }
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/settings/branding`,
        { deleteLogo: true },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Logo removed');
        onUpdate({ logoUrl: null });
        setError('');
      }
    } catch (error) {
      setError('Failed to delete logo');
      toast.error('Failed to delete logo');
    }
  };

  const displayUrl = preview || (currentLogo ? `${apiBase}${currentLogo}` : null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">Site Logo</h3>
          <p className="text-xs text-theme-secondary">PNG, JPG, or SVG • Max 2MB • Recommended width ≥ 400px</p>
        </div>
      </div>

      {/* Preview */}
      {displayUrl && (
        <div className="glass-card rounded-2xl p-4 border border-theme-base/30 inline-flex items-center justify-center max-w-sm">
          <img
            src={displayUrl}
            alt="Logo preview"
            className="max-h-32 max-w-full object-contain"
          />
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`glass-card rounded-2xl border border-dashed p-6 sm:p-8 text-center transition-all backdrop-blur-md cursor-pointer ${
          dragActive ? 'border-brand-primary bg-brand-primary/10 shadow-theme-brand' : 'border-theme-base/40 hover:border-brand-primary/60'
        } ${uploading ? 'opacity-80 pointer-events-none' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !uploading) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-sm text-theme-secondary">Uploading logo…</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl">📤</div>
            <p className="text-sm sm:text-base text-theme-primary font-medium">
              Drag & drop your logo or <span className="text-brand-primary underline">browse</span>
            </p>
            <p className="text-xs text-theme-secondary">High-resolution PNG recommended. Transparent background preferred.</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {currentLogo && !uploading && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-standard bg-theme-surface text-theme-primary border border-theme-base/40 hover:bg-theme-surface/70 transition-theme"
          >
            Replace Logo
          </button>
          <button
            onClick={handleDelete}
            className="btn-standard bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-theme"
          >
            Delete Logo
          </button>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;

