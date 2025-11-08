/**
 * Favicon Upload Component
 * 
 * Handles favicon upload with preview.
 * 
 * @component
 */

import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const FaviconUpload = ({ currentFavicon, onUpdate }) => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // FIX: Client-side validation for favicon before upload
    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png'];
    const isIco = file.name.toLowerCase().endsWith('.ico');
    if (!allowedTypes.includes(file.type) && !isIco) {
      setError('Invalid file type. Favicon must be ICO or PNG');
      toast.error('Favicon must be ICO or PNG');
      return;
    }

    if (file.size > 500 * 1024) {
      setError('File too large. Maximum size is 500KB');
      toast.error('Favicon must be less than 500KB');
      return;
    }

    setError('');

    let objectUrl;
    try {
      objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } catch (error) {
      toast.error('Unable to preview favicon file');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('favicon', file);

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
        toast.success('✅ Favicon updated successfully');
        onUpdate({ faviconUrl: response.data.settings.faviconUrl });
        try {
          const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
          link.rel = 'icon';
          link.href = `${apiBase}${response.data.settings.faviconUrl}`;
          document.getElementsByTagName('head')[0].appendChild(link);
        } catch {}
        if (objectUrl) {
          try { URL.revokeObjectURL(objectUrl); } catch {}
        }
        setPreview(null);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload favicon';
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
    if (!window.confirm('Are you sure you want to delete the favicon?')) return;
    try {
      const response = await axios.put(
        `${apiBase}/api/admin/settings/branding`,
        { deleteFavicon: true },
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success('Favicon removed');
        onUpdate({ faviconUrl: null });
        setError('');
        try {
          const link = document.querySelector("link[rel~='icon']");
          if (link) {
            link.href = '/favicon.ico';
          }
        } catch {}
      }
    } catch (error) {
      setError('Failed to delete favicon');
      toast.error('Failed to delete favicon');
    }
  };

  const displayUrl = preview || (currentFavicon ? `${apiBase}${currentFavicon}` : null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">Favicon</h3>
          <p className="text-xs text-theme-secondary">ICO or PNG • 32x32 or 48x48 • Max 500KB</p>
        </div>
      </div>

      {displayUrl && (
        <div className="glass-card rounded-2xl p-4 border border-theme-base/30 inline-flex items-center justify-center w-20 h-20">
          <img
            src={displayUrl}
            alt="Favicon preview"
            className="w-12 h-12 object-contain"
          />
        </div>
      )}

      <div
        className={`glass-card rounded-2xl border border-dashed p-6 text-center transition-all backdrop-blur-md cursor-pointer ${
          uploading ? 'opacity-80 pointer-events-none' : 'hover:border-brand-primary/60'
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !uploading) {
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".ico,image/png,image/x-icon"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-theme-secondary text-sm">Uploading favicon…</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl">🔖</div>
            <p className="text-sm text-theme-primary">
              Tap to upload a favicon file
            </p>
            <p className="text-xs text-theme-secondary">Tip: Use a square icon for best results.</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}

      {currentFavicon && !uploading && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-standard bg-theme-surface text-theme-primary border border-theme-base/40 hover:bg-theme-surface/70 transition-theme"
          >
            Replace Favicon
          </button>
          <button
            onClick={handleDelete}
            className="btn-standard bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-theme"
          >
            Delete Favicon
          </button>
        </div>
      )}
    </div>
  );
};

export default FaviconUpload;

