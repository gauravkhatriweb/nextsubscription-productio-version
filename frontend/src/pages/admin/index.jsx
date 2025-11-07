/**
 * Admin Login Page
 * 
 * Admin authentication flow with email input and one-time code verification.
 * 
 * @component
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import logo from '../../assets/branding/nextsubscription_main_logo.png'
import AdminWarning from '../../components/AdminWarning'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'code'
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleRequestCode = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const response = await axios.post(`${apiBase}/api/admin/request-code`, {
        email: email.trim().toLowerCase()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      })

      if (response.data.success) {
        toast.success('Secret code sent to admin email. Please check your inbox.')
        setCodeSent(true)
        setStep('code')
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Failed to send admin code. Please try again.'
      
      if (err?.response?.status === 403) {
        toast.error('This email is not recognized as admin.')
      } else if (err?.response?.status === 429) {
        toast.error('Too many requests. Please try again later.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    
    if (!code.trim()) {
      toast.error('Please enter the admin code')
      return
    }

    if (code.trim().length < 20) {
      toast.error('The admin code must be at least 20 characters long')
      return
    }

    setLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      
      const response = await axios.post(`${apiBase}/api/admin/verify-code`, {
        email: email.trim().toLowerCase(),
        code: code.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      })

      if (response.data.success) {
        toast.success('Admin authenticated successfully')
        
        // Store token if provided (for client-side use)
        if (response.data.token) {
          // Store in memory only (not localStorage to reduce XSS risk)
          // The server also sets an httpOnly cookie
          sessionStorage.setItem('adminToken', response.data.token)
        }
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard')
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Invalid or expired code. Please try again.'
      
      if (err?.response?.status === 429) {
        toast.error('Too many verification attempts. Please try again later.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-theme-base text-theme-primary overflow-hidden'>
      {/* Ambient gradient orbs - refined */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-brand-accent/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-brand-primary/15 via-brand-secondary/10 to-brand-accent/10 blur-3xl opacity-30' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6 py-12'>
        <section className='w-full max-w-md'>
          {/* Logo */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent'>
              <div className='rounded-2xl bg-theme-base p-3'>
                <img src={logo} alt='Next Subscription logo' className='h-9 w-9' />
              </div>
            </div>
          </div>

          {/* Warning */}
          <AdminWarning />

          {/* Email Form */}
          {step === 'email' && (
            <div className='glass-card rounded-3xl p-8 sm:p-10'>
              <div className='text-center mb-8'>
                <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-theme-primary mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  Admin Portal
                </h1>
                <p className='text-base text-theme-secondary'>Enter your admin email to receive a one-time access code</p>
              </div>

              <form onSubmit={handleRequestCode} className='space-y-6'>
                <div>
                  <label htmlFor='adminEmail' className='block text-sm font-medium mb-2 text-theme-primary'>
                    Admin Email
                  </label>
                  <div className='relative'>
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-subtle'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5Z' stroke='currentColor' strokeWidth='1.5'/>
                        <path d='M5 7L12 12L19 7' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                      </svg>
                    </span>
                    <input
                      id='adminEmail'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='admin@example.com'
                      className='w-full rounded-xl border border-theme-base bg-theme-surface pl-10 pr-4 py-3.5 text-sm text-theme-primary placeholder-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-theme'
                      autoComplete='email'
                      required
                    />
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className={`btn-primary-hover w-full inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-theme-brand transition-theme focus:outline-none focus-theme ${loading ? 'bg-brand-primary/70 opacity-75 cursor-not-allowed' : 'bg-brand-primary'}`}
                >
                  {loading ? 'Sending Code…' : 'Request Admin Code'}
                </button>
              </form>
            </div>
          )}

          {/* Code Verification Form */}
          {step === 'code' && (
            <div className='glass-card rounded-3xl p-8 sm:p-10'>
              <div className='text-center mb-8'>
                <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-theme-primary mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  Enter Admin Code
                </h1>
                <p className='text-base text-theme-secondary'>
                  Check your email for the one-time access code
                </p>
                {codeSent && (
                  <p className='text-sm text-success mt-2'>✓ Code sent to {email}</p>
                )}
              </div>

              <form onSubmit={handleVerifyCode} className='space-y-6'>
                <div>
                  <label htmlFor='adminCode' className='block text-sm font-medium mb-2 text-theme-primary'>
                    Admin Access Code
                  </label>
                  <input
                    id='adminCode'
                    type='text'
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder='Paste your code here (20-30 characters)'
                    className='w-full rounded-xl border border-theme-base bg-theme-surface px-4 py-3.5 text-sm text-theme-primary placeholder-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-theme font-mono'
                    autoComplete='off'
                    autoFocus
                    required
                  />
                  <p className='mt-2 text-xs text-theme-subtle'>
                    The code is long and includes letters, numbers, and symbols — paste exactly as received.
                  </p>
                </div>

                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => {
                      setStep('email')
                      setCode('')
                    }}
                    className='flex-1 rounded-full border-2 border-theme-base px-6 py-3.5 text-sm font-semibold text-theme-primary hover:bg-surface-hover transition-theme focus:outline-none focus-theme'
                  >
                    Back
                  </button>
                  <button
                    type='submit'
                    disabled={loading || code.trim().length < 20}
                    className={`btn-primary-hover flex-1 inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-theme-brand transition-theme focus:outline-none focus-theme ${loading || code.trim().length < 20 ? 'bg-brand-primary/70 opacity-75 cursor-not-allowed' : 'bg-brand-primary'}`}
                  >
                    {loading ? 'Verifying…' : 'Verify & Sign In'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminLogin

