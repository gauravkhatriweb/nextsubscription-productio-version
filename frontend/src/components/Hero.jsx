/**
 * Hero.jsx - Hero Section Component
 * 
 * Reusable hero section component with brand messaging and primary CTAs.
 * Currently used as a standalone component but can be integrated into pages.
 * 
 * Key Features:
 * - Brand headline and tagline
 * - Primary and secondary action buttons
 * - Responsive typography
 * 
 * @component
 */

import React from 'react'

/**
 * Hero Component
 * 
 * Branded hero section with solid brand colors and primary CTAs.
 * 
 * @returns {JSX.Element} Hero section component
 */
const Hero = () => {
  return (
    <section id='home' className='relative overflow-hidden bg-[var(--theme-background)] text-[var(--theme-text)]'>
      <div className='relative mx-auto max-w-6xl px-6 py-24 text-center'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          Next Subscription – Smarter way to manage your subscriptions.
        </h1>
        <p className='mx-auto mt-3 max-w-2xl text-sm sm:text-base text-[var(--theme-text-secondary)]'>
          Track, manage, and optimize all your subscriptions in one place.
        </p>
        <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
          <button className='rounded-full bg-[var(--theme-primary)] px-6 py-3 text-[var(--theme-text)] font-semibold shadow hover:opacity-90'>
            Get Started
          </button>
          <button className='rounded-full bg-[var(--theme-surface)] px-6 py-3 text-[var(--theme-text)] font-semibold ring-1 ring-[var(--theme-border)] hover:opacity-90'>
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero