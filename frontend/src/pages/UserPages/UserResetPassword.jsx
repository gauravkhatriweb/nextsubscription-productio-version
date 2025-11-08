/**
 * UserResetPassword.jsx - Password Reset Page
 * 
 * Page for users to reset their password using OTP received via email.
 * Combines OTP verification with new password creation.
 * 
 * Key Features:
 * - 6 individual OTP input boxes with auto-focus navigation
 * - Paste support for complete OTP strings
 * - New password and confirm password inputs
 * - Password visibility toggle
 * - Password strength validation
 * - 10-minute countdown timer
 * - Resend OTP functionality with cooldown
 * - Error handling with toast notifications
 * 
 * Password Reset Flow:
 * 1. User receives OTP via email from forgot password page
 * 2. Enters 6-digit OTP and new password
 * 3. Client-side validation (OTP length, password match, password strength)
 * 4. POST request to /api/users/reset-password
 * 5. On success, redirects to login page
 * 
 * API Endpoints:
 * - POST /api/users/reset-password - Reset password with OTP
 * - POST /api/users/send-reset-password-otp - Resend reset code
 * 
 * @component
 */

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../../assets/branding/nextsubscription_main_logo.png'

/**
 * UserResetPassword Component
 * 
 * Password reset form with OTP verification and password creation.
 * 
 * @returns {JSX.Element} Reset password page component
 */
const UserResetPassword = () => {
  // Store OTP as array of 6 digits for individual input boxes
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get email from navigation state or redirect if not present
  const email = location.state?.email
  
  // Refs for each input box to handle focus management
  const inputRefs = useRef([])
  
  // Timer states for countdown and resend functionality
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(true)
  const [resendCooldown, setResendCooldown] = useState(0) // 1 minute cooldown

  // Redirect to forgot password if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('Please request a password reset first')
      navigate('/user/forgot-password')
    }
  }, [email, navigate])

  // Handle individual OTP input changes
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
  
  // Handle paste functionality - auto-fill all boxes
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
  
  // Handle backspace to move to previous input
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  // Auto-focus first input on component mount and start countdown
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])
  
  // Main countdown timer (10 minutes)
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Time expired, redirect or show message
      toast.error('OTP has expired. Please request a new one.')
    }
  }, [timeLeft])
  
  // Resend cooldown timer (1 minute)
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendCooldown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [resendCooldown, canResend])
  
  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Handle resend OTP
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
      
      // Reset main timer to 10 minutes
      setTimeLeft(600)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    // Validation
    if (!email || !email.trim()) {
      toast.error('Email is missing. Please request a password reset again.')
      navigate('/user/forgot-password')
      return
    }

    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP')
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
        otp: otpString,
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
      const errorMessage = err?.response?.data?.message || err?.message || 'Invalid or expired OTP. Please try again.'
      
      // Show user-friendly error message
      toast.error(errorMessage)
    } finally {
      setLoading(false)
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
                Reset Your Password
              </h1>
              <p className='text-base text-[var(--theme-text-secondary)]'>
                Enter the 6-digit code sent to <span className='text-[var(--theme-primary)] font-medium'>{email}</span> and create a new password.
              </p>
            </motion.div>
            
            <motion.form 
              onSubmit={handleSubmit} 
              className='mt-6 space-y-5'
              variants={containerVariants}
            >
              {/* OTP Input Section */}
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
                      aria-label={`Reset code digit ${index + 1}`}
                    />
                  ))}
                </div>
                
                <p className='text-xs text-[var(--theme-text-subtle)] text-center'>
                  💡 Tip: You can paste your 6-digit code directly
                </p>
              </motion.div>

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
                  disabled={loading || isSuccess || otp.join('').length !== 6 || !newPassword || !confirmPassword}
                  className={`w-full inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white shadow-[var(--theme-shadow-brand)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:ring-offset-2 ${
                    loading || isSuccess || otp.join('').length !== 6 || !newPassword || !confirmPassword
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
              
              {/* Timer and Resend OTP section */}
              <motion.div 
                className='text-center space-y-3'
                variants={itemVariants}
              >
                {/* Main countdown timer */}
                <div className='flex items-center justify-center gap-2'>
                  <svg className='w-4 h-4 text-[var(--theme-text-subtle)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <span className='text-sm text-[var(--theme-text-subtle)]'>
                    Code expires in: <span className='text-[var(--theme-primary)] font-medium'>{formatTime(timeLeft)}</span>
                  </span>
                </div>
                
                {/* Resend OTP */}
                <div>
                  <p className='text-xs text-[var(--theme-text-subtle)] mb-2'>
                    Didn't receive the code?
                  </p>
                  <button
                    type='button'
                    disabled={!canResend || resendCooldown > 0}
                    onClick={handleResendOtp}
                    className={`text-sm font-medium transition-colors ${
                      canResend && resendCooldown === 0
                        ? 'text-[var(--theme-primary)] hover:text-[var(--theme-primary)] cursor-pointer'
                        : 'text-[var(--theme-text-subtle)] cursor-not-allowed'
                    }`}
                  >
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
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

export default UserResetPassword