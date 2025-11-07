/**
 * UserLogin.jsx - User Authentication Page
 * 
 * Login page for users to authenticate and access their account.
 * Handles email/password validation, authentication via UserContext,
 * and provides navigation to registration and password recovery.
 */

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUser } from '../../context/UserContext'
import logo from '../../assets/branding/nextsubscription_main_logo.png'

const UserLogin = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { loginUser } = useUser() // ✅ correct case

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
      // ✅ FIXED: Correct function name
      const result = await loginUser(email, password, true)

      if (!result.success) {
        const msg = result.message || 'Login failed.'
        toast.dismiss()
        toast.error(msg, { toastId: 'login-error' })
        setError(msg)
        setIsSubmitting(false)
        return
      }

      toast.dismiss()
      toast.success('Logged in successfully')
      navigate('/user/home')
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Login failed.'
      setError(message)
      toast.dismiss()
      toast.error(message, { toastId: 'login-error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-theme-base text-theme-primary overflow-hidden'>
      {/* Ambient gradient orbs - refined */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-brand-accent/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-brand-primary/15 via-brand-secondary/10 to-brand-accent/10 blur-3xl opacity-30' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-md'>
          <div className='mb-4 flex items-center justify-center'>
            <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-tertiary'>
              <div className='rounded-2xl bg-theme-base p-3'>
                <img src={logo} alt='Next Subscription logo' className='h-9 w-9' />
              </div>
            </div>
          </div>

          <div className='glass-card rounded-3xl p-8 sm:p-10'>
            <div className='text-center mb-8'>
              <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-theme-primary mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Welcome back</h1>
              <p className='text-base text-theme-secondary'>Sign in to access your subscription dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
              <div>
                <label htmlFor='email' className='block text-sm font-medium mb-1'>Email</label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted'>
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
                    className='w-full rounded-xl border border-theme-base bg-theme-surface pl-10 pr-4 py-3.5 text-sm text-theme-primary placeholder-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-theme'
                  />
                </div>
              </div>

              <div>
                <label htmlFor='password' className='block text-sm font-medium mb-1'>Password</label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted'>
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
                    className='w-full rounded-xl border border-theme-base bg-theme-surface pl-10 pr-12 py-3.5 text-sm text-theme-primary placeholder-theme-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-theme'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-theme-secondary hover:text-theme-primary'
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className='mt-2 flex items-center justify-end'>
                  <Link to='/user/forgot-password' className='text-xs text-theme-secondary hover:text-theme-primary'>
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <div className='rounded-xl border border-error/30 bg-error-light px-4 py-3 text-sm text-error'>
                  {error}
                </div>
              )}

              <button
                type='submit'
                disabled={isSubmitting}
                className={`btn-primary-hover mt-4 inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-theme-brand transition-theme focus:outline-none focus-theme ${isSubmitting ? 'bg-brand-primary/70 opacity-75 cursor-not-allowed' : 'bg-brand-primary'}`}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>

              <div className='mt-3 flex items-center justify-between text-xs text-theme-secondary'>
                <span>Don't have an account?</span>
                <Link to='/user/register' className='font-medium text-theme-primary'>Create account</Link>
              </div>
            </form>
          </div>

          <div className='mt-6 text-center text-xs text-theme-subtle'>
            By continuing, you agree to our
            <Link to='/legal/terms' className='mx-1 text-theme-secondary hover:text-theme-primary transition-theme underline underline-offset-2'>Terms</Link>
            and
            <Link to='/legal/privacy' className='mx-1 text-theme-secondary hover:text-theme-primary transition-theme underline underline-offset-2'>Privacy Policy</Link>.
          </div>
        </section>
      </main>
    </div>
  )
}

export default UserLogin
