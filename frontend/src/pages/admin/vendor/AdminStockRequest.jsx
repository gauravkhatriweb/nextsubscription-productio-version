/**
 * Admin Stock Request
 * 
 * Admin page to request stock from a specific vendor.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';

const AdminStockRequest = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantityRequested: 1,
    notes: '',
    deadline: ''
  });
  const [templates, setTemplates] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchVendorAndProducts();
  }, [vendorId]);

  const fetchVendorAndProducts = async () => {
    try {
      const [vendorRes, productsRes] = await Promise.all([
        axios.get(`${apiBase}/api/admin/vendor/${vendorId}`, { withCredentials: true }),
        axios.get(`${apiBase}/api/admin/vendor/${vendorId}/products`, { withCredentials: true })
      ]);

      if (vendorRes.data.success) {
        setVendor(vendorRes.data.data?.vendor || vendorRes.data.vendor);
      }

      if (productsRes.data.success) {
        setProducts(productsRes.data.products);
      }
    } catch (error) {
      toast.error('Failed to load vendor information');
      navigate('/admin/vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantityRequested' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(
        `${apiBase}/api/admin/vendor/${vendorId}/requests`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setTemplates(response.data.templates);
        setShowTemplates(true);
        toast.success('Stock request created successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create stock request');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Request Stock from {vendor?.displayName || vendor?.companyName || 'Vendor'}
            </h1>
            <p className="text-theme-secondary">Create a stock request and generate communication templates</p>
          </div>
          <button
            onClick={() => navigate(`/admin/vendor/${vendorId}`)}
            className="px-6 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
          >
            Back to Vendor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Request Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">
                  Product <span className="text-error">*</span>
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.title} {product.sku ? `(SKU: ${product.sku})` : ''} - {product.provider}
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <p className="text-sm text-warning mt-2">
                    No approved products found for this vendor. Please approve products first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">
                  Quantity Requested <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  name="quantityRequested"
                  value={formData.quantityRequested}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  placeholder="Additional notes or delivery instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Deadline (Optional)</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || products.length === 0}
              className="px-8 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors shadow-lg disabled:opacity-50"
            >
              {submitting ? 'Creating Request...' : 'Create Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/vendor/${vendorId}`)}
              className="px-8 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Templates Modal */}
        {showTemplates && templates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTemplates(false)}>
            <div className="glass-card rounded-3xl p-8 border border-theme-base/30 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme-primary">Communication Templates</h2>
                <button onClick={() => setShowTemplates(false)} className="text-theme-secondary hover:text-theme-primary">✕</button>
              </div>

              <div className="space-y-6">
                {/* Email Template */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-theme-primary">Email Template</h3>
                    <button
                      onClick={() => copyToClipboard(`${templates.email.subject}\n\n${templates.email.body}`)}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors text-sm"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-theme-secondary">Subject</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={templates.email.subject}
                          readOnly
                          className="flex-1 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                        />
                        <button
                          onClick={() => copyToClipboard(templates.email.subject)}
                          className="px-4 py-2 bg-theme-surface border border-theme-base rounded-lg hover:bg-theme-base transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-theme-secondary">Body</label>
                      <div className="flex gap-2">
                        <textarea
                          value={templates.email.body}
                          readOnly
                          rows={10}
                          className="flex-1 rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary font-mono text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(templates.email.body)}
                          className="px-4 py-2 bg-theme-surface border border-theme-base rounded-lg hover:bg-theme-base transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Template */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-theme-primary">WhatsApp Template</h3>
                    <button
                      onClick={() => copyToClipboard(templates.whatsapp)}
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <textarea
                    value={templates.whatsapp}
                    readOnly
                    rows={12}
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-theme-base/30">
                  <button
                    onClick={() => {
                      setShowTemplates(false);
                      navigate(`/admin/vendor/${vendorId}`);
                    }}
                    className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStockRequest;

