/**
 * Admin Dashboard
 * 
 * Main dashboard showing vendor stats, quick actions, and system overview.
 * 
 * @component
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'

const AdminDashboard = () => {
  const navigate = useNavigate()

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card rounded-3xl p-8 border border-theme-base/30">
          <h1 className='text-4xl font-bold text-theme-primary mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Admin Dashboard
          </h1>
          <p className="text-theme-secondary">
            Manage your platform settings, vendors, and system health
          </p>
        </div>

        {/* Quick Links */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <button
            onClick={() => navigate('/admin/vendors')}
            className='glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-all border border-theme-base/30 hover:border-brand-primary/30'
          >
            <div className='text-4xl mb-3'>📋</div>
            <h3 className='text-xl font-bold text-theme-primary mb-2'>Vendor Management</h3>
            <p className='text-theme-secondary text-sm'>Deep-dive into vendor accounts, passwords, and onboarding tasks.</p>
          </button>

          <button
            onClick={() => navigate('/admin/monitoring')}
            className='glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-all border border-theme-base/30 hover:border-brand-primary/30'
          >
            <div className='text-4xl mb-3'>🛰️</div>
            <h3 className='text-xl font-bold text-theme-primary mb-2'>System Monitoring</h3>
            <p className='text-theme-secondary text-sm'>Track live system health, latency, and maintenance operations.</p>
          </button>

          <button
            onClick={() => navigate('/admin/settings')}
            className='glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-all border border-theme-base/30 hover:border-brand-primary/30'
          >
            <div className='text-4xl mb-3'>🎨</div>
            <h3 className='text-xl font-bold text-theme-primary mb-2'>Brand & Content</h3>
            <p className='text-theme-secondary text-sm'>Refresh branding assets, hero copy, and theme colors.</p>
          </button>
        </div>

      </div>
    </AdminLayout>
  )
}

export default AdminDashboard

