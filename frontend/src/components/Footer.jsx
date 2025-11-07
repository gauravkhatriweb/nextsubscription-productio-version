/**
 * Footer.jsx - Application Footer Component
 * 
 * Reusable footer component with brand information, navigation links,
 * and social media icons. Provides consistent footer across the application.
 * 
 * Key Features:
 * - Brand logo and description
 * - Quick navigation links
 * - Feature highlights for subscribers and providers
 * - Social media links
 * - Copyright information
 * 
 * @component
 */

import React from 'react'
import logo from '../assets/branding/nextsubscription_main_logo.png'

/**
 * Footer Component
 * 
 * Comprehensive footer layout with multiple columns and social links.
 * 
 * @returns {JSX.Element} Footer component
 */
const Footer = () => {
  return (
    <footer className='text-theme-primary bg-theme-elevated'>
      <div className='h-[1px] w-full bg-gradient-brand-flow' />
      <div className='mx-auto max-w-screen-xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div>
          <div className='flex items-center gap-2'>
            <img src={logo} alt='Next Subscription logo' className='h-8 w-8' />
            <span className='font-semibold'>Next Subscription</span>
          </div>
          <p className='mt-3 text-sm text-theme-secondary'>Smarter way to manage your subscriptions. Affordable, secure, and always on time.</p>
          <div className='mt-4 flex items-center gap-3 text-theme-secondary'>
            <a aria-label='Facebook' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-theme-surface hover:bg-theme-surface-elevated transition-colors'>
              f
            </a>
            <a aria-label='Twitter' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-theme-surface hover:bg-theme-surface-elevated transition-colors'>
              x
            </a>
            <a aria-label='Instagram' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-theme-surface hover:bg-theme-surface-elevated transition-colors'>
              ig
            </a>
            <a aria-label='LinkedIn' href='#' className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-theme-surface hover:bg-theme-surface-elevated transition-colors'>
              in
            </a>
          </div>
        </div>
        <div>
          <h4 className='font-semibold'>Quick Links</h4>
          <ul className='mt-3 space-y-2 text-sm text-theme-secondary'>
            <li><a href='#home' className='hover:text-theme-primary hover:underline transition-colors'>Home</a></li>
            <li><a href='#subscribers' className='hover:text-theme-primary hover:underline transition-colors'>Subscribers</a></li>
            <li><a href='#providers' className='hover:text-theme-primary hover:underline transition-colors'>Providers</a></li>
            <li><a href='/legal/terms' className='hover:text-theme-primary hover:underline transition-colors'>Legal</a></li>
            <li><a href='#contact' className='hover:text-theme-primary hover:underline transition-colors'>Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>For Subscribers</h4>
          <ul className='mt-3 space-y-2 text-sm text-theme-secondary'>
            <li><a href='#subscribers' className='hover:text-theme-primary hover:underline transition-colors'>Affordable Plans</a></li>
            <li><a href='#subscribers' className='hover:text-theme-primary hover:underline transition-colors'>Security First</a></li>
            <li><a href='#subscribers' className='hover:text-theme-primary hover:underline transition-colors'>Seamless Management</a></li>
          </ul>
        </div>
        <div>
          <h4 className='font-semibold'>For Providers</h4>
          <ul className='mt-3 space-y-2 text-sm text-theme-secondary'>
            <li><a href='#providers' className='hover:text-theme-primary hover:underline transition-colors'>Instant Revenue</a></li>
            <li><a href='#providers' className='hover:text-theme-primary hover:underline transition-colors'>Flexible Plans</a></li>
            <li><a href='#providers' className='hover:text-theme-primary hover:underline transition-colors'>Lowest Commission</a></li>
          </ul>
        </div>
      </div>
      <div className='border-t border-theme-border-base'>
        <div className='mx-auto max-w-screen-xl px-6 py-4 text-center text-xs text-theme-subtle'>© 2025 Next Subscription. All rights reserved.</div>
      </div>
    </footer>
  )
}

export default Footer