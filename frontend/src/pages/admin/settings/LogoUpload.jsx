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
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Logo must be PNG, JPG, or SVG');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
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
        toast.success('Logo uploaded successfully');
        onUpdate({ logoUrl: response.data.settings.logoUrl });
        setPreview(null); // Clear preview after successful upload
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload logo');
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
      // Note: Backend should handle deletion. For now, we'll just clear it.
      toast.info('Logo deletion will be implemented in backend');
    } catch (error) {
      toast.error('Failed to delete logo');
    }
  };

  const displayUrl = preview || (currentLogo ? `${apiBase}${currentLogo}` : null);

  return (
    <div>
      <label className="block text-sm font-medium mb-4">Site Logo</label>
      
      {/* Preview */}
      {displayUrl && (
        <div className="mb-4">
          <div className="glass-card rounded-xl p-6 inline-block">
            <img
              src={displayUrl}
              alt="Logo preview"
              className="max-h-32 max-w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-theme-base hover:border-brand-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="text-theme-secondary">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl mb-2">📤</div>
            <p className="text-theme-primary font-medium">
              Drag and drop your logo here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-primary hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-theme-secondary">
              PNG, JPG, or SVG (max 2MB)
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {currentLogo && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-theme-surface text-theme-primary hover:bg-theme-base transition-colors"
          >
            Replace Logo
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
          >
            Delete Logo
          </button>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;

