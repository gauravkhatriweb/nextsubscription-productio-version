/**
 * Product Create/Edit Form
 * 
 * Universal product creation form supporting all product types.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';
import { CURRENCIES } from '../../utils/constants';

const ProductCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: 'netflix',
    serviceType: 'account_share',
    planDurationDays: 30,
    priceDecimal: 0,
    currency: 'USD',
    stock: 0,
    warrantyDays: 0,
    warrantyType: 'none',
    replacementPolicy: '',
    rules: '',
    description: '',
    status: 'draft',
    autoActivate: false
  });
  const [profiles, setProfiles] = useState([]);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/vendor/products/${id}`, {
        withCredentials: true
      });
      if (response.data.success) {
        const product = response.data.product;
        setFormData({
          title: product.title || '',
          provider: product.provider || 'netflix',
          serviceType: product.serviceType || 'account_share',
          planDurationDays: product.planDurationDays || 30,
          priceDecimal: product.priceDecimal || 0,
          currency: product.currency || 'USD',
          stock: product.stock || 0,
          warrantyDays: product.warrantyDays || 0,
          warrantyType: product.warrantyType || 'none',
          replacementPolicy: product.replacementPolicy || '',
          rules: product.rules || '',
          description: product.description || '',
          status: product.status || 'draft',
          autoActivate: product.autoActivate || false
        });
        if (product.profiles) {
          setProfiles(product.profiles);
        }
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/vendor/products');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleAddProfile = () => {
    setProfiles([...profiles, { profileName: '', pin: '', isAssigned: false }]);
  };

  const handleProfileChange = (index, field, value) => {
    const updated = [...profiles];
    updated[index] = { ...updated[index], [field]: value };
    setProfiles(updated);
  };

  const handleRemoveProfile = (index) => {
    setProfiles(profiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        profiles: formData.serviceType === 'account_share' ? profiles : undefined,
        accountEmail: formData.serviceType === 'account_share' ? accountEmail : undefined,
        accountPassword: formData.serviceType === 'account_share' ? accountPassword : undefined
      };

      if (isEdit) {
        await axios.put(`${apiBase}/api/vendor/products/${id}`, productData, {
          withCredentials: true
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${apiBase}/api/vendor/products`, productData, {
          withCredentials: true
        });
        toast.success('Product created successfully');
      }
      navigate('/vendor/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout currentPage="products">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {isEdit ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-theme-secondary">Add a new product to your catalog</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Product Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  placeholder="Netflix Standard - 1 Month"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Provider</label>
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                >
                  <option value="netflix">Netflix</option>
                  <option value="spotify">Spotify</option>
                  <option value="adobe">Adobe</option>
                  <option value="disney">Disney+</option>
                  <option value="hulu">Hulu</option>
                  <option value="amazon">Amazon Prime</option>
                  <option value="apple">Apple</option>
                  <option value="microsoft">Microsoft</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Service Type</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                >
                  <option value="account_share">Account Share</option>
                  <option value="email_invite">Email Invite</option>
                  <option value="license_key">License Key</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Plan Duration (Days)</label>
                <input
                  type="number"
                  name="planDurationDays"
                  value={formData.planDurationDays}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Price</label>
                <input
                  type="number"
                  name="priceDecimal"
                  value={formData.priceDecimal}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                />
              </div>
            </div>
          </div>

          {/* Account Share Specific Fields */}
          {formData.serviceType === 'account_share' && (
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
              <h2 className="text-xl font-bold mb-4 text-theme-primary">Account Credentials</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-theme-primary">Account Email</label>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                    placeholder="account@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-theme-primary">Account Password</label>
                  <input
                    type="password"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                    placeholder="Account password"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-theme-primary">Profiles</label>
                    <button
                      type="button"
                      onClick={handleAddProfile}
                      className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                    >
                      + Add Profile
                    </button>
                  </div>
                  {profiles.map((profile, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={profile.profileName}
                        onChange={(e) => handleProfileChange(index, 'profileName', e.target.value)}
                        placeholder="Profile name"
                        className="flex-1 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary placeholder:text-theme-subtle"
                      />
                      <input
                        type="text"
                        value={profile.pin || ''}
                        onChange={(e) => handleProfileChange(index, 'pin', e.target.value)}
                        placeholder="PIN (optional)"
                        className="w-24 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary placeholder:text-theme-subtle"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProfile(index)}
                        className="px-3 py-2 border border-error text-error rounded-lg hover:bg-error/10 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Warranty & Policies */}
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Warranty & Policies</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-theme-primary">Warranty Days</label>
                  <input
                    type="number"
                    name="warrantyDays"
                    value={formData.warrantyDays}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-theme-primary">Warranty Type</label>
                  <select
                    name="warrantyType"
                    value={formData.warrantyType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                  >
                    <option value="none">None</option>
                    <option value="full">Full</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Replacement Policy</label>
                <textarea
                  name="replacementPolicy"
                  value={formData.replacementPolicy}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  placeholder="Describe your replacement policy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Rules</label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  placeholder="Vendor-specific rules..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  placeholder="Product description..."
                />
              </div>
            </div>
          </div>

          {/* Status & Settings */}
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Status & Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending (Requires Admin Approval)</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="autoActivate"
                  checked={formData.autoActivate}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-theme-primary">Auto-activate on approval</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products')}
              className="px-8 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
};

export default ProductCreate;

