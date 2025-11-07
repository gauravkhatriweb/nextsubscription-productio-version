/**
 * App.jsx - Main Application Router
 * 
 * This is the root component that defines all application routes for the Next Subscription platform.
 * It handles routing for both user and provider user flows, including authentication,
 * profile management, and legal pages. The app uses React Router for client-side navigation
 * and implements error boundaries for critical functionality.
 * 
 * Key Features:
 * - Dual user type routing (users and providers)
 * - Authentication flow with OTP verification
 * - Password reset functionality
 * - Subscription management with error boundary protection
 * - Legal compliance pages
 * - 404 error handling
 */

import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Core Pages
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import AboutPage from './pages/AboutPage'

// User Pages - Authentication & Profile
import UserLogin from './pages/UserPages/UserLogin'
import UserRegister from './pages/UserPages/UserRegister'
import UserVerifyOtp from './pages/UserPages/UserVerifyOtp'
import UserProfile from './pages/UserPages/UserProfile'
import UserHome from './pages/UserPages/UserHome'
import UserForgotPassword from './pages/UserPages/UserForgotPassword'
import UserResetPassword from './pages/UserPages/UserResetPassword'

// Legal & Support Pages  
import TermsPage from './pages/legalPages/TermsPage'
import PrivacyPage from './pages/legalPages/PrivacyPage'
import ContactPage from './pages/legalPages/ContactPage'
import FAQPage from './pages/legalPages/FAQPage'

// Error Handling
import NotFound from './pages/errorPages/NotFound'

// Admin Pages
import AdminLogin from './pages/admin/index'
import AdminDashboard from './pages/admin/dashboard'
import SettingsPage from './pages/admin/settings/SettingsPage'
import SystemMonitoring from './pages/admin/system-monitoring/SystemMonitoring'
import VendorsList from './pages/admin/vendors/VendorsList'
import VendorCreate from './pages/admin/vendors/VendorCreate'
import VendorDetail from './pages/admin/vendors/VendorDetail'

// Vendor Pages
import VendorLogin from './pages/vendor/Login'
import FirstRunSetup from './pages/vendor/FirstRunSetup'
import VendorDashboard from './pages/vendor/Dashboard'
import ProductsList from './pages/vendor/ProductsList'
import ProductCreate from './pages/vendor/ProductCreate'
import OrdersList from './pages/vendor/OrdersList'
import TeamManagement from './pages/vendor/TeamManagement'
import Reports from './pages/vendor/Reports'


/**
 * Main App Component
 * 
 * Renders the application router with all defined routes. Uses theme-based styling
 * for consistent dark mode appearance across the platform.
 * 
 * @returns {JSX.Element} The main application component with routing
 */
const App = () => {
  return (
    <div className="min-h-screen bg-theme-base text-theme-primary antialiased">
      <Routes>
        {/* Core Application Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* User Authentication & Profile Routes */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/verify-otp" element={<UserVerifyOtp />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/home" element={<UserHome />} />
        <Route path="/user/forgot-password" element={<UserForgotPassword />} />
        <Route path="/user/reset-password" element={<UserResetPassword />} />

        {/* Admin Routes */}  
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/monitoring" element={<SystemMonitoring />} />
        <Route path="/admin/vendors" element={<VendorsList />} />
        <Route path="/admin/vendors/create" element={<VendorCreate />} />
        <Route path="/admin/vendors/:id" element={<VendorDetail />} />

        {/* Vendor Routes */}
        <Route path="/vendor/login" element={<VendorLogin />} />
        <Route path="/vendor/setup" element={<FirstRunSetup />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<ProductsList />} />
        <Route path="/vendor/products/create" element={<ProductCreate />} />
        <Route path="/vendor/products/:id" element={<ProductCreate />} />
        <Route path="/vendor/orders" element={<OrdersList />} />
        <Route path="/vendor/team" element={<TeamManagement />} />
        <Route path="/vendor/reports" element={<Reports />} />

        
        {/* Legal & Compliance Pages */}
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/contact" element={<ContactPage />} />
        <Route path="/legal/faq" element={<FAQPage />} />
        
        {/* 404 Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App