/**
 * UserVerifyResetOtp.jsx - OTP Verification for Password Reset
 * 
 * Page for users to verify their password reset request using a 6-digit OTP.
 * Features individual input boxes for each digit, auto-focus, paste support,
 * and Framer Motion animations.
 * 
 * Key Features:
 * - 6 individual OTP input boxes with auto-focus navigation
 * - Paste support for complete OTP strings
 * - Framer Motion animations for focus and transitions
 * - Resend OTP functionality
 * - Error handling with toast notifications
 * 
 * Verification Flow:
 * 1. User receives OTP via email after requesting password reset
 * 2. Enters 6-digit OTP in individual boxes
 * 3. POST request to verify OTP
 * 4. On success, redirects to reset password page
 * 
 * @component UserVerifyResetOtp
 */

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../../assets/branding/nextsubscription_main_logo.png'

/**
 * UserVerifyResetOtp Component
 * 
 * OTP verification form with individual digit inputs and animations.
 * 
 * @returns {JSX.Element} OTP verification page component
 */
const UserVerifyResetOtp = () => {
  // Store OTP as array of 6 digits for individual input boxes
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email from navigation state or redirect if not present
  const email = location.state?.email
  
  // Refs for each input box to handle focus management
  const inputRefs = useRef([])
  
  /**
   * Timer States
   */
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0) // 1 minute cooldown

  // Redirect to forgot password if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Please request a password reset first')
      navigate('/user/forgot-password')
    }
  }, [email, navigate])

  /**
   * Handle Individual Input Changes
   * 
   * Updates OTP array and auto-focuses next input when current is filled.
   * Only allows single digit per input.
   * 
   * @param {number} index - Index of the input box (0-5)
   * @param {string} value - Input value (single digit)
   */
  const handleInputChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  /**
   * Handle Paste Functionality
   * 
   * Allows user to paste complete 6-digit OTP from clipboard.
   * Automatically fills all input boxes and focuses last input.
   * 
   * @param {ClipboardEvent} e - Paste event
   */
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '') // Remove non-digits
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('').slice(0, 6)
      setOtp(newOtp)
      // Focus last input after paste
      inputRefs.current[5]?.focus()
    }
  }
  
  /**
   * Handle Backspace Navigation
   * 
   * Moves focus to previous input when backspace is pressed on empty input.
   * 
   * @param {number} index - Current input index
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  // Resend cooldown timer (1 minute)
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCooldown, canResend])
  
  /**
   * Handle Resend OTP
   * 
   * Requests a new OTP from the backend API.
   * Clears existing OTP, and applies cooldown.
   */
  const handleResendOtp = async () => {
    if (!canResend || resendCooldown > 0 || !email) return
    
    try {
      setCanResend(false)
      setResendCooldown(60) // 1 minute cooldown
      
      const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
      await axios.post(`${apiBase}/api/users/send-reset-password-otp`, {
        email: email?.toLowerCase()?.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      // Clear existing OTP
      setOtp(['', '', '', '', '', ''])
      // Focus first input
      inputRefs.current[0]?.focus()
      
      toast.success('New reset code sent to your email')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to send reset code'
      toast.error(msg)
      setCanResend(true)
      setResendCooldown(0)
    }
  }
  
  /**
   * Handle Form Submission
   * 
   * Validates complete OTP and sends verification request to API.
   * On success, redirects user to reset password page.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
      return
    }
    
    setLoading(true)
    try {
      // Show success animation
      setIsSuccess(true)
      
      // Navigate to reset password page with email and OTP after a short delay
      setTimeout(() => {
        navigate('/user/reset-password-final', { state: { email: email, otp: otpString } })
      }, 1500)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid or expired OTP'
      toast.error(msg)
      setLoading(false)
      setIsSuccess(false)
    }
  }

  // Don't render if no email
  if (!email) {
    return null
  }

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

  // OTP input animation variants
  const otpInputVariants = {
    focus: { scale: 1.1, y: -5 },
    blur: { scale: 1, y: 0 }
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
                Verify Your Account
              </h1>
              <p className='text-base text-[var(--theme-text-secondary)]'>
                Enter the code sent to your email to continue.
              </p>
            </motion.div>
            
            <motion.form 
              onSubmit={handleSubmit} 
              className='mt-6 space-y-6'
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <label className='block text-sm font-medium mb-3 text-center text-[var(--theme-text)]'>
                  Enter 6-digit code
                </label>
                
                {/* Individual OTP input boxes with animations */}
                <div className='flex justify-center gap-3 mb-4'>
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type='text'
                      inputMode='numeric'
                      maxLength='1'
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/, ''))}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      variants={otpInputVariants}
                      whileFocus="focus"
                      className='w-12 h-12 text-center text-lg font-bold rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>
                
                <p className='text-xs text-[var(--theme-text-subtle)] text-center'>
                  💡 Tip: You can paste your 6-digit code directly
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <button
                  type='submit'
                  disabled={loading || isSuccess || otp.join('').length !== 6}
                  className={`w-full inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-[var(--theme-shadow-brand)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:ring-offset-2 ${
                    loading || isSuccess || otp.join('').length !== 6
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
                      Verifying…
                    </div>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </motion.div>
              
              <motion.div 
                className='text-center text-sm text-[var(--theme-text-secondary)]'
                variants={itemVariants}
              >
                <p>
                  Didn't receive the code?{' '}
                  <button
                    type='button'
                    disabled={!canResend || resendCooldown > 0}
                    onClick={handleResendOtp}
                    className={`font-medium transition-colors ${
                      canResend && resendCooldown === 0
                        ? 'text-[var(--theme-primary)] hover:text-[var(--theme-primary)] cursor-pointer'
                        : 'text-[var(--theme-text-subtle)] cursor-not-allowed'
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
                  </button>
                </p>
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

export default UserVerifyResetOtp