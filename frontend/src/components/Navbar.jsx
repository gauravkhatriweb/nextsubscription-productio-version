// src/components/Navbar.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/branding/nextsubscription_main_logo.png'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../context/UserContext'

const Navbar = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState('dark')
  const { user, isAuthenticated, logout: contextLogout } = useUser()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Determine if a logged-in "user" 
  const isUserAuth = isAuthenticated && user?.type === 'user'
  const currentUser = isUserAuth ? user : null

  const getApiBaseUrl = () => {
    return (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Theme persistence (keeps existing behavior)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') setTheme(stored)
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')
    } catch (_) {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
      document.documentElement.className = `theme-${theme}`
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch (_) {}
  }, [theme])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Helpers: get initial and profile image url
  const getInitial = () => {
    const name = currentUser?.firstname || currentUser?.firstName || currentUser?.name || ''
    return String(name || '?').charAt(0).toUpperCase()
  }

  const getProfileImgUrl = () => {
    const p = currentUser?.profilePic || currentUser?.profilepic || currentUser?.avatar || null
    if (!p) return null
    // if path starts with http(s) return as-is, else prefix with API base
    if (/^https?:\/\//i.test(p)) return p
    return `${getApiBaseUrl()}${p.startsWith('/') ? '' : '/'}${p}`
  }

  const handleProfileClick = () => {
    setIsDropdownOpen(false)
    navigate('/user/profile')
  }

  const handleLogout = async () => {
    try {
      setIsActionLoading(true)
      await contextLogout()
      setIsDropdownOpen(false)
      toast.success('Logged out successfully')
      navigate('/user/login')
    } catch (err) {
      // still clear locally
      setIsDropdownOpen(false)
      toast.error('Logout failed (local session cleared).')
      navigate('/user/login')
    } finally {
      setIsActionLoading(false)
    }
  }

  // Toggle between dark and light theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'original', label: 'Original Home', path: '/home' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'subscribers', label: 'Subscribers' },
    { id: 'providers', label: 'Providers' },
    { id: 'contact', label: 'Contact', path: '/legal/contact' },
  ]

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMenuOpen(false)
    }
  }

  const handleNavigation = (item) => {
    if (item.path) {
      navigate(item.path)
      setMenuOpen(false)
    } else {
      scrollTo(item.id)
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-colors ${scrolled ? 'backdrop-theme border-theme-base' : 'bg-transparent'} border-b text-theme-primary`}>
      <div className='mx-auto max-w-screen-xl px-6'>
        <div className='flex h-14 items-center justify-between'>
          {/* Logo */}
          <button onClick={() => scrollTo('home')} className='flex items-center gap-2'>
            <img src={logo} alt='Next Subscription logo' className='h-8 w-8' />
            <span className='font-semibold'>Next Subscription</span>
          </button>

          {/* Desktop nav centered */}
          <nav className='hidden md:flex items-center gap-6 text-sm'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`transition-colors focus:outline-none rounded-full px-2 py-1 ${active === item.id ? 'bg-clip-text text-transparent bg-gradient-brand-flow' : 'opacity-80 hover:opacity-100'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions: Theme toggle, Login or profile circle */}
          <div className='hidden md:flex items-center gap-3 relative' ref={dropdownRef}>
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className='rounded-full p-2 text-theme-primary hover:bg-theme-surface transition-colors'
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {!isUserAuth || !currentUser ? (
              <button onClick={() => navigate('/user/login')} className='rounded-full bg-brand-primary hover:brightness-110 px-4 py-2 text-white text-sm font-semibold shadow-theme-sm transition'>
                Login
              </button>
            ) : (
              <>
                {/* Profile circle - hover opens dropdown */}
                <div
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                  className='relative'
                >
                  <button
                    aria-haspopup='true'
                    aria-expanded={isDropdownOpen}
                    onClick={() => setIsDropdownOpen((s) => !s)}
                    className='relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-white shadow-theme-sm border-2 border-theme-border-base transition-all duration-200'
                    title={`${currentUser?.firstname || 'User'}`}
                  >
                    {getProfileImgUrl() ? (
                      <img
                        src={getProfileImgUrl()}
                        alt='Profile'
                        className='w-full h-full object-cover'
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary text-lg'>
                        {getInitial()}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className='absolute right-0 mt-3 w-48 rounded-2xl border border-theme-base bg-theme-surface-elevated/95 backdrop-theme text-theme-primary shadow-theme-xl overflow-hidden z-50'
                      >
                        <div className='px-4 py-3 border-b border-theme-base'>
                          <p className='text-sm font-semibold'>{currentUser?.firstname || 'User'}</p>
                          <p className='text-xs text-theme-secondary'>{currentUser?.email || ''}</p>
                        </div>

                        <div className='py-2'>
                          <button
                            onClick={() => { setIsDropdownOpen(false); navigate('/user/profile') }}
                            className='w-full text-left px-4 py-3 text-sm hover:bg-theme-surface transition-colors flex items-center gap-3'
                          >
                            Profile
                          </button>

                          <div className='h-px w-full bg-theme-border-base mx-4 my-2' />

                          <button
                            disabled={isActionLoading}
                            onClick={handleLogout}
                            className='w-full text-left px-4 py-3 text-sm hover:bg-error/10 hover:text-error disabled:opacity-60 transition-colors flex items-center gap-3'
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className='flex items-center gap-2 md:hidden'>
            {/* Theme Toggle Button for Mobile */}
            <button 
              onClick={toggleTheme}
              className='rounded-full p-2 text-theme-primary hover:bg-theme-surface transition-colors'
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            <button onClick={() => setMenuOpen(!menuOpen)} className='rounded-lg border border-theme-border-base p-2'>
              <span className='sr-only'>Toggle menu</span>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className='md:hidden border-t border-theme-border-base bg-theme-base/90 backdrop-theme text-theme-primary'>
          <div className='mx-auto max-w-screen-xl px-6 py-3 space-y-2'>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`block w-full text-left rounded-lg px-3 py-2 text-sm ${active === item.id ? 'bg-theme-surface text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}`}
              >
                {item.label}
              </button>
            ))}

            <div className='flex items-center gap-3 pt-2'>
              {!isUserAuth || !currentUser ? (
                <button onClick={() => { setMenuOpen(false); navigate('/user/login') }} className='rounded-full bg-brand-primary px-4 py-2 text-white text-sm font-semibold transition'>Login</button>
              ) : (
                <div className='w-full'>
                  <div className='flex items-center gap-3 px-2'>
                    <div className='w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary text-white'>
                      {getProfileImgUrl() ? (<img src={getProfileImgUrl()} alt='profile' className='w-full h-full object-cover' />) : getInitial()}
                    </div>
                    <div className='flex-1'>
                      <div className='text-sm font-semibold'>{currentUser?.firstname || 'User'}</div>
                      <div className='text-xs text-theme-secondary'>{currentUser?.email || ''}</div>
                    </div>
                  </div>

                  <div className='mt-3 space-y-2'>
                    <button onClick={() => { setMenuOpen(false); navigate('/user/profile') }} className='w-full text-left px-4 py-2 text-sm hover:bg-theme-surface transition'>Profile</button>
                    <button onClick={() => { setMenuOpen(false); handleLogout() }} className='w-full text-left px-4 py-2 text-sm hover:bg-error/10 transition'>Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar