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
import { Routes, Route, Navigate } from 'react-router-dom'

// Theme Provider
import { ThemeProvider } from './theme/ThemeProvider'

// Core Pages
import LandingPage from './pages/LandingPage'
import Onboarding from './pages/Onboarding'
import AboutPage from './pages/AboutPage'

// User Pages - Authentication & Profile
import UserLogin from './pages/UserPages/UserLogin'
import UserRegister from './pages/UserPages/UserRegister'
import UserVerifyOtp from './pages/UserPages/UserVerifyOtp'
import UserProfile from './pages/UserPages/UserProfile'
import UserHome from './pages/UserPages/UserHome'
import UserDashboard from './pages/UserPages/UserDashboard'
import UserForgotPassword from './pages/UserPages/UserForgotPassword'
import UserResetPassword from './pages/UserPages/UserResetPassword'
import UserVerifyResetOtp from './pages/UserPages/UserVerifyResetOtp'
import UserResetPasswordFinal from './pages/UserPages/UserResetPasswordFinal'
import UserCheckout from './pages/UserPages/UserCheckout'

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
// NAV: Settings sub-pages
import BrandingPage from './pages/admin/settings/BrandingPage'
import ContentPage from './pages/admin/settings/ContentPage'
import ThemePage from './pages/admin/settings/ThemePage'
import PreviewPage from './pages/admin/settings/PreviewPage'
import SystemMonitoring from './pages/admin/system-monitoring/SystemMonitoring'
import VendorList from './pages/admin/vendor/VendorList'
import VendorCreate from './pages/admin/vendor/VendorCreate'
import VendorDetail from './pages/admin/vendor/VendorDetail'
import ProductRequestsQueue from './pages/admin/productRequests/ProductRequestsQueue'
import AdminStockRequest from './pages/admin/vendor/AdminStockRequest'
import AdminStockRequestsList from './pages/admin/productRequests/AdminStockRequestsList'

// Vendor Pages
import VendorLogin from './pages/vendor/Login'
// CLEANUP: Removed FirstRunSetup import - setup page no longer needed
import VendorDashboard from './pages/vendor/Dashboard'
import ProductsList from './pages/vendor/ProductsList'
import ProductCreate from './pages/vendor/ProductCreate'
import ProductRequestsList from './pages/vendor/ProductRequestsList'
import ProductRequestCreate from './pages/vendor/ProductRequestCreate'
import AdminRequests from './pages/vendor/AdminRequests'
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
    <ThemeProvider>
      <div className="min-h-screen bg-theme-base text-theme-primary antialiased">
        <Routes>
          {/* Core Application Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* User Authentication & Profile Routes */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/verify-otp" element={<UserVerifyOtp />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/home" element={<UserHome />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/forgot-password" element={<UserForgotPassword />} />
          <Route path="/user/verify-reset-otp" element={<UserVerifyResetOtp />} />
          <Route path="/user/reset-password-final" element={<UserResetPasswordFinal />} />
          <Route path="/user/reset-password" element={<UserResetPassword />} />
          <Route path="/user/checkout" element={<UserCheckout />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* NAV: Settings routes with sub-pages */}
          <Route path="/admin/settings" element={<SettingsPage />} />
          <Route path="/admin/settings/branding" element={<BrandingPage />} />
          <Route path="/admin/settings/content" element={<ContentPage />} />
          <Route path="/admin/settings/theme" element={<ThemePage />} />
          <Route path="/admin/settings/preview" element={<PreviewPage />} />
          <Route path="/admin/monitoring" element={<SystemMonitoring />} />
          <Route path="/admin/vendor" element={<VendorList />} />
          <Route path="/admin/vendor/create" element={<VendorCreate />} />
          <Route path="/admin/vendor/:id" element={<VendorDetail />} />
          <Route path="/admin/vendor/:vendorId/requests/new" element={<AdminStockRequest />} />
          <Route path="/admin/requests" element={<ProductRequestsQueue />} />
          <Route path="/admin/stock-requests" element={<AdminStockRequestsList />} />

          {/* Vendor Routes */}
          <Route path="/vendor/login" element={<VendorLogin />} />
          {/* CLEANUP: Removed /vendor/setup route - vendor go directly to dashboard */}
          <Route path="/vendor/setup" element={<Navigate to="/vendor/dashboard" replace />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<ProductsList />} />
          <Route path="/vendor/products/create" element={<ProductCreate />} />
          <Route path="/vendor/products/:id" element={<ProductCreate />} />
          <Route path="/vendor/products/requests" element={<ProductRequestsList />} />
          <Route path="/vendor/products/requests/new" element={<ProductRequestCreate />} />
          <Route path="/vendor/products/requests/:id" element={<ProductRequestCreate />} />
          <Route path="/vendor/requests" element={<AdminRequests />} />
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
    </ThemeProvider>
  )
}

export default App