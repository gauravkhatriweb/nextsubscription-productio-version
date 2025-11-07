/**
 * Home.jsx - Landing Page Component
 * 
 * This is the main landing page for the Next Subscription application. It showcases
 * the platform's features, services, and provides navigation to key sections.
 * 
 * Key Features:
 * - Hero section with animated CTAs
 * - Feature showcases for subscribers and providers
 * - Scroll-based animations using Framer Motion
 * - Responsive navigation with scroll spy
 * - Footer with comprehensive links
 * 
 * @component
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import logo from '../assets/branding/nextsubscription_main_logo.png'
import { motion, useScroll, useTransform } from 'framer-motion'
import Navbar from '../components/Navbar' // Import the proper Navbar component

/**
 * FeatureCard Component
 * 
 * Reusable feature card component with hover/spring animations and reveal effects.
 * Uses glassmorphism design with dark theme styling.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Feature title
 * @param {string} props.description - Feature description
 * @returns {JSX.Element} Animated feature card
 */
const FeatureCard = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    className='glass-card rounded-2xl p-6 h-full'
  >
    <h3 className='text-lg font-semibold text-theme-primary mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{title}</h3>
    <p className='text-sm text-theme-secondary leading-relaxed'>{description}</p>
  </motion.div>
)

/**
 * Home Component
 * 
 * Main landing page component that renders hero section, features, and footer.
 * Handles scroll-based animations and navigation state.
 * 
 * @returns {JSX.Element} Complete landing page
 */
