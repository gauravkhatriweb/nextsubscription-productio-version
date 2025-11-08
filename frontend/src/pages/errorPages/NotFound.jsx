/**
 * NotFound.jsx - 404 Error Page
 * 
 * Custom 404 error page displayed when user navigates to a non-existent route.
 * Features brand gradient backgrounds and navigation back to home.
 * 
 * Key Features:
 * - Clear 404 error message
 * - Brand-consistent styling
 * - Navigation back to home page
 * 
 * @component
 */

import React from 'react'
import { Link } from 'react-router-dom'

/**
 * NotFound Component
 * 
 * Renders 404 error page with navigation options.
 * 
 * @returns {JSX.Element} 404 error page component
 */
const NotFound = () => {
  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)] via-[var(--theme-accent)] to-[var(--theme-secondary)] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-secondary)] via-[var(--theme-primary)] to-[var(--theme-accent)] blur-3xl opacity-25' />

      <main className='relative z-10 flex min-h-screen items-center justify-center px-6'>
        <section className='w-full max-w-xl text-center'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <h1 className='text-6xl sm:text-7xl font-extrabold tracking-tight'>404</h1>
            <p className='mt-2 text-lg sm:text-xl font-semibold'>Page not found</p>
            <p className='mt-2 text-sm text-gray-300'>
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className='mt-6 flex flex-col sm:flex-row items-center justify-center gap-3'>
              <Link
                to='/'
                className='inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white ring-1 ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:scale-[1.01] transition'
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default NotFound