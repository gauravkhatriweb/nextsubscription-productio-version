/**
 * Product Request Create Form
 * 
 * Form for vendor to submit product proposals for admin review.
 * 
 * @component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';
import { CURRENCIES } from '../../utils/constants';

const ProductRequestCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: 'netflix',
    serviceType: 'account_share',
    stock: 0,
    warrantyDays: 0,
    replacementPolicy: '',
    rules: '',
    description: ''
  });
  const [plans, setPlans] = useState([
    { durationDays: 30, price: 0, currency: 'USD' }
  ]);
  const [attachments, setAttachments] = useState([]);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handlePlanChange = (index, field, value) => {
    const updated = [...plans];
    updated[index] = {
      ...updated[index],
      [field]: field === 'durationDays' || field === 'price' ? parseFloat(value) || 0 : value
    };
    setPlans(updated);
  };

  const handleAddPlan = () => {
    setPlans([...plans, { durationDays: 30, price: 0, currency: 'USD' }]);
  };

  const handleRemovePlan = (index) => {
    if (plans.length > 1) {
      setPlans(plans.filter((_, i) => i !== index));
    } else {
      toast.error('At least one plan is required');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachments.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }
    setAttachments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      toast.error('Product title is required');
      setLoading(false);
      return;
    }

    if (plans.length === 0) {
      toast.error('At least one plan is required');
      setLoading(false);
      return;
    }

    for (const plan of plans) {
      if (!plan.durationDays || plan.durationDays < 1) {
        toast.error('All plans must have a valid duration (minimum 1 day)');
        setLoading(false);
        return;
      }
      if (!plan.price || plan.price < 0) {
        toast.error('All plans must have a valid price (minimum 0)');
        setLoading(false);
        return;
      }
      if (!plan.currency) {
        toast.error('All plans must have a currency');
        setLoading(false);
        return;
      }
    }

    if (formData.stock < 0) {
      toast.error('Stock cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('provider', formData.provider);
      submitData.append('serviceType', formData.serviceType);
      submitData.append('plans', JSON.stringify(plans));
      submitData.append('stock', formData.stock);
      submitData.append('warrantyDays', formData.warrantyDays);
      submitData.append('replacementPolicy', formData.replacementPolicy);
      submitData.append('rules', formData.rules);
      submitData.append('description', formData.description);

      // Add files
      attachments.forEach((file) => {
        submitData.append('attachments', file);
      });

      const response = await axios.post(
        `${apiBase}/api/vendor/products/requests`,
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Product request submitted successfully! Awaiting admin review.');
        navigate('/vendor/products/requests');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit product request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout currentPage="products">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Submit Product Request
          </h1>
          <p className="text-theme-secondary">
            Propose a new product for admin review. Your request will be reviewed before approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">
                  Product Title <span className="text-error">*</span>
                </label>
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
                <label className="block text-sm font-medium mb-2 text-theme-primary">
                  Provider <span className="text-error">*</span>
                </label>
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
                <label className="block text-sm font-medium mb-2 text-theme-primary">
                  Service Type <span className="text-error">*</span>
                </label>
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
                <label className="block text-sm font-medium mb-2 text-theme-primary">
                  Stock <span className="text-error">*</span>
                </label>
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

          {/* Plans */}
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-theme-primary">
                Pricing Plans <span className="text-error">*</span>
              </h2>
              <button
                type="button"
                onClick={handleAddPlan}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors text-sm"
              >
                + Add Plan
              </button>
            </div>
            <div className="space-y-4">
              {plans.map((plan, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-theme-surface rounded-xl border border-theme-base/30">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-theme-primary">Duration (Days)</label>
                    <input
                      type="number"
                      value={plan.durationDays}
                      onChange={(e) => handlePlanChange(index, 'durationDays', e.target.value)}
                      required
                      min="1"
                      className="w-full rounded-lg border border-theme-base/50 bg-theme-base px-3 py-2 text-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-theme-primary">Price</label>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={(e) => handlePlanChange(index, 'price', e.target.value)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full rounded-lg border border-theme-base/50 bg-theme-base px-3 py-2 text-theme-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-theme-primary">Currency</label>
                    <select
                      value={plan.currency}
                      onChange={(e) => handlePlanChange(index, 'currency', e.target.value)}
                      required
                      className="w-full rounded-lg border border-theme-base/50 bg-theme-base px-3 py-2 text-theme-primary"
                    >
                      {CURRENCIES.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    {plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlan(index)}
                        className="w-full px-4 py-2 border border-error text-error rounded-lg hover:bg-error/10 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty & Policies */}
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Warranty & Policies</h2>
            <div className="space-y-4">
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
                  placeholder="Vendor-specific rules and terms..."
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
                  placeholder="Product description and details..."
                />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Attachments (Optional)</h2>
            <div>
              <label className="block text-sm font-medium mb-2 text-theme-primary">
                Upload Images or Documents (Max 5 files, 5MB each)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
              />
              {attachments.length > 0 && (
                <div className="mt-2 text-sm text-theme-secondary">
                  {attachments.length} file(s) selected
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendor/products/requests')}
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

export default ProductRequestCreate;

