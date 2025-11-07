/**
 * Admin Dashboard
 * 
 * Main dashboard showing vendor stats, quick actions, and system overview.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import AdminLayout from '../../components/AdminLayout'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    pendingVendors: 0,
    suspendedVendors: 0,
    recentVendors: []
  })
  const [loading, setLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiBase}/api/admin/vendors`, {
        withCredentials: true,
        params: { limit: 5, sort: '-createdAt' }
      })
      if (response.data.success) {
        const vendors = response.data.data || []
        setStats({
          totalVendors: vendors.length,
          activeVendors: vendors.filter(v => v.status === 'active').length,
          pendingVendors: vendors.filter(v => v.status === 'pending').length,
          suspendedVendors: vendors.filter(v => v.status === 'suspended').length,
          recentVendors: vendors.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Failed to fetch vendor stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateWhatsAppMessage = () => {
    const message = `Hello! 👋

This is a message from Next Subscription Admin Portal.

You can use this feature to send quick WhatsApp messages to vendors or team members.

To use:
1. Enter the recipient's WhatsApp number (with country code, e.g., +1234567890)
2. Type your message
3. Click "Generate WhatsApp Link" to create a shareable link
4. Copy the link or open it directly in WhatsApp

Features:
✅ Send vendor credentials
✅ Notify about account status changes
✅ Share important updates
✅ Quick communication

Need help? Contact support.`
    setWhatsappMessage(message)
  }

  const handleGenerateWhatsApp = () => {
    if (!whatsappNumber) {
      toast.error('Please enter a WhatsApp number')
      return
    }
    if (!whatsappMessage) {
      toast.error('Please enter a message')
      return
    }
    const cleanPhone = whatsappNumber.replace(/[^\d+]/g, '')
    const encodedMessage = encodeURIComponent(whatsappMessage)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    
    // Copy to clipboard
    navigator.clipboard.writeText(whatsappUrl)
    toast.success('WhatsApp link copied to clipboard!')
    
    // Open in new tab
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <AdminLayout currentPage="dashboard">
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-theme-secondary">Loading dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

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

        {/* Vendor Stats */}
        <div className="glass-card rounded-3xl p-8 border border-theme-base/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Vendor Management Overview
            </h2>
            <button
              onClick={() => navigate('/admin/vendors')}
              className="px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
            >
              View All →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/admin/vendors')}>
              <div className="text-3xl mb-2">🏢</div>
              <div className="text-3xl font-bold text-theme-primary mb-1">{stats.totalVendors}</div>
              <div className="text-sm text-theme-secondary">Total Vendors</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/admin/vendors?status=active')}>
              <div className="text-3xl mb-2">✅</div>
              <div className="text-3xl font-bold text-success mb-1">{stats.activeVendors}</div>
              <div className="text-sm text-theme-secondary">Active</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/admin/vendors?status=pending')}>
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-3xl font-bold text-warning mb-1">{stats.pendingVendors}</div>
              <div className="text-sm text-theme-secondary">Pending</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border border-theme-base/30 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/admin/vendors?status=suspended')}>
              <div className="text-3xl mb-2">⛔</div>
              <div className="text-3xl font-bold text-error mb-1">{stats.suspendedVendors}</div>
              <div className="text-sm text-theme-secondary">Suspended</div>
            </div>
          </div>

          {/* Recent Vendors */}
          {stats.recentVendors.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-4">Recent Vendors</h3>
              <div className="space-y-2">
                {stats.recentVendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                    className="glass-card rounded-xl p-4 border border-theme-base/30 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-theme-primary">{vendor.companyName}</p>
                        <p className="text-sm text-theme-secondary">{vendor.primaryEmail}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        vendor.status === 'active' ? 'bg-success/20 text-success' :
                        vendor.status === 'pending' ? 'bg-warning/20 text-warning' :
                        vendor.status === 'suspended' ? 'bg-error/20 text-error' :
                        'bg-theme-subtle/20 text-theme-subtle'
                      }`}>
                        {vendor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <button
            onClick={() => navigate('/admin/vendors/create')}
            className='glass-card rounded-2xl p-8 text-left hover:shadow-lg transition-all group border-2 border-transparent hover:border-brand-primary/30'
          >
            <div className='text-5xl mb-4'>🏢</div>
            <h3 className='text-2xl font-bold text-theme-primary mb-3 group-hover:text-brand-primary transition-colors'>
              Create Vendor
            </h3>
            <p className='text-theme-secondary'>
              Create new vendor accounts with email and WhatsApp notifications
            </p>
            <div className="mt-4 text-brand-primary font-semibold group-hover:translate-x-2 transition-transform">
              Create Now →
            </div>
          </button>
          
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className='glass-card rounded-2xl p-8 text-left hover:shadow-lg transition-all group border-2 border-transparent hover:border-brand-primary/30'
          >
            <div className='text-5xl mb-4'>💬</div>
            <h3 className='text-2xl font-bold text-theme-primary mb-3 group-hover:text-brand-primary transition-colors'>
              WhatsApp Messenger
            </h3>
            <p className='text-theme-secondary'>
              Generate WhatsApp links for quick vendor communication
            </p>
            <div className="mt-4 text-brand-primary font-semibold group-hover:translate-x-2 transition-transform">
              Open Messenger →
            </div>
          </button>
          
          <button
            onClick={() => navigate('/admin/settings')}
            className='glass-card rounded-2xl p-8 text-left hover:shadow-lg transition-all group border-2 border-transparent hover:border-brand-primary/30'
          >
            <div className='text-5xl mb-4'>⚙️</div>
            <h3 className='text-2xl font-bold text-theme-primary mb-3 group-hover:text-brand-primary transition-colors'>
              Settings
            </h3>
            <p className='text-theme-secondary'>
              Manage branding, content, theme colors, and site configuration
            </p>
            <div className="mt-4 text-brand-primary font-semibold group-hover:translate-x-2 transition-transform">
              Go to Settings →
            </div>
          </button>
        </div>

        {/* Additional Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <button
            onClick={() => navigate('/admin/monitoring')}
            className='glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-all group border border-theme-base/30 hover:border-brand-primary/30'
          >
            <div className='text-4xl mb-3'>🛰️</div>
            <h3 className='text-xl font-bold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors'>
              System Monitoring
            </h3>
            <p className='text-theme-secondary text-sm'>
              Monitor system health, performance metrics, and system logs
            </p>
          </button>
          
          <button
            onClick={() => navigate('/admin/vendors')}
            className='glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-all group border border-theme-base/30 hover:border-brand-primary/30'
          >
            <div className='text-4xl mb-3'>📋</div>
            <h3 className='text-xl font-bold text-theme-primary mb-2 group-hover:text-brand-primary transition-colors'>
              Manage All Vendors
            </h3>
            <p className='text-theme-secondary text-sm'>
              View, edit, and manage all vendor accounts and their status
            </p>
          </button>
        </div>

        {/* WhatsApp Modal */}
        {showWhatsAppModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 max-w-2xl w-full border border-theme-base/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme-primary" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  WhatsApp Message Generator
                </h2>
                <button
                  onClick={() => setShowWhatsAppModal(false)}
                  className="text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-theme-primary">
                    WhatsApp Number (with country code)
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-theme-primary">
                      Message
                    </label>
                    <button
                      onClick={generateWhatsAppMessage}
                      className="text-xs text-brand-primary hover:text-brand-primary-hover"
                    >
                      Use Template
                    </button>
                  </div>
                  <textarea
                    value={whatsappMessage}
                    onChange={(e) => setWhatsappMessage(e.target.value)}
                    rows={10}
                    placeholder="Type your WhatsApp message here..."
                    className="w-full rounded-xl border border-theme-base/50 bg-theme-surface px-4 py-3 text-theme-primary placeholder:text-theme-subtle"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateWhatsApp}
                    className="flex-1 px-6 py-3 bg-success text-white rounded-xl font-semibold hover:bg-success/90 transition-colors"
                  >
                    📱 Generate & Open WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      if (whatsappMessage) {
                        const cleanPhone = whatsappNumber.replace(/[^\d+]/g, '')
                        const encodedMessage = encodeURIComponent(whatsappMessage)
                        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
                        navigator.clipboard.writeText(whatsappUrl)
                        toast.success('WhatsApp link copied!')
                      }
                    }}
                    className="px-6 py-3 border border-theme-base rounded-xl font-semibold hover:bg-theme-surface transition-colors"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard

