/**
 * UserResetPasswordFinal.jsx - Final Password Reset Page
 * 
 * Page for users to set a new password after OTP verification.
 * Features password strength validation and Framer Motion animations.
 * 
 * Key Features:
 * - New password and confirm password inputs
 * - Password visibility toggle
 * - Password strength validation
 * - Framer Motion animations
 * - Error handling with toast notifications
 * 
 * Password Reset Flow:
 * 1. User enters new password and confirmation
 * 2. Client-side validation (password match, password strength)
 * 3. POST request to reset password
 * 4. On success, redirects to login page
 * 
 * @component UserResetPasswordFinal
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../../assets/branding/nextsubscription_main_logo.png'

/**
 * UserResetPasswordFinal Component
 * 
 * Final password reset form with password creation.
 * 
 * @returns {JSX.Element} Reset password page component
 */
const UserResetPasswordFinal = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email and OTP from navigation state or redirect if not present
  const email = location.state?.email
  const otp = location.state?.otp
  
  // Redirect to forgot password if no email or OTP provided
  useEffect(() => {
    if (!email || !otp) {
      toast.error('Invalid password reset request')
      navigate('/user/forgot-password')
    }
  }, [email, otp, navigate])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!email || !email.trim()) {
      toast.error('Email is missing. Please request a password reset again.')
      navigate('/user/forgot-password')
      return
    }

    if (!otp || otp.length !== 6) {
      toast.error('Invalid OTP. Please request a new password reset.')
      navigate('/user/forgot-password')
      return
    }

    if (!newPassword.trim()) {
      toast.error('Please enter a new password')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      // Normalize email before sending
      const normalizedEmail = email.toLowerCase().trim()
      
      const response = await axios.post(`${apiBase}/api/users/reset-password`, {
        email: normalizedEmail,
        otp: otp,
        newPassword: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.data.success) {
        // Show success animation
        setIsSuccess(true)
        toast.success('✅ Password updated successfully.')
        
        // Navigate to login page after a short delay
        setTimeout(() => {
          navigate('/user/login')
        }, 1500)
      }
    } catch (err) {
      // Extract error message from response
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to reset password. Please try again.'
      
      // Show user-friendly error message
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  // Don't render if no email or OTP
  if (!email || !otp) {
    return null
  }

  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-primary)]/15 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-30' />
      
      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
          {/* Animated logo */}
          <motion.div 
            className='mb-8 flex items-center justify-center'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-accent)] to-[var(--theme-secondary)]'>
              <div className='rounded-2xl bg-[var(--theme-background)] p-3'>
                <img src={logo} alt='Next Subscription logo' className='h-9 w-9' />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className='rounded-3xl p-8 sm:p-10 backdrop-blur-md border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] shadow-[var(--theme-glass-shadow)]'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className='text-center mb-8'
              variants={itemVariants}
            >
              <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-[var(--theme-text)] mb-3' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Reset Your Password
              </h1>
              <p className='text-base text-[var(--theme-text-secondary)]'>
                Create a new password for your account
              </p>
            </motion.div>
            
            <motion.form 
              onSubmit={handleSubmit} 
              className='mt-6 space-y-5'
              variants={containerVariants}
            >
              {/* Password Input Section */}
              <motion.div variants={itemVariants}>
                <label htmlFor='newPassword' className='block text-sm font-medium mb-2 text-[var(--theme-text)]'>
                  New Password
                </label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)]'>
                    {/* lock icon */}
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <rect x='4.75' y='10' width='14.5' height='9.5' rx='2.25' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M8 10V8.5C8 6.01472 10.0147 4 12.5 4V4C14.9853 4 17 6.01472 17 8.5V10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                    </svg>
                  </span>
                  <input
                    id='newPassword'
                    name='newPassword'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='Create a password'
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] pl-10 pr-12 py-3.5 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition-colors duration-200'
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor='confirmPassword' className='block text-sm font-medium mb-2 text-[var(--theme-text)]'>
                  Confirm New Password
                </label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)]'>
                    {/* lock icon */}
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <rect x='4.75' y='10' width='14.5' height='9.5' rx='2.25' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M8 10V8.5C8 6.01472 10.0147 4 12.5 4V4C14.9853 4 17 6.01472 17 8.5V10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                    </svg>
                  </span>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Re-enter your password'
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] pl-10 pr-12 py-3.5 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition-colors duration-200'
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </motion.div>

              {/* Password requirements */}
              <motion.div 
                className='text-xs space-y-1'
                variants={itemVariants}
              >
                <div className='flex items-center gap-2 text-[var(--theme-text-subtle)]'>
                  <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-[var(--theme-success)]' : 'bg-gray-500'}`} />
                  <span>At least 6 characters</span>
                </div>
                <div className='flex items-center gap-2 text-[var(--theme-text-subtle)]'>
                  <div className={`w-2 h-2 rounded-full ${newPassword && confirmPassword && newPassword === confirmPassword ? 'bg-[var(--theme-success)]' : 'bg-gray-500'}`} />
                  <span>Passwords match</span>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <button
                  type='submit'
                  disabled={loading || isSuccess || !newPassword || !confirmPassword}
                  className={`w-full inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-[var(--theme-shadow-brand)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:ring-offset-2 ${
                    loading || isSuccess || !newPassword || !confirmPassword
                      ? 'bg-[var(--theme-primary)]/70 opacity-75 cursor-not-allowed' 
                      : 'bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(228,54,54,0.4)]'
                  }`}
                >
                  {isSuccess ? (
                    <div className='flex items-center'>
                      <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                      </svg>
                      Success!
                    </div>
                  ) : loading ? (
                    <div className='flex items-center'>
                      <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      Resetting Password…
                    </div>
                  ) : (
                    'Reset Password Securely'
                  )}
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
          
          {/* Navigation help */}
          <motion.div 
            className='mt-6 text-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to='/user/login'
              className='text-sm text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors duration-200'
            >
              ← Back to Login
            </Link>
          </motion.div>
        </section>
      </main>
    </div>
  )
}

export default UserResetPasswordFinal