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
    <div className='relative min-h-screen w-full bg-[#000000] text-white overflow-hidden'>
      {/* Ambient gradient orbs following brand guidelines */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#E43636] via-[#F6EFD2] to-[#E2DDB4] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#E2DDB4] via-[#E43636] to-[#F6EFD2] blur-3xl opacity-25' />
      <div className='pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-[#F6EFD2]/10 via-[#E2DDB4]/10 to-[#E43636]/10 blur-3xl opacity-40' />

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
            className='inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors'
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
          <div className='mx-auto mb-8 inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[#E43636] via-[#F6EFD2] to-[#E2DDB4]'>
            <div className='rounded-2xl bg-[#000000] p-4'>
              <img src={logo} alt='Next Subscription logo' className='h-16 w-16' />
            </div>
          </div>
          
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            About <span className='bg-gradient-to-r from-[#E43636] via-[#F6EFD2] to-[#E2DDB4] bg-clip-text text-transparent'>Next Subscription</span>
          </h1>
          
          <p className='text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
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
            className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='mb-4'>
              <span className='text-3xl'>🎯</span>
            </div>
            <h2 className='text-2xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Mission</h2>
            <p className='text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
              We exist to revolutionize Pakistan's subscription landscape by providing affordable, secure, and accessible subscription management for everyone. 
              Our platform empowers both subscribers and providers, creating opportunities and ensuring security for all.
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='mb-4'>
              <span className='text-3xl'>🚀</span>
            </div>
            <h2 className='text-2xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Vision</h2>
            <p className='text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
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
          <motion.div variants={itemVariants} className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Our Core Values
            </h2>
            <p className='text-gray-300 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              The principles that guide everything we do at Next Subscription
            </p>
          </motion.div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-center'
              >
                <div className='text-4xl mb-4'>{value.icon}</div>
                <h3 className='text-lg font-semibold mb-3' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  {value.title}
                </h3>
                <p className='text-sm text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Story */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='flex items-center gap-3 mb-6'>
              <span className='text-3xl'>📖</span>
              <h2 className='text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Our Story</h2>
            </div>
            
            <div className='prose prose-lg prose-invert max-w-none'>
              <p className='text-gray-300 leading-relaxed mb-6' style={{ fontFamily: 'Inter, system-ui' }}>
                We noticed Pakistan needed a safer, more affordable alternative to international subscription management apps. 
                Born from the vision to create a truly Pakistani solution, Next Subscription was designed specifically for 
                our users' needs – understanding our culture, our challenges, and our aspirations.
              </p>
              
              <p className='text-gray-300 leading-relaxed mb-6' style={{ fontFamily: 'Inter, system-ui' }}>
                Starting as a local initiative, we've grown into Pakistan's premier homegrown subscription management platform. 
                We're not just another app – we're a movement towards safer, more affordable subscription management that 
                puts Pakistani subscribers and providers first.
              </p>
              
              <p className='text-gray-300 leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                Every subscription on Next Subscription represents our commitment to building a better Pakistan, one service at a time. 
                We're proud to be Pakistani, and we're proud to serve Pakistan.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* For Subscribers & Providers */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
            
            {/* For Subscribers */}
            <motion.div variants={itemVariants}>
              <div className='flex items-center gap-3 mb-6'>
                <span className='text-3xl'>👥</span>
                <h2 className='text-2xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>For Subscribers</h2>
              </div>
              
              <div className='space-y-4'>
                {subscriberFeatures.map((feature, index) => (
                  <div key={index} className='flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10'>
                    <span className='text-2xl flex-shrink-0'>{feature.icon}</span>
                    <div>
                      <h3 className='font-semibold mb-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.title}
                      </h3>
                      <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* For Providers */}
            <motion.div variants={itemVariants}>
              <div className='flex items-center gap-3 mb-6'>
                <span className='text-3xl'>🚗</span>
                <h2 className='text-2xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>For Providers</h2>
              </div>
              
              <div className='space-y-4'>
                {providerFeatures.map((feature, index) => (
                  <div key={index} className='flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10'>
                    <span className='text-2xl flex-shrink-0'>{feature.icon}</span>
                    <div>
                      <h3 className='font-semibold mb-1' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.title}
                      </h3>
                      <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Unique Feature Highlight - Premium Plans */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-r from-[#F6EFD2]/10 via-[#E2DDB4]/10 to-[#F6EFD2]/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-center'
          >
            <div className='mb-6'>
              <span className='text-5xl'>⭐</span>
            </div>
            
            <h2 className='text-3xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Introducing <span className='text-[#F6EFD2]'>Premium Plans</span>
            </h2>
            
            <p className='text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
              Pakistan's first premium subscription service, ensuring value and comfort for all subscribers.
            </p>
            
            <div className='inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#F6EFD2]/20 to-[#E2DDB4]/20 border border-[#F6EFD2]/30'>
              <span className='text-[#F6EFD2] font-semibold' style={{ fontFamily: 'Inter, system-ui' }}>
                Enhancing value, one subscription at a time
              </span>
            </div>
          </motion.div>
        </motion.section>

        {/* Impact Numbers */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div variants={itemVariants} className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Our Impact
            </h2>
            <p className='text-gray-300 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              The numbers that showcase our growing community
            </p>
          </motion.div>

          <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className='rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] text-center'
              >
                <div className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#E43636] via-[#F6EFD2] to-[#E2DDB4] bg-clip-text text-transparent mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  {stat.number}
                </div>
                <p className='text-sm text-gray-300' style={{ fontFamily: 'Inter, system-ui' }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Developer Section */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='mb-20'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <div className='flex items-center gap-3 mb-8 justify-center'>
              <span className='text-3xl'>👨‍💻</span>
              <h2 className='text-3xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Meet the Developer</h2>
            </div>
            
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-center'>
              {/* Developer Image */}
              <motion.div 
                variants={itemVariants}
                className='lg:col-span-1 flex justify-center'
              >
                <div className='relative'>
                  <div className='absolute inset-0 bg-gradient-to-r from-[#E43636] via-[#F6EFD2] to-[#E2DDB4] rounded-2xl blur-xl opacity-30'></div>
                  <img 
                    src={devImage} 
                    alt='Gaurav Khatri - Founder & Developer' 
                    className='relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover border-2 border-white/20 shadow-2xl'
                  />
                </div>
              </motion.div>
              
              {/* Developer Info */}
              <motion.div 
                variants={itemVariants}
                className='lg:col-span-2 text-center lg:text-left'
              >
                <h3 className='text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-[#E43636] via-[#F6EFD2] to-[#E2DDB4] bg-clip-text text-transparent' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                  Gaurav Khatri
                </h3>
                
                <div className='space-y-4 text-gray-300'>
                  <div className='flex items-center gap-2 justify-center lg:justify-start'>
                    <span className='text-xl'>🚀</span>
                    <span className='text-lg font-semibold text-[#F6EFD2]' style={{ fontFamily: 'Inter, system-ui' }}>Founder & Team Member</span>
                  </div>
                  
                  <div className='flex items-center gap-2 justify-center lg:justify-start'>
                    <span className='text-xl'>💻</span>
                    <span className='text-lg font-semibold text-[#E2DDB4]' style={{ fontFamily: 'Inter, system-ui' }}>Solo MERN Stack Developer</span>
                  </div>
                  
                  <div className='flex items-center gap-2 justify-center lg:justify-start'>
                    <span className='text-xl'>🎓</span>
                    <span className='text-base' style={{ fontFamily: 'Inter, system-ui' }}>Learning MERN Stack from Aptech Pakistan</span>
                  </div>
                  
                  <div className='mt-6 p-4 rounded-xl bg-gradient-to-r from-[#E43636]/10 via-[#F6EFD2]/10 to-[#E2DDB4]/10 border border-white/10'>
                    <p className='text-base leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                      Gaurav is the sole developer and visionary behind Next Subscription, having built this entire MERN stack application 
                      from the ground up. With a passion for creating meaningful technology solutions, he continues to learn 
                      and innovate while developing this comprehensive subscription management platform.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Competition Project Notice */}
            <motion.div 
              variants={itemVariants}
              className='mt-8 pt-8 border-t border-white/10'
            >
              <div className='bg-gradient-to-r from-[#E2DDB4]/20 via-[#F6EFD2]/20 to-[#E43636]/20 border border-[#E2DDB4]/30 rounded-xl p-6 text-center'>
                <div className='flex items-center justify-center gap-2 mb-3'>
                  <span className='text-2xl'>🏆</span>
                  <h4 className='text-xl font-bold text-[#E2DDB4]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Competition Project</h4>
                </div>
                <p className='text-gray-300 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
                  <strong>Important Notice:</strong> Next Subscription is developed as part of a coding competition project, 
                  not as a commercial business venture. This showcase demonstrates full-stack development capabilities 
                  and innovative thinking in the subscription management technology space.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
          className='text-center'
        >
          <motion.div 
            variants={itemVariants}
            className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
          >
            <h2 className='text-3xl sm:text-4xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
              Ready to Manage Your Subscriptions Smarter?
            </h2>
            
            <p className='text-xl text-gray-300 mb-8 max-w-2xl mx-auto' style={{ fontFamily: 'Inter, system-ui' }}>
              Join Next Subscription today and be part of Pakistan's subscription management revolution — one secure, affordable service at a time.
            </p>
            
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Link
                to='/user/register'
                className='inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#E43636] to-[#F6EFD2] px-8 py-4 text-white font-semibold shadow-[0_8px_30px_rgba(228,54,54,0.3)] hover:scale-[1.02] transition-transform'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <span className='mr-2'>📱</span>
                Manage Your Subscriptions
              </Link>
              
              <Link
                to='/provider/register'
                className='inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-white font-semibold hover:bg-white/10 transition-colors'
                style={{ fontFamily: 'Inter, system-ui' }}
              >
                <span className='mr-2'>🚗</span>
                Become a Provider
              </Link>
            </div>
            
            <div className='mt-8 pt-8 border-t border-white/10'>
              <p className='text-sm text-gray-400 italic' style={{ fontFamily: 'Inter, system-ui' }}>
                "Manage Better. Pay Smarter." — Next Subscription
              </p>
            </div>
          </motion.div>
        </motion.section>

      </main>
    </div>
  )
}

export default AboutPage