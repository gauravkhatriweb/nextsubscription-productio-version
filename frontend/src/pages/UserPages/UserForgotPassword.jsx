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
  const navigate = useNavigate()

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
        toast.success('Password reset OTP sent to your email')
        // Navigate to reset password page with email in state
        navigate('/user/reset-password', { state: { email: email.trim().toLowerCase() } })
      }
    } catch (err) {
      console.error('Password reset request error:', err)
      const message = err?.response?.data?.message || 'Failed to send reset OTP. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-theme-background text-theme-primary overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-primary blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-secondary blur-3xl opacity-25' />
      
      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
          {/* Logo following brand guidelines */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-primary'>
              <div className='rounded-2xl bg-theme-background p-3'>
                <img src={logo} alt='Next Subscription logo' className='h-9 w-9' />
              </div>
            </div>
          </div>
          
          <div className='rounded-2xl glass-border glass-bg p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Reset your password
              </h1>
              <p className='mt-2 text-sm text-theme-secondary' style={{ fontFamily: 'Inter, system-ui' }}>
                Enter your email address and we'll send you a code to reset your password.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium mb-2' style={{ fontFamily: 'Inter, system-ui' }}>
                  Email Address
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email address'
                  className='block w-full rounded-lg glass-border bg-theme-surface px-4 py-3 text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200'
                  style={{ fontFamily: 'Inter, system-ui' }}
                />
              </div>
              
              <button
                type='submit'
                disabled={loading}
                className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm sm:text-base font-bold text-theme-primary shadow-[0_8px_30px_rgb(0,0,0,0.35)] glass-border transition-[transform,background-color,opacity] duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                  loading
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-brand-primary hover:brightness-110'
                }`}
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                {loading ? (
                  <>
                    <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-theme-primary' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                    </svg>
                    Send Reset Code
                  </>
                )}
              </button>
              
              {/* Additional info */}
              <div className='text-center'>
                <p className='text-xs text-theme-muted' style={{ fontFamily: 'Inter, system-ui' }}>
                  💡 Check your spam folder if you don't receive the email within a few minutes
                </p>
              </div>
            </form>
          </div>
          
          {/* Navigation help */}
          <div className='mt-6 text-center space-y-2'>
            <Link
              to='/user/login'
              className='block text-xs text-theme-muted hover:text-theme-primary transition-colors'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              ← Back to Login
            </Link>
            <div className='text-xs text-theme-muted' style={{ fontFamily: 'Inter, system-ui' }}>
              Don't have an account?{' '}
              <Link
                to='/user/register'
                className='text-brand-primary hover:text-brand-secondary transition-colors'
              >
                Sign up
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default UserForgotPassword