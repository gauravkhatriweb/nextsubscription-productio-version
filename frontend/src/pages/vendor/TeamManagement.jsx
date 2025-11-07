/**
 * Team Management
 * 
 * Manage vendor team members (loaders, support, managers).
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import VendorLayout from '../../components/VendorLayout';

const TeamManagement = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'loader',
    displayName: ''
  });

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000';

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/api/vendor/team`, {
        withCredentials: true
      });
      if (response.data.success) {
        setTeam(response.data.team);
      }
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiBase}/api/vendor/team`, formData, {
        withCredentials: true
      });
      if (response.data.success) {
        toast.success('Team member created! Password: ' + response.data.temporaryPassword);
        setShowForm(false);
        setFormData({ email: '', role: 'loader', displayName: '' });
        fetchTeam();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team member');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      const response = await axios.delete(`${apiBase}/api/vendor/team/${id}`, {
        withCredentials: true
      });
      if (response.data.success) {
        toast.success('Team member removed');
        fetchTeam();
      }
    } catch (error) {
      toast.error('Failed to remove team member');
    }
  };

  if (loading) {
    return (
      <VendorLayout currentPage="team">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading team...</p>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout currentPage="team">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Team Management
            </h1>
            <p className="text-theme-secondary">Manage loaders, support staff, and managers</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors"
          >
            + Add Team Member
          </button>
        </div>

        {/* Add Team Member Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 border border-theme-base/30">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Add Team Member</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-theme-primary">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary"
                >
                  <option value="loader">Loader (Add Stock)</option>
                  <option value="support">Support (View Orders)</option>
                  <option value="manager">Manager (Full Access)</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Team List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map(member => (
            <div key={member._id} className="glass-card rounded-2xl p-6 border border-theme-base/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-theme-primary mb-1">{member.displayName}</h3>
                  <p className="text-sm text-theme-secondary">{member.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  member.status === 'active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                }`}>
                  {member.role}
                </span>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-theme-secondary">Can Add Stock:</span>
                  <span>{member.permissions?.canAddStock ? '✅' : '❌'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-theme-secondary">Can View Orders:</span>
                  <span>{member.permissions?.canViewOrders ? '✅' : '❌'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-theme-secondary">Can Manage Products:</span>
                  <span>{member.permissions?.canManageProducts ? '✅' : '❌'}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(member._id)}
                className="w-full px-4 py-2 border border-error text-error rounded-lg font-semibold hover:bg-error/10 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {team.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center border border-theme-base/30">
            <p className="text-theme-secondary mb-4">No team members yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-primary-hover transition-colors"
            >
              Add Your First Team Member
            </button>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default TeamManagement;

