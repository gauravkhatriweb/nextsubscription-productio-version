/**
 * AboutPage.jsx - About Page
 * 
 * Comprehensive about page showcasing company mission, vision, values,
 * story, features, and developer information. Features animated sections
 * with staggered reveals and brand-consistent styling.
 * 
 * Key Features:
 * - Hero section with brand logo and tagline
 * - Mission and Vision sections
 * - Core Values grid
 * - Company Story section
 * - Feature highlights for subscribers and providers
 * - Premium Plans feature highlight
 * - Impact statistics
 * - Developer/Founder section
 * - Call-to-action section
 * - Smooth scroll animations using Framer Motion
 * 
 * @component
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/branding/nextsubscription_main_logo.png'
import devImage from '../assets/personal/dev_image.png'

/**
 * AboutPage Component
 * 
 * Main about page component with animated sections and brand messaging.
 * 
 * @returns {JSX.Element} About page component
 */
const AboutPage = () => {
  /**
   * Animation Variants
   * 
   * Framer Motion variants for container and item animations.
   * Used for staggered reveal effects throughout the page.
   */
  // Animation variants for staggered reveal
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  // Value cards with icons
  const values = [
    {
      icon: '🚀',
      title: 'Affordability',
      description: 'Fair pricing for subscribers, fair earnings for providers.'
    },
    {
      icon: '🔒',
      title: 'Security First',
      description: 'Verified providers, secure payments, real-time tracking.'
    },
    {
      icon: '🌍',
      title: 'Accessibility',
      description: 'Multiple plan types, language support, and flexible payments.'
    },
    {
      icon: '💪',
      title: 'Empowerment',
      description: 'Opportunities for local providers, support for subscribers.'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Transparent pricing and reliable support.'
    }
  ]

  // Impact numbers
  const stats = [
    { number: '10,000+', label: 'Subscriptions Managed' },
    { number: '50+', label: 'Services Integrated' },
    { number: '1,000+', label: 'Providers Onboarded' },
    { number: '5,000+', label: 'Subscribers Trust Us' }
  ]

  // Feature highlights
  const subscriberFeatures = [
    { icon: '⚡', title: 'Easy Management', description: 'Manage all your subscriptions in one place' },
    { icon: '📊', title: 'Usage Tracking', description: 'Track usage across all your services' },
    { icon: '🛡️', title: 'Security Features', description: 'Secure payments and verified providers' },
    { icon: '💳', title: 'Flexible Payments', description: 'Multiple payment options available' }
  ]

  const providerFeatures = [
    { icon: '💰', title: 'Higher Earnings', description: 'Lowest commission rates in market' },
    { icon: '⚡', title: 'Quick Payments', description: 'Instant payouts and transparent earnings' },
    { icon: '⏰', title: 'Flexible Plans', description: 'Offer plans on your schedule' },
    { icon: '🎓', title: 'Training & Support', description: 'Comprehensive training and 24/7 support' }
  ]

  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-primary)]/15 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-30' />
      <div className='pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--theme-accent)]/10 via-[var(--theme-secondary)]/10 to-[var(--theme-primary)]/10 blur-3xl opacity-20' />

      <main className='relative z-10 mx-auto max-w-6xl px-6 py-12 sm:py-16'>
        
        {/* Back to Home */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <Link 
            to='/' 
            className='inline-flex items-center gap-2 text-sm text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] transition-colors'
            style={{ fontFamily: 'Inter, system-ui' }}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Hero Statement */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='text-center mb-20'
        >
          <div className='mx-auto mb-8 inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-accent)] to-[var(--theme-secondary)]'>
            <div className='rounded-2xl bg-[var(--theme-background)] p-4'>
              <img src={logo} alt='Next Subscription logo' className='h-16 w-16' />
            </div>
          </div>
          
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            About <span className='bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-accent)] to-[var(--theme-secondary)] bg-clip-text text-transparent'>Next Subscription</span>
          </h1>
          
          <p className='text-lg sm:text-xl text-[var(--theme-text-secondary)] max-w-4xl mx-auto leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
            Next Subscription is Pakistan's homegrown subscription management platform, built to make subscription tracking safer, more affordable, and accessible for everyone.
          </p>
        </motion.section>

        {/* Mission & Vision */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-8 shadow-[var(--theme-glass-shadow)]'
          >
            <div className='mb-4'>
              <span className='text-3xl'>🎯</span>
            </div>
            <h2 className='text-2xl font-bold mb-4 text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Mission</h2>
            <p className='text-[var(--theme-text-secondary)] leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
              We exist to revolutionize Pakistan's subscription landscape by providing affordable, secure, and accessible subscription management for everyone. 
              Our platform empowers both subscribers and providers, creating opportunities and ensuring security for all.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-8 shadow-[var(--theme-glass-shadow)]'
          >
            <div className='mb-4'>
              <span className='text-3xl'>🚀</span>
            </div>
            <h2 className='text-2xl font-bold mb-4 text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Vision</h2>
            <p className='text-[var(--theme-text-secondary)] leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
              We envision a future where subscription management is seamless and inclusive, empowering subscribers and providers alike. 
              Our goal is to connect every Pakistani with reliable, secure, and affordable subscription management, making it a bridge 
              to opportunities rather than a barrier.
            </p>
          </motion.div>
        </motion.section>

        {/* Core Values */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='text-center mb-12'
          >
            <h2 className='text-2xl sm:text-3xl font-bold mb-4 text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Core Values</h2>
            <p className='text-[var(--theme-text-secondary)] max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              These principles guide everything we do at Next Subscription
            </p>
          </motion.div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-6 shadow-[var(--theme-glass-shadow)] hover:shadow-[var(--theme-shadow-medium)] transition-shadow duration-300'
              >
                <div className='text-3xl mb-4'>{value.icon}</div>
                <h3 className='text-xl font-bold mb-2 text-[var(--theme-text)]'>{value.title}</h3>
                <p className='text-[var(--theme-text-secondary)]'>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Company Story */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-8 shadow-[var(--theme-glass-shadow)]'
          >
            <div className='flex flex-col md:flex-row gap-8 items-center'>
              <div className='md:w-1/3'>
                <div className='rounded-2xl overflow-hidden border border-[var(--theme-glass-border)] shadow-[var(--theme-glass-shadow)]'>
                  <img 
                    src={devImage} 
                    alt='Next Subscription Founder' 
                    className='w-full h-auto object-cover'
                  />
                </div>
              </div>
              <div className='md:w-2/3'>
                <h2 className='text-2xl sm:text-3xl font-bold mb-4 text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Story</h2>
                <div className='space-y-4 text-[var(--theme-text-secondary)]' style={{ fontFamily: 'Inter, system-ui' }}>
                  <p>
                    Next Subscription was born out of a simple frustration: managing multiple subscriptions across Pakistan 
                    was unnecessarily complex and expensive. Our founder, while juggling various digital services, realized 
                    there was a gap in the market for a localized, user-centric subscription management platform.
                  </p>
                  <p>
                    Starting from a small apartment in Karachi, we've grown into Pakistan's leading subscription management 
                    platform. Our journey has been fueled by a commitment to affordability, security, and accessibility - 
                    values that remain at the core of everything we do.
                  </p>
                  <p>
                    Today, we're proud to serve thousands of subscribers and providers across Pakistan, making subscription 
                    management not just easier, but more empowering for everyone involved.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Features for Subscribers and Providers */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='text-center mb-12'
          >
            <h2 className='text-2xl sm:text-3xl font-bold mb-4 text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Powerful Features</h2>
            <p className='text-[var(--theme-text-secondary)] max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              Designed to make subscription management effortless for everyone
            </p>
          </motion.div>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <motion.div
              variants={itemVariants}
              className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-8 shadow-[var(--theme-glass-shadow)]'
            >
              <h3 className='text-xl font-bold mb-6 text-[var(--theme-text)] flex items-center'>
                <span className='mr-3'>👤</span> For Subscribers
              </h3>
              <div className='space-y-4'>
                {subscriberFeatures.map((feature, index) => (
                  <div key={index} className='flex items-start'>
                    <span className='text-xl mr-3 mt-0.5'>{feature.icon}</span>
                    <div>
                      <h4 className='font-semibold text-[var(--theme-text)]'>{feature.title}</h4>
                      <p className='text-[var(--theme-text-secondary)] text-sm'>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-8 shadow-[var(--theme-glass-shadow)]'
            >
              <h3 className='text-xl font-bold mb-6 text-[var(--theme-text)] flex items-center'>
                <span className='mr-3'>🏪</span> For Providers
              </h3>
              <div className='space-y-4'>
                {providerFeatures.map((feature, index) => (
                  <div key={index} className='flex items-start'>
                    <span className='text-xl mr-3 mt-0.5'>{feature.icon}</span>
                    <div>
                      <h4 className='font-semibold text-[var(--theme-text)]'>{feature.title}</h4>
                      <p className='text-[var(--theme-text-secondary)] text-sm'>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Impact Statistics */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='text-center mb-12'
          >
            <h2 className='text-2xl sm:text-3xl font-bold mb-4 text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Impact</h2>
            <p className='text-[var(--theme-text-secondary)] max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              Making a difference in Pakistan's subscription landscape
            </p>
          </motion.div>
          
          <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className='text-center p-6 rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md shadow-[var(--theme-glass-shadow)]'
              >
                <p className='text-3xl font-bold text-[var(--theme-primary)] mb-2'>{stat.number}</p>
                <p className='text-[var(--theme-text-secondary)]'>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='text-center mb-12'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-8 shadow-[var(--theme-glass-shadow)]'
          >
            <h2 className='text-2xl sm:text-3xl font-bold mb-4 text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Ready to Simplify Your Subscriptions?</h2>
            <p className='text-[var(--theme-text-secondary)] mb-6 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              Join thousands of subscribers and providers who trust Next Subscription to manage their digital services.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                to='/user/register'
                className='inline-flex items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 py-3 text-base font-bold text-white shadow-[var(--theme-shadow-brand)] hover:scale-[1.03] transition-transform'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                Get Started
              </Link>
              <Link
                to='/user/login'
                className='inline-flex items-center justify-center rounded-full bg-[var(--theme-surface)] px-6 py-3 text-base font-bold text-[var(--theme-text)] border border-[var(--theme-border)] shadow-[var(--theme-shadow-small)] hover:scale-[1.03] transition-transform'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  )
}

export default AboutPage