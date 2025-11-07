/**
 * Onboarding.jsx - Application Onboarding Page
 * 
 * Welcome page for new users that introduces the platform and provides
 * quick access to registration. Features brand gradient backgrounds and
 * animated content sections.
 * 
 * Key Features:
 * - Brand introduction with logo
 * - Feature highlights (Transparent Pricing, Trusted Providers, Coverage)
 * - Primary CTA to get started
 * - Secondary navigation links
 * 
 * @component
 */

import React from 'react'
import logo from '../assets/branding/nextsubscription_main_logo.png'
import { useNavigate } from 'react-router-dom';

/**
 * Onboarding Component
 * 
 * Renders the onboarding page with brand messaging and feature highlights.
 * Navigates users to registration/login flow.
 * 
 * @returns {JSX.Element} Onboarding page component
 */
const Onboarding = () => {
  const navigate = useNavigate();
  return (
    <div className='relative min-h-screen w-full bg-[#000000] text-white overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#E43636] via-[#F6EFD2] to-[#E2DDB4] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#E2DDB4] via-[#E43636] to-[#F6EFD2] blur-3xl opacity-25' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-5xl text-center'>
          {/* Logo with soft glow */}
          <div className='mx-auto mb-8 inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[#E43636] via-[#F6EFD2] to-[#E2DDB4]'>
            <div className='rounded-2xl bg-[#000000] p-4 sm:p-5'>
              <img src={logo} alt='Next Subscription logo' className='h-12 w-12 sm:h-14 sm:w-14' />
            </div>
          </div>

          {/* Headline */}
          <h1 className='mx-auto max-w-3xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight'>
            Smarter way to manage your subscriptions
          </h1>
          <p className='mx-auto mt-3 max-w-2xl text-gray-300 text-sm sm:text-base'>
            Affordable, secure, and always on time. Manage better. Pay smarter with Next Subscription.
          </p>

          {/* Feature highlights */}
          <div className='mx-auto mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3'>
            <div className='rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
              <p className='text-sm font-medium'>Transparent Pricing</p>
              <p className='mt-1 text-xs text-gray-400'>No surprises. Clear pricing upfront.</p>
            </div>
            <div className='rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
              <p className='text-sm font-medium'>Trusted Providers</p>
              <p className='mt-1 text-xs text-gray-400'>Verified, rated, and reliable.</p>
            </div>
            <div className='rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
              <p className='text-sm font-medium'>Comprehensive Coverage</p>
              <p className='mt-1 text-xs text-gray-400'>Manage all your subscriptions in one place.</p>
            </div>
          </div>

          {/* CTA */}
          <div className='mt-10'>
            <button
              className='inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-base sm:text-lg font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.35)] ring-1 ring-white/10 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]'
              onClick={() => navigate('/user/register')}
            >
              Get Started
            </button>
            <div className='mt-3 text-xs text-gray-400'>
              No signup required to explore. Join in seconds when you're ready.
            </div>
          </div>

          {/* Secondary actions (optional entry points) */}
          <div className='mt-8 flex items-center justify-center gap-4 text-xs sm:text-sm'>
            <button onClick={() => navigate('/about')} className='text-gray-300 hover:text-white transition-colors'>
              Learn more
            </button>
            <span className='h-3 w-px bg-white/15' />
            <button onClick={() => navigate('/about')} className='text-gray-300 hover:text-white transition-colors'>
              How it works
            </button>
          </div>
        </section>
      </main>
    </div>  
  )
}

export default Onboarding