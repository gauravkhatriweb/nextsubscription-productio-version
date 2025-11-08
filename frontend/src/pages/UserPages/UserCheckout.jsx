/**
 * UserCheckout.jsx - Subscription Checkout Page
 * 
 * Page for users to review and confirm their subscription purchase.
 * Features subscription summary, payment method selection, and billing information.
 * 
 * Key Features:
 * - Subscription summary card with plan details
 * - Payment method selection with visual indicators
 * - Billing information form
 * - Secure checkout button with animations
 * - Responsive design for all device sizes
 * 
 * @component UserCheckout
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import { motion } from 'framer-motion'
import logo from '../../assets/branding/nextsubscription_main_logo.png'

/**
 * UserCheckout Component
 * 
 * Checkout form for subscription purchases.
 * 
 * @returns {JSX.Element} Checkout page component
 */
const UserCheckout = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  
  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card')
  
  // Billing info state (pre-filled with user data)
  const [billingInfo, setBillingInfo] = useState({
    name: user?.firstname ? `${user.firstname} ${user.lastname || ''}` : '',
    email: user?.email || '',
    country: 'PK' // Default to Pakistan
  })
  
  // Mock subscription data (would come from context/cart in a real app)
  const subscription = {
    name: 'Netflix Premium',
    plan: 'Monthly',
    warranty: '30 days',
    price: '$5.99',
    originalPrice: '$19.99',
    savings: '70%'
  }

  // Payment methods
  const paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'crypto', name: 'Crypto', icon: '₿', disabled: true }
  ]

  // Country options
  const countries = [
    { code: 'PK', name: 'Pakistan' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' }
  ]

  // Handle billing info changes
  const handleBillingChange = (field, value) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would integrate with a payment processor
    console.log('Proceeding to payment with:', { subscription, selectedPaymentMethod, billingInfo })
    // For now, just show an alert and navigate to a success page
    alert('In a real implementation, this would redirect to a payment processor')
    // navigate('/checkout/success')
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

  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-primary)]/15 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-30' />
      
      {/* Floating icons background (optional) */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 text-4xl opacity-5 animate-float'>💳</div>
        <div className='absolute top-3/4 right-1/4 text-4xl opacity-5 animate-float animation-delay-2000'>🛡️</div>
        <div className='absolute top-1/2 left-1/2 text-4xl opacity-5 animate-float animation-delay-4000'>🔒</div>
      </div>
      
      <main className='relative z-10 mx-auto max-w-6xl px-6 py-12'>
        <motion.div 
          className='mb-8 text-center'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-accent)] to-[var(--theme-secondary)] mx-auto'>
            <div className='rounded-2xl bg-[var(--theme-background)] p-3'>
              <img src={logo} alt='Next Subscription logo' className='h-9 w-9' />
            </div>
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold tracking-tight text-[var(--theme-text)] mt-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Complete Your Purchase
          </h1>
          <p className='text-base text-[var(--theme-text-secondary)] mt-2'>
            Review your subscription and securely checkout
          </p>
        </motion.div>
        
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Left Column - Summary and Payment */}
          <motion.div 
            className='space-y-8'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Subscription Summary Card */}
            <motion.div 
              className='rounded-3xl p-6 backdrop-blur-md border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] shadow-[var(--theme-glass-shadow)]'
              variants={itemVariants}
            >
              <h2 className='text-xl font-bold text-[var(--theme-text)] mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Subscription Summary
              </h2>
              
              <div className='space-y-4'>
                <div className='flex justify-between items-center pb-3 border-b border-[var(--theme-border-subtle)]'>
                  <div>
                    <h3 className='font-semibold text-[var(--theme-text)]'>{subscription.name}</h3>
                    <p className='text-sm text-[var(--theme-text-secondary)]'>{subscription.plan} Plan</p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-[var(--theme-text)]'>{subscription.price}</p>
                    <p className='text-sm text-[var(--theme-text-secondary)] line-through'>{subscription.originalPrice}</p>
                  </div>
                </div>
                
                <div className='flex justify-between items-center py-3 border-b border-[var(--theme-border-subtle)]'>
                  <div>
                    <p className='text-[var(--theme-text)]'>Warranty Period</p>
                  </div>
                  <div>
                    <p className='font-medium text-[var(--theme-text)]'>{subscription.warranty}</p>
                  </div>
                </div>
                
                <div className='flex justify-between items-center pt-3'>
                  <div>
                    <p className='text-[var(--theme-text)] font-semibold'>Total</p>
                  </div>
                  <div>
                    <p className='text-xl font-bold text-[var(--theme-primary)]'>{subscription.price}</p>
                  </div>
                </div>
                
                <div className='mt-4 p-3 rounded-xl bg-[var(--theme-success-light)] border border-[var(--theme-success)]/30'>
                  <p className='text-sm font-medium text-[var(--theme-success)] flex items-center'>
                    <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    You're saving up to {subscription.savings}!
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Payment Methods */}
            <motion.div 
              className='rounded-3xl p-6 backdrop-blur-md border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] shadow-[var(--theme-glass-shadow)]'
              variants={itemVariants}
            >
              <h2 className='text-xl font-bold text-[var(--theme-text)] mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Payment Method
              </h2>
              
              <div className='grid grid-cols-3 gap-4'>
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    type='button'
                    onClick={() => !method.disabled && setSelectedPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedPaymentMethod === method.id
                        ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
                        : method.disabled
                          ? 'border-[var(--theme-border-subtle)] bg-[var(--theme-surface)] opacity-50 cursor-not-allowed'
                          : 'border-[var(--theme-border-subtle)] bg-[var(--theme-surface)] hover:border-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5'
                    }`}
                    whileHover={!method.disabled ? { y: -5 } : {}}
                    whileTap={!method.disabled ? { scale: 0.95 } : {}}
                    disabled={method.disabled}
                  >
                    <span className='text-2xl mb-2'>{method.icon}</span>
                    <span className='text-sm font-medium text-[var(--theme-text)]'>{method.name}</span>
                    {method.disabled && (
                      <span className='text-xs text-[var(--theme-text-subtle)] mt-1'>Soon</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Billing Info and CTA */}
          <motion.div 
            className='space-y-8'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Billing Information */}
            <motion.div 
              className='rounded-3xl p-6 backdrop-blur-md border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] shadow-[var(--theme-glass-shadow)]'
              variants={itemVariants}
            >
              <h2 className='text-xl font-bold text-[var(--theme-text)] mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Billing Information
              </h2>
              
              <form className='space-y-4'>
                <div>
                  <label htmlFor='name' className='block text-sm font-medium mb-2 text-[var(--theme-text)]'>
                    Full Name
                  </label>
                  <input
                    id='name'
                    type='text'
                    value={billingInfo.name}
                    onChange={(e) => handleBillingChange('name', e.target.value)}
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                    placeholder='Enter your full name'
                  />
                </div>
                
                <div>
                  <label htmlFor='email' className='block text-sm font-medium mb-2 text-[var(--theme-text)]'>
                    Email Address
                  </label>
                  <input
                    id='email'
                    type='email'
                    value={billingInfo.email}
                    onChange={(e) => handleBillingChange('email', e.target.value)}
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                    placeholder='Enter your email'
                  />
                </div>
                
                <div>
                  <label htmlFor='country' className='block text-sm font-medium mb-2 text-[var(--theme-text)]'>
                    Country
                  </label>
                  <select
                    id='country'
                    value={billingInfo.country}
                    onChange={(e) => handleBillingChange('country', e.target.value)}
                    className='w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition-all duration-200'
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </motion.div>
            
            {/* CTA Button */}
            <motion.div 
              className='rounded-3xl p-6 backdrop-blur-md border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] shadow-[var(--theme-glass-shadow)] text-center'
              variants={itemVariants}
            >
              <button
                onClick={handleSubmit}
                className='w-full inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white bg-[var(--theme-primary)] hover:bg-[var(--theme-primary)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/50 focus:ring-offset-2 hover:shadow-[0_0_12px_var(--theme-primary)]'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Proceed to Payment
              </button>
              
              <div className='mt-4 flex items-center justify-center'>
                <svg className='w-4 h-4 text-[var(--theme-success)] mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
                <span className='text-sm text-[var(--theme-text-secondary)]'>
                  Secure & Encrypted Checkout
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default UserCheckout