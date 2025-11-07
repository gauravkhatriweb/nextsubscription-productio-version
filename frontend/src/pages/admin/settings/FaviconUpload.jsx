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
  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type
    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.ico')) {
      toast.error('Favicon must be ICO or PNG');
      return;
    }

    // Validate file size (500KB)
    if (file.size > 500 * 1024) {
      toast.error('Favicon must be less than 500KB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
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
        toast.success('Favicon uploaded successfully');
        onUpdate({ faviconUrl: response.data.settings.faviconUrl });
        setPreview(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload favicon');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || (currentFavicon ? `${apiBase}${currentFavicon}` : null);

  return (
    <div>
      <label className="block text-sm font-medium mb-4">Favicon</label>
      <p className="text-sm text-theme-secondary mb-4">
        Recommended: 32x32 or 48x48 pixels (ICO or PNG)
      </p>

      {/* Preview */}
      {displayUrl && (
        <div className="mb-4">
          <div className="glass-card rounded-xl p-4 inline-block">
            <img
              src={displayUrl}
              alt="Favicon preview"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-theme-base rounded-xl p-6 text-center hover:border-brand-primary/50 transition-all">
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
            <p className="text-theme-secondary text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl">🔖</div>
            <p className="text-theme-primary text-sm">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-primary hover:underline"
              >
                Click to upload
              </button>{' '}
              favicon
            </p>
            <p className="text-xs text-theme-secondary">ICO or PNG (max 500KB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaviconUpload;

