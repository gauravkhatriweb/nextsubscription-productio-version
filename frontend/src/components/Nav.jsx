// src/components/Nav.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/branding/nextsubscription_main_logo.png';

/**
 * Navigation Bar Component
 * 
 * A modern, sticky navigation bar with glassmorphism effect that includes:
 * - Brand logo and text
 * - Product categories dropdown (Streaming, Music, Creative Tools, AI/GPT, Utilities)
 * - Highlighted 'Payless' CTA pill
 * - Primary 'Start Saving' button
 * - Theme toggle with Framer Motion animation
 * 
 * Features:
 * - Sticky positioning with subtle glass blur and shadow on scroll
 * - Responsive design with mobile hamburger menu
 * - Accessible navigation with proper aria attributes
 * - Smooth theme transitions with localStorage persistence
 * 
 * @component
 */
const Nav = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [theme, setTheme] = useState('dark');
  const menuRef = useRef(null);
  const categoryRefs = useRef({});

  // Initialize theme from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.className = `theme-${savedTheme}`;
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle theme and persist
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = `theme-${newTheme}`;
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Category data
  const categories = [
    {
      id: 'streaming',
      label: 'Streaming',
      providers: ['Netflix', 'Hulu', 'Disney+', 'Amazon Prime']
    },
    {
      id: 'music',
      label: 'Music',
      providers: ['Spotify', 'Apple Music', 'YouTube Music', 'Pandora']
    },
    {
      id: 'creative',
      label: 'Creative Tools',
      providers: ['Adobe', 'Canva', 'Figma', 'Sketch']
    },
    {
      id: 'ai',
      label: 'AI / GPT Tools',
      providers: ['ChatGPT', 'Midjourney', 'Claude', 'Gemini']
    },
    {
      id: 'utilities',
      label: 'Utilities',
      providers: ['NordVPN', 'LastPass', 'Dropbox', 'Grammarly']
    }
  ];

  // Handle category hover/focus
  const handleCategoryEnter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleCategoryLeave = () => {
    setActiveCategory(null);
  };

  // Mobile menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setActiveCategory(null);
    }
  };

  // Menu variants for animation
  const menuVariants = {
    closed: { opacity: 0, y: -20, scale: 0.95 },
    open: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } }
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-colors duration-300 bg-transparent">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Next Subscription logo" className="h-8 w-8" />
            <span className="font-semibold">Next Subscription</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Product Categories Dropdown */}
            <div className="relative" ref={categoryRefs.current['categories']}>
              <button
                onMouseEnter={() => handleCategoryEnter('categories')}
                onFocus={() => handleCategoryEnter('categories')}
                onMouseLeave={handleCategoryLeave}
                onBlur={handleCategoryLeave}
                aria-haspopup="true"
                aria-expanded={activeCategory === 'categories'}
                className="text-theme-primary hover:text-brand-primary transition-colors font-medium relative"
              >
                Categories
                <motion.span
                  layoutId="underline"
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeCategory === 'categories' ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>

              {/* Mega Menu */}
              <AnimatePresence>
                {activeCategory === 'categories' && (
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={menuVariants}
                    className="absolute left-0 mt-2 w-80 rounded-2xl border border-theme-base bg-theme-surface-elevated/95 backdrop-theme text-theme-primary shadow-theme-xl overflow-hidden z-50"
                  >
                    <div className="p-4 grid grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <div key={category.id} className="group">
                          <h3 className="font-semibold text-sm text-theme-primary mb-2">
                            {category.label}
                          </h3>
                          <ul className="space-y-1">
                            {category.providers.map((provider) => (
                              <li key={provider}>
                                <span className="text-xs text-theme-secondary group-hover:text-theme-primary transition-colors">
                                  {provider}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Payless CTA Pill */}
            <div className="bg-gradient-accent px-4 py-2 rounded-full">
              <span className="text-black font-semibold">Payless</span>
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-theme-primary hover:bg-theme-surface transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
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
              </motion.div>
            </button>

            {/* Primary CTA Button */}
            <button
              onClick={() => navigate('/user/register')}
              className="bg-gradient-primary text-black font-semibold px-6 py-2 rounded-xl shadow-theme-brand hover:shadow-[var(--theme-shadow-brand)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Start Saving
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden rounded-full p-2 text-theme-primary hover:bg-theme-surface transition-colors"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 bg-overlay z-40"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-theme-elevated z-50 shadow-theme-xl p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-semibold text-lg">Menu</span>
                <button
                  onClick={toggleMenu}
                  className="rounded-full p-2 text-theme-primary hover:bg-theme-surface"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-6">
                <div>
                  <h3 className="font-semibold text-theme-primary mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <div key={category.id} className="col-span-1">
                        <h4 className="text-sm font-medium text-theme-primary mb-2">{category.label}</h4>
                        <ul className="space-y-1">
                          {category.providers.map((provider) => (
                            <li key={provider}>
                              <span className="text-xs text-theme-secondary">{provider}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-theme-base">
                  <button
                    onClick={() => navigate('/user/register')}
                    className="w-full bg-gradient-primary text-black font-semibold py-3 rounded-xl shadow-theme-brand"
                  >
                    Start Saving
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Nav;