const Home = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState('home') // Active navigation section
  const [scrolled, setScrolled] = useState(false) // Track scroll position for navbar styling
  const [siteSettings, setSiteSettings] = useState({
    heroHeadline: 'Simplify how you manage your subscriptions — securely and beautifully.',
    heroTagline: 'Take control of your recurring payments with intelligent tracking, automated reminders, and powerful insights — all in one elegant platform.',
    primaryHeading: 'For Subscribers'
  })

  const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get(`${apiBase}/api/admin/settings`)
        if (response.data.success && response.data.settings) {
          const settings = response.data.settings
          setSiteSettings({
            heroHeadline: settings.heroHeadline || 'Simplify how you manage your subscriptions — securely and beautifully.',
            heroTagline: settings.heroTagline || 'Take control of your recurring payments with intelligent tracking, automated reminders, and powerful insights — all in one elegant platform.',
            primaryHeading: settings.primaryHeading || 'For Subscribers'
          })
        }
      } catch (error) {
        // Use defaults if API fails
        console.warn('Could not load site settings, using defaults')
      }
    }
    loadSettings()
  }, [apiBase])

  /**
   * Framer Motion Scroll Progress
   * 
   * Creates parallax effects for hero illustrations using scroll progress.
   * Transforms Y position and opacity based on scroll position.
   */
  const { scrollYProgress } = useScroll()
  const carY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const bikeY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const carOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.85])
  const bikeOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9])

  /**
   * Navbar Scroll Effect
   * 
   * Tracks scroll position to apply blur/background changes to navbar.
   * Updates scrolled state when scroll position exceeds threshold.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /**
   * Scroll Spy Effect
   * 
   * Uses IntersectionObserver to highlight active navigation section
   * based on which section is currently visible in viewport.
   * Updates active state when section enters viewport with 60% visibility.
   */
  useEffect(() => {
    const ids = ['home', 'subscribers', 'providers', 'contact']
    const observers = []
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(id)),
        { threshold: 0.6 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const baseWrap = 'bg-theme-base text-theme-primary min-h-screen transition-theme'
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Footer navigation items with same pattern as Navbar
  const footerSections = {
    subscribers: [
      { id: 'subscribers', label: 'Affordable Plans' },
      { id: 'subscribers', label: 'Security First' },
      { id: 'subscribers', label: 'Seamless Management' }
    ],
    providers: [
      { id: 'providers', label: 'Instant Revenue' },
      { id: 'providers', label: 'Flexible Plans' },
      { id: 'providers', label: 'Lowest Commission' }
    ],
    company: [
      { path: '/about', label: 'About' },
      { path: '/legal/terms', label: 'Terms' },
      { path: '/legal/privacy', label: 'Privacy' },
      { id: 'contact', label: 'Contact' },
      { path: '/legal/faq', label: 'FAQ' }
    ]
  }

  const handleFooterNavigation = (item) => {
    if (item.path) {
      navigate(item.path)
    } else if (item.id) {
      scrollTo(item.id)
    }
  }

  /**
   * Hero Component
   * 
   * Main hero section with brand messaging, primary CTAs, and animated text.
   * Features gradient backgrounds and smooth scroll-to-section navigation.
   * Uses content from site settings API.
   * 
   * @returns {JSX.Element} Hero section component
   */
  const Hero = () => (
    <section id='home' className='relative overflow-hidden bg-theme-base text-theme-primary'>
      <div className='relative mx-auto max-w-screen-xl px-6 pt-32 pb-24 text-center'>
        <motion.h1
          className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight'
          style={{ fontFamily: 'Poppins, Inter, system-ui' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {siteSettings.heroHeadline}
        </motion.h1>
        <motion.p
          className='mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-theme-secondary leading-relaxed'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {siteSettings.heroTagline}
        </motion.p>
        <div className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'>
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={() => navigate('/user/register')} 
            className='btn-primary-hover rounded-full bg-brand-primary px-8 py-4 text-white font-semibold text-base shadow-theme-brand focus:outline-none focus-theme'
          >
            Get Started Free
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={() => navigate('/about')} 
            className='rounded-full border-2 border-theme-base px-8 py-4 text-theme-primary font-semibold text-base hover:bg-surface-hover transition-theme focus:outline-none focus-theme'
          >
            Learn More
          </motion.button>
        </div>
      </div>
    </section>
  )

  /**
   * Features Component
   * 
   * Displays feature sections for both subscribers and providers.
   * Includes animated feature cards with stagger effects and CTAs.
   * 
   * @returns {JSX.Element} Features section component
   */
  const Features = () => (
    <div id='features'>
      <section id='subscribers' className='py-20 bg-theme-base'>
        <div className='mx-auto max-w-screen-xl px-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-start'>
            <div>
              <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>{siteSettings.primaryHeading}</h2>
              <p className='text-lg text-theme-secondary leading-relaxed'>Take control of your recurring expenses with powerful tools designed for modern consumers.</p>
            </div>
            <motion.div
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              initial='hidden'
              whileInView='show'
              viewport={{ once: true, amount: 0.2 }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <FeatureCard title='Unified Dashboard' description='Centralize all your subscriptions in one beautifully designed interface with real-time insights.' />
              <FeatureCard title='Smart Reminders' description='Never miss a renewal with intelligent alerts tailored to your payment schedule.' />
              <FeatureCard title='Cost Analytics' description='Discover spending patterns and identify opportunities to optimize your subscription portfolio.' />
              <FeatureCard title='Bank-Grade Security' description='Your financial data is protected with enterprise-level encryption and security protocols.' />
              <FeatureCard title='Effortless Management' description='Update, pause, or cancel subscriptions with a single click — no more hunting through emails.' />
            </motion.div>
          </div>
        </div>
      </section>

      <section id='providers' className='py-20 bg-theme-base text-theme-primary'>
        <div className='mx-auto max-w-screen-xl px-6'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12'>
            <div>
              <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>For Providers</h2>
              <p className='text-lg text-theme-secondary leading-relaxed'>Scale your subscription business with tools built for growth and efficiency.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/provider/register')} 
              className='btn-primary-hover self-start md:self-auto rounded-full bg-brand-primary px-8 py-4 text-white font-semibold text-base shadow-theme-brand focus:outline-none focus-theme'
            >
              Register as Provider
            </motion.button>
          </div>
          <motion.div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            initial='hidden'
            whileInView='show'
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            <FeatureCard title='Instant Payouts' description='Get paid faster with automated revenue distribution and transparent financial tracking.' />
            <FeatureCard title='Flexible Pricing' description='Create and manage subscription tiers that adapt to your business model and customer needs.' />
            <FeatureCard title='Intelligent Matching' description='Connect with subscribers who align with your service offerings and pricing structure.' />
            <FeatureCard title='Competitive Rates' description='Maximize your earnings with industry-leading commission structures designed for profitability.' />
            <FeatureCard title='Growth Resources' description='Access analytics, marketing tools, and educational resources to accelerate your business growth.' />
          </motion.div>
        </div>
      </section>

      <section id='contact' className='py-20 bg-theme-base'>
        <div className='mx-auto max-w-screen-xl px-6'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='glass-card rounded-3xl p-12 text-center max-w-3xl mx-auto'
          >
            <h2 className='text-3xl sm:text-4xl font-bold text-theme-primary mb-4' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Ready to get started?</h2>
            <p className='text-lg text-theme-secondary mb-8 leading-relaxed'>Have questions about our platform? Our team is here to help you simplify subscription management.</p>
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/legal/contact')} 
              className='btn-primary-hover rounded-full bg-brand-primary px-8 py-4 text-white font-semibold text-base shadow-theme-brand focus:outline-none focus-theme'
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )

  /**
   * Footer Component
   * 
   * Comprehensive footer with brand info, navigation links, and social media.
   * Handles both scroll-to-section and route navigation.
   * 
   * @returns {JSX.Element} Footer component
   */
  const Footer = () => (
    <footer className='text-theme-primary bg-theme-elevated border-t border-theme-base'>
      <div className='h-[1px] w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent' />
      <div className='mx-auto max-w-6xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div>
          <div className='flex items-center gap-2'>
            <img src={logo} alt='Next Subscription logo' className='h-8 w-8' />
            <span className='font-semibold'>Next Subscription</span>
          </div>
          <p className='mt-3 text-sm text-theme-secondary leading-relaxed'>Simplify how you manage your subscriptions — securely and beautifully. Take control of your recurring payments with intelligent tracking and powerful insights.</p>
          <div className='mt-4 flex items-center gap-3 text-[#F6EFD2]/80'>
            <a aria-label='Facebook' href='#' className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated hover:bg-surface-hover text-theme-secondary hover:text-theme-primary transition-theme'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15 3h-3a5 5 0 0 0-5 5v3H5v4h2v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1h3V3z' fill='currentColor' /></svg>
            </a>
            <a aria-label='Twitter' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M22 5.8c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.1 1.6-2-.8.5-1.6.8-2.5 1A3.6 3.6 0 0 0 12 7.6c0 .3 0 .6.1.9-3-.1-5.7-1.6-7.5-4-.3.6-.4 1.2-.4 1.9 0 1.3.7 2.6 1.8 3.3-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.6 3.1 4a3.6 3.6 0 0 1-1.6.1c.5 1.6 2 2.8 3.7 2.8A7.3 7.3 0 0 1 2 19.5 10.3 10.3 0 0 0 7.6 21c6.9 0 10.7-5.7 10.7-10.7v-.5c.7-.5 1.3-1.1 1.7-1.8z' fill='currentColor' /></svg>
            </a>
            <a aria-label='Instagram' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 4a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7zm6-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z' fill='currentColor' /></svg>
            </a>
            <a aria-label='LinkedIn' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M6 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-2 6h4v8H4v-8zm6 0h3.6v1.1h.1c.5-.8 1.6-1.3 2.7-1.3 2.9 0 3.5 1.9 3.5 4.3V20h-4v-3.6c0-.9 0-2-1.2-2s-1.4 1-1.4 1.9V20h-4v-8z' fill='currentColor' /></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 className='font-semibold'>For Subscribers</h4>
          <ul className='mt-3 space-y-2 text-sm text-theme-secondary'>
            {footerSections.subscribers.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleFooterNavigation(item)}
                  className='hover:text-theme-primary transition-theme cursor-pointer text-left'
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>For Providers</h4>
          <ul className='mt-3 space-y-2 text-sm text-[#F6EFD2]/80'>
            {footerSections.providers.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleFooterNavigation(item)}
                  className='hover:underline hover:text-[#F6EFD2] transition-colors cursor-pointer text-left'
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>Company</h4>
          <ul className='mt-3 space-y-2 text-sm text-[#F6EFD2]/80'>
            {footerSections.company.map((item, index) => (
              <li key={index}>
                <button 
                  onClick={() => handleFooterNavigation(item)}
                  className='hover:underline hover:text-[#F6EFD2] transition-colors cursor-pointer text-left'
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className='border-t border-theme-base'>
        <div className='mx-auto max-w-6xl px-6 py-6 text-center text-xs text-theme-subtle'>© 2025 Next Subscription. All rights reserved.</div>
      </div>
    </footer>
  )

  return (
    <div className={baseWrap} style={{ fontFamily: 'Inter, system-ui' }}>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}

export default Home