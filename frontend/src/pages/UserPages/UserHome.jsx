/**
 * UserHome.jsx - user Dashboard Page
 * 
 * Main dashboard page for authenticated users. Displays personalized content,
 * quick actions, and subscription management interface.
 * 
 * Key Features:
 * - Welcome header with user name
 * - Promotional banners (dismissible)
 * - Primary "Manage Subscriptions" CTA
 * - Quick action grid (Schedule, Notifications, Saved Services, Wallet, History, Promotions)
 * - Payment method display
 * - Safety & Support section
 * - Language selector
 * - Recent subscriptions display
 * - Profile data fetching from API
 * 
 * Authentication:
 * - Protected route: Requires user authentication
 * - Redirects to login if not authenticated
 * - Fetches user profile on mount
 * 
 * API Endpoints:
 * - GET /api/users/profile - Fetch user profile data
 * 
 * @component
 */

import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import Navbar from '../../components/Navbar'
import axios from 'axios'

// Design tokens are now centralized in ThemeTokens.css and tailwind.config.js

/**
 * Animation Configuration
 * 
 * Reusable animation variants for consistent motion effects across the dashboard.
 */
const animations = {
  spring: { type: 'spring', damping: 25, stiffness: 200 },
  easeOut: { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] },
  easeIn: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
  bounce: { type: 'spring', damping: 15, stiffness: 300 }
}

/**
 * Format Currency Display
 * 
 * Formats a number as currency with proper formatting.
 * 
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "$280")
 */
const formatCurrencyDisplay = (amount) => {
  return `$${amount}`
}

/**
 * userHome Component
 * 
 * Main dashboard component for authenticated users.
 * 
 * @returns {JSX.Element} user dashboard page component
 */
const UserHome = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isInitialized } = useUser()

  // Redirect to new dashboard
  useEffect(() => {
    if (isInitialized && isAuthenticated && user && user.type === 'user') {
      navigate('/user/dashboard')
    } else if (isInitialized && (!isAuthenticated || !user || user.type !== 'user')) {
      navigate('/user/login')
    }
  }, [isAuthenticated, user, navigate, isInitialized])

  // Show loading state while redirecting
  return (
    <div className='flex items-center justify-center min-h-screen bg-[var(--theme-background)]'>
      <div className='text-[var(--theme-text)]'>Redirecting to dashboard...</div>
    </div>
  )
}

export default UserHome