/**
 * AdminWarning Component
 * 
 * Displays a prominent warning message for the admin portal.
 * 
 * @component
 */

import React from 'react'

const AdminWarning = () => {
  return (
    <div className='glass-card rounded-2xl p-6 mb-8 border-2 border-error/30 bg-error-light/10'>
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0'>
          <svg className='w-6 h-6 text-error' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' />
          </svg>
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-bold text-error mb-2' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            ADMIN PORTAL — AUTHORIZED ACCESS ONLY
          </h3>
          <p className='text-sm text-theme-secondary leading-relaxed'>
            This is a restricted administrative area. Do not proceed unless you are the authorized administrator.
            Unauthorized access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminWarning

