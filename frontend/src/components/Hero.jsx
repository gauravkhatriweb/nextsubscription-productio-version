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
    <section id='home' className='relative overflow-hidden bg-black text-white'>
      <div className='relative mx-auto max-w-6xl px-6 py-24 text-center'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          Next Subscription – Smarter way to manage your subscriptions.
        </h1>
        <p className='mx-auto mt-3 max-w-2xl text-sm sm:text-base text-[#F6EFD2]/80'>
          Track, manage, and optimize all your subscriptions in one place.
        </p>
        <div className='mt-8 flex flex-col sm:flex-row items-center justify-center gap-3'>
          <button className='rounded-full bg-brand-primary px-6 py-3 text-white font-semibold shadow hover:opacity-90'>
            Get Started
          </button>
          <button className='rounded-full bg-[#000000] px-6 py-3 text-[#F6EFD2] font-semibold ring-1 ring-[#F6EFD2]/10 hover:opacity-90'>
            Learn More
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero