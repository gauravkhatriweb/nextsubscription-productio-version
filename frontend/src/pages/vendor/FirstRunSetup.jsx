/**
 * Vendor First Run Setup
 * 
 * Forces vendor to change password and complete profile on first login.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const FirstRunSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Change password, 2: Profile setup
  const [loading, setLoading] = useState(false);
  
  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile setup form
  const [profileData, setProfileData] = useState({
    displayName: '',
    ownerName: '',
    whatsappNumber: '',
    secondaryEmail: '',
    businessHours: '',
    supportLink: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${apiBase}/api/vendor/change-password`,
        {
          currentPassword: passwordData.currentPassword || undefined,
          newPassword: passwordData.newPassword
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key]) {
          formData.append(key, profileData[key]);
        }
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await axios.put(
        `${apiBase}/api/vendor/profile`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Profile setup complete!');
        navigate('/vendor/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="glass-card rounded-3xl p-8 border border-theme-base/30">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Welcome! Let's Get Started
            </h1>
            <p className="text-theme-secondary">
              Complete your vendor profile setup
            </p>
          </div>

          {/* Progress Steps - Simplified (no password change) */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center text-brand-primary">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-brand-primary text-white">
                1
              </div>
              <span className="ml-2 font-semibold">Complete Your Profile</span>
            </div>
          </div>

          {/* Step 1: REMOVED - Password change is admin-only */}
          {/* Vendors use the password assigned by admin */}

          {/* Step 2: Profile Setup */}
          {step === 2 && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Company Display Name</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Owner Name</label>
                <input
                  type="text"
                  value={profileData.ownerName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, ownerName: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Professional WhatsApp</label>
                <input
                  type="tel"
                  value={profileData.whatsappNumber}
                  onChange={(e) => setProfileData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Secondary Email</label>
                <input
                  type="email"
                  value={profileData.secondaryEmail}
                  onChange={(e) => setProfileData(prev => ({ ...prev, secondaryEmail: e.target.value }))}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="support@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Business Hours</label>
                <input
                  type="text"
                  value={profileData.businessHours}
                  onChange={(e) => setProfileData(prev => ({ ...prev, businessHours: e.target.value }))}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Mon-Fri 9AM-5PM EST"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Support Link</label>
                <input
                  type="url"
                  value={profileData.supportLink}
                  onChange={(e) => setProfileData(prev => ({ ...prev, supportLink: e.target.value }))}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="https://support.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Company Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo preview" className="w-20 h-20 rounded-lg object-cover border border-theme-base/30" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="flex-1 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstRunSetup;

