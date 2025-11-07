/**
 * Products List
 * 
 * Displays all vendor products with filters and actions.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';

const ProductsList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', provider: '' });

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/api/vendor/products`, {
        withCredentials: true,
        params: filters
      });
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await axios.delete(`${apiBase}/api/vendor/products/${id}`, {
        withCredentials: true
      });
      if (response.data.success) {
        toast.success('Product deleted');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <VendorLayout currentPage="products">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading products...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout currentPage="products">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Products
            </h1>
            <p className="text-theme-secondary">Manage your product listings</p>
          </div>
          <button
            onClick={() => navigate('/vendor/products/create')}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors"
          >
            + Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 flex gap-4 border border-theme-base/30">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.provider}
            onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
            className="rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-2 text-theme-primary"
          >
            <option value="">All Providers</option>
            <option value="netflix">Netflix</option>
            <option value="spotify">Spotify</option>
            <option value="adobe">Adobe</option>
            <option value="disney">Disney+</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all border border-theme-base/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-theme-primary mb-1">{product.title}</h3>
                  <p className="text-sm text-theme-secondary">{product.provider}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  product.status === 'active' ? 'bg-success/20 text-success' :
                  product.status === 'pending' ? 'bg-warning/20 text-warning' :
                  'bg-theme-surface text-theme-subtle'
                }`}>
                  {product.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-theme-secondary">Price:</span>
                  <span className="font-semibold text-theme-primary">${product.priceDecimal} {product.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-secondary">Stock:</span>
                  <span className="font-semibold text-theme-primary">{product.stock}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-secondary">Duration:</span>
                  <span className="font-semibold text-theme-primary">{product.planDurationDays} days</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/vendor/products/${product._id}`)}
                  className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary-hover transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="px-4 py-2 border border-error text-error rounded-lg font-semibold hover:bg-error/10 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center border border-theme-base/30">
            <p className="text-theme-secondary mb-4">No products found</p>
            <button
              onClick={() => navigate('/vendor/products/create')}
              className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors"
            >
              Create Your First Product
            </button>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default ProductsList;

