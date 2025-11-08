/**
 * UserLogin.jsx - User Authentication Page
 * 
 * Login page for users to authenticate and access their account.
 * Handles email/password validation, authentication via UserContext,
 * and provides navigation to registration and password recovery.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import { motion } from 'framer-motion'
import logo from '../../assets/branding/nextsubscription_main_logo.png'

const UserLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { loginUser } = useUser()

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
    setError('')

    // Client-side validation
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await loginUser(email, password, true)

      if (!result.success) {
        const msg = result.message || 'Login failed.'
        toast.dismiss()
        toast.error(msg, { toastId: 'login-error' })
        setError(msg)
        setIsSubmitting(false)
        return
      }

      // Show success animation
      setIsSuccess(true)
      toast.dismiss()
      toast.success('Logged in successfully')
      
      // Navigate after a short delay to show success animation
      setTimeout(() => {
        navigate('/user/home')
      }, 1000)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Login failed.'
      setError(message)
      toast.dismiss()
      toast.error(message, { toastId: 'login-error' })
      setIsSubmitting(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      {/* Ambient gradient orbs - refined */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-primary)]/15 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-30' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
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
                Welcome Back
              </h1>
              <p className='text-base text-[var(--theme-text-secondary)]'>
                Access your subscriptions and continue saving
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
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M4 6.5C4 5.67157 4.67157 5 5.5 5H18.5C19.3284 5 20 5.67157 20 6.5V17.5C20 18.3284 19.3284 19 18.5 19H5.5C4.67157 19 4 18.3284 4 17.5V6.5Z' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M5 7L12 12L19 7' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                    </svg>
                  </span>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='you@example.com'
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] pl-10 pr-4 py-3.5 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor='password' className='block text-sm font-medium mb-2 text-[var(--theme-text)]'>
                  Password
                </label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-text-subtle)]'>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <rect x='4.75' y='10' width='14.5' height='9.5' rx='2.25' stroke='currentColor' strokeWidth='1.5'/>
                      <path d='M8 10V8.5C8 6.01472 10.0147 4 12.5 4V4C14.9853 4 17 6.01472 17 8.5V10' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/>
                    </svg>
                  </span>
                  <input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='••••••••'
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] pl-10 pr-12 py-3.5 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] transition-colors duration-200'
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className='mt-2 flex items-center justify-end'>
                  <Link 
                    to='/user/forgot-password' 
                    className='text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors duration-200'
                  >
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              {error && (
                <motion.div 
                  className='rounded-xl border border-[var(--theme-error)]/30 bg-[var(--theme-error-light)] px-4 py-3 text-sm text-[var(--theme-error)]'
                  variants={itemVariants}
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <button
                  type='submit'
                  disabled={isSubmitting || isSuccess}
                  className={`w-full inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-[var(--theme-shadow-brand)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:ring-offset-2 ${
                    isSubmitting || isSuccess 
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
                  ) : isSubmitting ? (
                    <div className='flex items-center'>
                      <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      Signing in…
                    </div>
                  ) : (
                    'Login Securely'
                  )}
                </button>
              </motion.div>

              <motion.div 
                className='flex items-center justify-between text-sm text-[var(--theme-text-secondary)]'
                variants={itemVariants}
              >
                <span>Don't have an account?</span>
                <Link 
                  to='/user/register' 
                  className='font-medium text-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-colors duration-200'
                >
                  Create account
                </Link>
              </motion.div>
            </motion.form>
          </motion.div>

          <motion.div 
            className='mt-6 text-center text-xs text-[var(--theme-text-subtle)]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            By continuing, you agree to our
            <Link 
              to='/legal/terms' 
              className='mx-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors duration-200 underline underline-offset-2'
            >
              Terms
            </Link>
            and
            <Link 
              to='/legal/privacy' 
              className='mx-1 text-[var(--theme-text-secondary)] hover:text-[var(--theme-primary)] transition-colors duration-200 underline underline-offset-2'
            >
              Privacy Policy
            </Link>.
          </motion.div>
        </section>
      </main>
    </div>
  )
}

export default UserLogin