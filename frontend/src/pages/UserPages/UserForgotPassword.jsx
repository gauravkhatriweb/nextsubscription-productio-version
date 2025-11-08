/**
 * UserForgotPassword.jsx - Password Recovery Initiation Page
 * 
 * Page for users to request a password reset code via email.
 * Sends OTP to users's email address for password recovery.
 * 
 * Key Features:
 * - Email input with validation
 * - Request reset code functionality
 * - Navigation to reset password page after code sent
 * - Error handling with toast notifications
 * 
 * Password Recovery Flow:
 * 1. user enters email address
 * 2. Client-side email validation
 * 3. POST request to /api/users/send-reset-password-otp
 * 4. On success, redirects to reset password page with email in state
 * 5. user receives OTP via email
 * 
 * API Endpoint: POST /api/users/send-reset-password-otp
 * Request Body: { email: string }
 * 
 * @component UserForgotPassword
 */

import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../../assets/branding/nextsubscription_main_logo.png'

/**
 * UserForgotPassword Component
 * 
 * Password recovery initiation form component.
 * 
 * @returns {JSX.Element} Forgot password page component
 */
const UserForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()

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
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const response = await axios.post(`${apiBase}/api/users/send-reset-password-otp`, {
        email: email.trim().toLowerCase()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })

      if (response.data.success) {
        // Show success animation
        setIsSuccess(true)
        toast.success('✅ Email sent. Check your inbox.')
        
        // Navigate to reset password page with email in state after a short delay
        setTimeout(() => {
          navigate('/user/reset-password', { state: { email: email.trim().toLowerCase() } })
        }, 1500)
      }
    } catch (err) {
      console.error('Password reset request error:', err)
      const message = err?.response?.data?.message || 'Failed to send reset OTP. Please try again.'
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
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
                Forgot Your Password?
              </h1>
              <p className='text-base text-[var(--theme-text-secondary)]'>
                Enter your registered email and we'll send you a secure code.
              </p>
            </motion.div>
            
            <motion.form 
              onSubmit={handleSubmit} 
              className='mt-6 space-y-5'
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label htmlFor='email' className='block text-sm font-medium mb-2 text-[var(--theme-text)]'>
                  Email
                </label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)]'>
                    {/* mail icon */}
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5Z' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M5 7L12 12L19 7' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                    </svg>
                  </span>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='you@example.com'
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] pl-10 pr-4 py-3.5 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                  />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <button
                  type='submit'
                  disabled={loading || isSuccess}
                  className={`w-full inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-[var(--theme-shadow-brand)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:ring-offset-2 ${
                    loading || isSuccess 
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
                      Sending…
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </motion.div>
              
              <motion.div 
                className='text-center text-sm text-[var(--theme-text-secondary)]'
                variants={itemVariants}
              >
                <p>💡 Check your spam folder if you don't receive the email within a few minutes</p>
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

export default UserForgotPassword