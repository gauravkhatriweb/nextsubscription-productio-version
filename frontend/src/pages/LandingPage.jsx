import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import PrimaryButton from '../components/ui/PrimaryButton';
import SecondaryButton from '../components/ui/SecondaryButton';
import GlassCard from '../components/GlassCard';
import { LANDING_CONTENT } from '../utils/landingContent';
import { useTheme } from '../theme/ThemeProvider';

/**
 * High-Conversion Landing Page for Next Subscription
 * 
 * Implements the 7-Step High-Conversion Formula:
 * 1. Define Audience & Pain Point
 * 2. Powerful Hero Headline
 * 3. Benefits Over Features
 * 4. Single, Clear CTA
 * 5. Visual Trust Cues
 * 6. Social Proof
 * 7. Design Clarity
 */

// Update the Navigation component to improve accessibility
const Navigation = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const categoryRef = useRef(null);

  // Close category menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Product categories for the navigation
  const productCategories = [
    { 
      name: 'Streaming', 
      icon: '📺',
      providers: ['Netflix', 'Disney+', 'HBO Max', 'Amazon Prime'] 
    },
    { 
      name: 'Music', 
      icon: '🎵',
      providers: ['Spotify', 'Apple Music', 'Tidal', 'Deezer'] 
    },
    { 
      name: 'Creative Tools', 
      icon: '🎨',
      providers: ['Adobe CC', 'Figma', 'Canva Pro', 'Sketch'] 
    },
    { 
      name: 'AI / GPT Tools', 
      icon: '🤖',
      providers: ['ChatGPT', 'Claude', 'Midjourney', 'Runway ML'] 
    },
    { 
      name: 'Utilities', 
      icon: '⚙️',
      providers: ['1Password', 'Notion', 'Calendly', 'Grammarly'] 
    }
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-theme-base/80 border-b border-theme-base shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                <span className="text-white font-bold text-sm" aria-hidden="true">NS</span>
              </div>
              <span className="ml-2 text-lg font-bold text-theme-primary">Next Subscription</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Product Categories */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="text-theme-primary hover:text-[var(--theme-primary)] px-3 py-2 rounded-md text-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                aria-haspopup="true"
                aria-expanded={isCategoryOpen}
                aria-label="Product categories"
              >
                Products
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {isCategoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-80 rounded-xl bg-theme-surface-elevated border border-theme-base shadow-lg z-50"
                  role="menu"
                  aria-label="Product categories menu"
                >
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {productCategories.map((category, index) => (
                        <div key={index} className="p-3 rounded-lg hover:bg-theme-surface transition-colors" role="menuitem">
                          <div className="flex items-center">
                            <span className="text-lg mr-2" aria-hidden="true">{category.icon}</span>
                            <span className="font-medium text-theme-primary">{category.name}</span>
                          </div>
                          <div className="mt-2 text-xs text-theme-secondary">
                            {category.providers.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <a href="#benefits" className="text-theme-primary hover:text-[var(--theme-primary)] px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">Benefits</a>
            <a href="#pricing" className="text-theme-primary hover:text-[var(--theme-primary)] px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">Pricing</a>
            <a href="#testimonials" className="text-theme-primary hover:text-[var(--theme-primary)] px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">Testimonials</a>
            <a href="#faq" className="text-theme-primary hover:text-[var(--theme-primary)] px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">FAQ</a>
          </div>

          {/* Right side actions */}
          <div className="flex items-center">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-theme-primary hover:bg-theme-surface transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </motion.svg>
              ) : (
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  aria-hidden="true"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </motion.svg>
              )}
            </button>

            {/* Payless Highlight CTA */}
            <div className="ml-4 hidden md:block">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--theme-accent)] text-[var(--theme-text)]" aria-label="Pay less with our service">
                Payless
              </span>
            </div>

            {/* Primary CTA Button */}
            <div className="ml-4">
              <PrimaryButton 
                size="small" 
                onClick={() => navigate('/user/register')}
                className="hidden md:block"
              >
                Start Saving
              </PrimaryButton>
              <button 
                onClick={() => navigate('/user/register')}
                className="md:hidden p-2 rounded-md text-theme-primary hover:text-[var(--theme-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                aria-label="Start saving"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-theme-primary hover:text-[var(--theme-primary)] hover:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-theme-base border-t border-theme-base"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="text-theme-primary hover:text-[var(--theme-primary)] block px-3 py-2 rounded-md text-base font-medium w-full text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
                aria-haspopup="true"
                aria-expanded={isCategoryOpen}
              >
                <span>Products</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {isCategoryOpen && (
                <div className="mt-2 pl-4 pr-2 space-y-2">
                  {productCategories.map((category, index) => (
                    <div key={index} className="py-2 px-3 rounded-lg bg-theme-surface" role="menuitem">
                      <div className="flex items-center">
                        <span className="text-lg mr-2" aria-hidden="true">{category.icon}</span>
                        <span className="font-medium text-theme-primary">{category.name}</span>
                      </div>
                      <div className="mt-1 text-xs text-theme-secondary">
                        {category.providers.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <a href="#benefits" className="text-theme-primary hover:text-[var(--theme-primary)] block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">Benefits</a>
            <a href="#pricing" className="text-theme-primary hover:text-[var(--theme-primary)] block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">Pricing</a>
            <a href="#testimonials" className="text-theme-primary hover:text-[var(--theme-primary)] block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">Testimonials</a>
            <a href="#faq" className="text-theme-primary hover:text-[var(--theme-primary)] block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]">FAQ</a>
            
            <div className="pt-4 border-t border-theme-base">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--theme-accent)] text-[var(--theme-text)]" aria-label="Pay less with our service">
                  Payless
                </span>
                <PrimaryButton 
                  size="small" 
                  onClick={() => { navigate('/user/register'); setIsMenuOpen(false); }}
                >
                  Start Saving
                </PrimaryButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

// Placeholder for service logos with better dark mode handling
const ServiceLogoPlaceholder = ({ name }) => (
  <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
    <span className="text-xs font-medium text-theme-primary">{name}</span>
  </div>
);

// Update the Hero component to use the theme context
const Hero = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  
  // Animate hero headline on mount
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls]);
  
  // CTA pulse animation
  const ctaControls = useAnimation();
  useEffect(() => {
    const pulse = async () => {
      while (true) {
        await ctaControls.start({
          boxShadow: [
            "0 0 0 0 rgba(228, 54, 54, 0.4)",
            "0 0 0 10px rgba(228, 54, 54, 0.1)",
            "0 0 0 0 rgba(228, 54, 54, 0)"
          ],
          transition: { duration: 2 }
        });
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    };
    pulse();
  }, [ctaControls]);
  
  return (
    <section className="relative overflow-hidden bg-black text-white min-h-screen flex items-center" aria-labelledby="hero-heading">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-background)] via-[var(--theme-background)]/90 to-[var(--theme-primary)]/10"></div>
      
      {/* Animated background elements with parallax */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{
          y: useTransform(useScroll().scrollY, [0, 1000], [0, -100])
        }}
      >
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--theme-primary)]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          aria-hidden="true"
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[var(--theme-accent)]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
          aria-hidden="true"
        />
      </motion.div>
      
      {/* Service logo silhouettes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* LANDING-FIX: Improve provider strip with better contrast handling */}
        <div className="grid grid-cols-3 gap-8 opacity-20">
          <ServiceLogoPlaceholder name="Netflix" />
          <ServiceLogoPlaceholder name="Spotify" />
          <ServiceLogoPlaceholder name="Adobe" />
          <ServiceLogoPlaceholder name="Apple" />
          <ServiceLogoPlaceholder name="Microsoft" />
          <ServiceLogoPlaceholder name="Google" />
        </div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 text-center">
        <motion.h1 
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          style={{ fontFamily: 'Poppins, Inter, system-ui' }}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
        >
          {/* LANDING-FIX: Update hero headline to emphasize broad product scope */}
          <div>Premium Subscriptions.</div>
          <div className="text-[var(--theme-primary)]">Pay Less.</div>
          <div>Stay Secure.</div>
        </motion.h1>
        <motion.p 
          className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[var(--theme-accent)]/80 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* LANDING-FIX: Update subheadline to emphasize broad product scope */}
          Access Netflix, Adobe, GPT & more — verified vendors, warranties, worry-free sharing.
        </motion.p>
        {/* LANDING-FIX: Add product categories row */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="text-sm bg-theme-surface/20 px-3 py-1 rounded-full">Streaming</span>
          <span className="text-sm bg-theme-surface/20 px-3 py-1 rounded-full">Music</span>
          <span className="text-sm bg-theme-surface/20 px-3 py-1 rounded-full">Creative Tools</span>
          <span className="text-sm bg-theme-surface/20 px-3 py-1 rounded-full">AI</span>
          <span className="text-sm bg-theme-surface/20 px-3 py-1 rounded-full">Utilities</span>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div
            animate={ctaControls}
          >
            <PrimaryButton 
              size="large" 
              onClick={() => navigate('/user/register')}
              className="w-full sm:w-auto"
            >
              {LANDING_CONTENT.hero.primaryCta}
            </PrimaryButton>
          </motion.div>
          <SecondaryButton 
            size="large" 
            variant="outline"
            onClick={() => navigate('/about')}
            className="w-full sm:w-auto"
          >
            {LANDING_CONTENT.hero.secondaryCta}
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};

const Benefits = () => (
  <section id="benefits" className="py-20 bg-theme-base relative" aria-labelledby="benefits-heading">
    <div className="absolute top-10 right-10 text-4xl font-bold text-[var(--theme-primary)]/5">
      01
    </div>
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 id="benefits-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          {LANDING_CONTENT.benefits.headline}
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-theme-secondary">
          {LANDING_CONTENT.benefits.subheadline}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {LANDING_CONTENT.benefits.items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            role="article"
            aria-labelledby={`benefit-${index}-title`}
          >
            <GlassCard className="text-center p-8 hover:scale-[1.02] transition-transform">
              <div className="w-16 h-16 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                {item.icon === "shield" && (
                  <svg className="w-8 h-8 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                )}
                {item.icon === "verified" && (
                  <svg className="w-8 h-8 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
                  </svg>
                )}
                {item.icon === "lock" && (
                  <svg className="w-8 h-8 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                )}
              </div>
              <h3 id={`benefit-${index}-title`} className="text-xl font-semibold text-theme-primary mb-3">{item.title}</h3>
              <p className="text-theme-secondary">
                {item.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      
      {/* CTA Button */}
      <div className="mt-12 text-center">
        <PrimaryButton 
          size="large" 
          onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
        >
          See How Much You Can Save
        </PrimaryButton>
      </div>
    </div>
  </section>
);

const PricingComparison = () => (
  <section id="pricing" className="py-20 bg-theme-elevated relative">
    <div className="absolute top-10 right-10 text-4xl font-bold text-[var(--theme-primary)]/5">
      02
    </div>
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          {LANDING_CONTENT.pricing.headline}
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-theme-secondary">
          {LANDING_CONTENT.pricing.subheadline}
        </p>
        
        {/* Stats Counter */}
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--theme-primary)]">{LANDING_CONTENT.stats.activeSubscriptions}</div>
            <div className="text-theme-secondary">Active Subscriptions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--theme-primary)]">{LANDING_CONTENT.stats.satisfiedCustomers}</div>
            <div className="text-theme-secondary">Satisfied Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--theme-primary)]">{LANDING_CONTENT.stats.averageSavings}</div>
            <div className="text-theme-secondary">Average Savings</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <GlassCard className="p-8 border-l-4 border-[var(--theme-accent)]">
          <h3 className="text-2xl font-bold text-theme-primary mb-6">{LANDING_CONTENT.pricing.original.title}</h3>
          <div className="space-y-6">
            {LANDING_CONTENT.pricing.original.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center pb-4 border-b border-theme-base">
                <span className="text-theme-primary">{item.name}</span>
                <span className="text-xl font-bold text-[var(--theme-primary)]">{item.price}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold text-theme-primary">Total Monthly Cost</span>
              <span className="text-2xl font-bold text-[var(--theme-primary)]">{LANDING_CONTENT.pricing.original.total}</span>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-8 border-l-4 border-[var(--theme-primary)]">
          <h3 className="text-2xl font-bold text-theme-primary mb-6">{LANDING_CONTENT.pricing.nextSubscription.title}</h3>
          <div className="space-y-6">
            {LANDING_CONTENT.pricing.nextSubscription.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center pb-4 border-b border-theme-base">
                <span className="text-theme-primary">{item.name}</span>
                <span className="text-xl font-bold text-[var(--theme-primary)]">{item.price}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4">
              <span className="text-xl font-bold text-theme-primary">Total Monthly Cost</span>
              <span className="text-2xl font-bold text-[var(--theme-primary)]">{LANDING_CONTENT.pricing.nextSubscription.total}</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[var(--theme-primary)]/10 rounded-lg text-center">
            <p className="text-lg font-bold text-[var(--theme-primary)]">{LANDING_CONTENT.pricing.nextSubscription.savings}</p>
          </div>
        </GlassCard>
      </div>
      
      {/* CTA Button */}
      <div className="mt-12 text-center">
        <PrimaryButton 
          size="large" 
          onClick={() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' })}
        >
          See What Our Customers Say
        </PrimaryButton>
      </div>
    </div>
  </section>
);


const FAQ = () => (
  <section
    id="faq"
    className="py-20 bg-theme-elevated relative flex justify-center items-center text-center"
    aria-labelledby="faq-heading"
  >
    {/* Background Section Number */}
    <div className="absolute top-10 right-10 text-4xl font-bold text-[var(--theme-primary)]/5">
      04
    </div>

    {/* Container */}
    <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mx-auto">
      {/* Heading */}
      <div className="mb-16">
        <h2
          id="faq-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4"
          style={{ fontFamily: 'Poppins, Inter, system-ui' }}
        >
          {LANDING_CONTENT.faq.headline}
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-theme-secondary">
          {LANDING_CONTENT.faq.subheadline}
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-stretch">
        {LANDING_CONTENT.faq.items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            role="article"
            aria-labelledby={`faq-${index}-title`}
            className="flex justify-center"
          >
            <GlassCard className="w-full max-w-md p-8 hover:scale-[1.02] transition-transform text-center">
              <h3
                id={`faq-${index}-title`}
                className="text-xl font-semibold text-theme-primary mb-3"
              >
                {item.question}
              </h3>
              <p className="text-theme-secondary">{item.answer}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="mt-12">
        <PrimaryButton
          size="large"
          onClick={() =>
            document.getElementById('process').scrollIntoView({ behavior: 'smooth' })
          }
        >
          Start Saving Today
        </PrimaryButton>
      </div>
    </div>
  </section>
);


const Process = () => (
  <section id="process" className="py-20 bg-theme-base relative">
    <div className="absolute top-10 right-10 text-4xl font-bold text-[var(--theme-primary)]/5">
      03
    </div>
    <div className="mx-auto max-w-6xl px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          {LANDING_CONTENT.process.headline}
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-theme-secondary">
          {LANDING_CONTENT.process.subheadline}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {LANDING_CONTENT.process.steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-[var(--theme-primary)]">{step.number}</span>
            </div>
            <h3 className="text-xl font-semibold text-theme-primary mb-3">{step.title}</h3>
            <p className="text-theme-secondary">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
      
      {/* CTA Button */}
      <div className="mt-12 text-center">
        <PrimaryButton 
          size="large" 
          onClick={() => document.getElementById('trust').scrollIntoView({ behavior: 'smooth' })}
        >
          Learn About Our Security
        </PrimaryButton>
      </div>
    </div>
  </section>
);

const Trust = () => {
  const [isShieldAnimating, setIsShieldAnimating] = useState(false);
  
  // Animate shield on hover
  const startShieldAnimation = () => {
    setIsShieldAnimating(true);
    setTimeout(() => setIsShieldAnimating(false), 1000);
  };
  
  return (
    <section id="trust" className="py-20 bg-theme-elevated relative">
      <div className="absolute top-10 right-10 text-4xl font-bold text-[var(--theme-primary)]/5">
        04
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {LANDING_CONTENT.trust.headline}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-theme-secondary">
            {LANDING_CONTENT.trust.subheadline}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <GlassCard className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div 
                  className="w-12 h-12 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                  onMouseEnter={startShieldAnimation}
                >
                  <motion.svg 
                    className="w-6 h-6 text-[var(--theme-primary)]"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                    animate={isShieldAnimating ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </motion.svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-theme-primary mb-2">{LANDING_CONTENT.trust.items[0].title}</h3>
                  <p className="text-theme-secondary">
                    {LANDING_CONTENT.trust.items[0].description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[var(--theme-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[var(--theme-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-theme-primary mb-2">{LANDING_CONTENT.trust.items[1].title}</h3>
                  <p className="text-theme-secondary">
                    {LANDING_CONTENT.trust.items[1].description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
          
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-2xl flex items-center justify-center">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 text-center">
                  <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-white">100% Secure</h3>
                </div>
              </div>
              <motion.div 
                className="absolute -top-4 -right-4 w-32 h-32 bg-[var(--theme-primary)]/20 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.2, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mt-12 text-center">
          <PrimaryButton 
            size="large" 
            onClick={() => document.getElementById('testimonials').scrollIntoView({ behavior: 'smooth' })}
          >
            See What Our Customers Say
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
};

/**
 * Keep Testimonials section
 */
const Testimonials = () => {
  const [hoveredTestimonial, setHoveredTestimonial] = useState(null);
  
  return (
    <section id="testimonials" className="py-20 bg-theme-base relative" aria-labelledby="testimonials-heading">
      <div className="absolute top-10 right-10 text-4xl font-bold text-[var(--theme-primary)]/5">
        05
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 id="testimonials-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-primary mb-4" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {LANDING_CONTENT.testimonials.headline}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-theme-secondary">
            {LANDING_CONTENT.testimonials.subheadline}
          </p>
        </div>
        
        {/* LANDING-FIX: Center testimonials and improve visual hierarchy */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {LANDING_CONTENT.testimonials.items.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onHoverStart={() => setHoveredTestimonial(testimonial.id)}
              onHoverEnd={() => setHoveredTestimonial(null)}
              className="h-full"
              role="article"
              aria-labelledby={`testimonial-${testimonial.id}-name`}
            >
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[var(--theme-primary)]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-theme-primary mb-4 italic flex-grow">"{testimonial.text}"</p>
                <div className="mt-auto">
                  <p id={`testimonial-${testimonial.id}-name`} className="text-theme-secondary font-medium">— {testimonial.author}</p>
                  {hoveredTestimonial === testimonial.id && (
                    <motion.p 
                      className="text-[var(--theme-primary)] text-sm mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      See Review →
                    </motion.p>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-[var(--theme-primary)] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="text-theme-primary font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-[var(--theme-primary)] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
              </svg>
              <span className="text-theme-primary font-medium">Verified Vendors</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-[var(--theme-primary)] mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span className="text-theme-primary font-medium">Warranty Included</span>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mt-12 text-center">
          <PrimaryButton 
            size="large" 
            onClick={() => document.getElementById('cta').scrollIntoView({ behavior: 'smooth' })}
          >
            Join Thousands Saving Every Month
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section id="cta" className="py-20 bg-gradient-to-r from-[var(--theme-background)] to-[var(--theme-primary)] relative">
      <div className="absolute top-10 right-10 text-4xl font-bold text-[var(--theme-accent)]/10">
        06
      </div>
      <div className="mx-auto max-w-4xl px-6">
        <GlassCard className="p-12 text-center bg-white/5 border-white/10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            {LANDING_CONTENT.finalCta.headline}
          </h2>
          <p className="text-[var(--theme-accent)]/90 text-lg mb-8 max-w-2xl mx-auto">
            {LANDING_CONTENT.finalCta.subheadline}
          </p>
          <PrimaryButton 
            size="large" 
            onClick={() => navigate('/user/register')}
            className="w-full sm:w-auto"
          >
            {LANDING_CONTENT.finalCta.primaryCta}
          </PrimaryButton>
        </GlassCard>
      </div>
    </section>
  );
};

const MiniFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  // LANDING-FIX: Add more comprehensive FAQ items
  const faqItems = [
    {
      question: "How is this legal and safe?",
      answer: "Our service operates through verified vendors who provide legitimate account sharing options. All vendors undergo rigorous verification, and we provide a 100% satisfaction guarantee with warranty protection for all subscriptions."
    },
    {
      question: "What warranties do you offer?",
      answer: "We offer a 30-day replacement guarantee window. If your subscription stops working, we'll replace it or provide a full refund. Our customer support team is available 24/7 to assist with any issues."
    },
    {
      question: "How does access work?",
      answer: "Depending on the vendor, you'll receive either an invite link, shared account credentials, or a license key. All access methods are verified and tested by our team before being offered to customers."
    },
    {
      question: "How do I get help?",
      answer: "Our support team is available 24/7 through our help center. You can also contact us directly via email at support@nextsubscription.com or through the live chat feature in your account dashboard."
    }
  ];
  
  return (
    <section id="faq" className="py-16 bg-theme-base border-t border-theme-base" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-4xl px-6">
        <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-theme-primary mb-8 text-center" style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
          {LANDING_CONTENT.faq.headline}
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <GlassCard key={index} className="p-6">
              <button
                className="flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] rounded-md p-2 -m-2"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg font-semibold text-theme-primary">{item.question}</h3>
                <motion.svg 
                  className={`w-5 h-5 text-[var(--theme-primary)] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </motion.svg>
              </button>
              <motion.div
                id={`faq-answer-${index}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: openIndex === index ? 'auto' : 0, 
                  opacity: openIndex === index ? 1 : 0 
                }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-theme-secondary overflow-hidden"
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <p id={`faq-question-${index}`} className="sr-only">{item.question}</p>
                <p>{item.answer}</p>
              </motion.div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="text-theme-primary bg-theme-elevated border-t border-theme-base">
      <div className="h-[1px] w-full bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent" />
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* LANDING-FIX: Improve footer layout with 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-[var(--theme-primary)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">NS</span>
              </div>
              <span className="font-semibold text-xl">Next Subscription</span>
            </div>
            <p className="text-theme-secondary text-sm mb-4">
              Verified access to premium subscriptions at a fraction of the price — secure, simple, guaranteed.
            </p>
          </div>
          
          {/* Column 2: Links */}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#benefits" className="text-theme-secondary hover:text-[var(--theme-primary)]">Benefits</a>
              </li>
              <li>
                <a href="#pricing" className="text-theme-secondary hover:text-[var(--theme-primary)]">Pricing</a>
              </li>
              <li>
                <a href="#testimonials" className="text-theme-secondary hover:text-[var(--theme-primary)]">Testimonials</a>
              </li>
              <li>
                <a href="#faq" className="text-theme-secondary hover:text-[var(--theme-primary)]">FAQ</a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Contact */}
          <div>
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Contact Us</h3>
            <p className="text-theme-secondary text-sm mb-4">
              Have questions or need assistance? Reach out to us.
            </p>
            <div className="flex items-center space-x-4">
              <a href="mailto:support@nextsubscription.com" className="text-theme-secondary hover:text-[var(--theme-primary)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </a>
              <a href="https://twitter.com/nextsubscription" className="text-theme-secondary hover:text-[var(--theme-primary)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.777.017-.39.03-.776.031-1.172 0-1.408-.39-2.737-1.039-3.947-.757-.398-1.682-.618-2.707-.77a11.955 11.955 0 00-2.548 4.834c-.714 1.73-.885 3.66-1.184 5.417-.299 1.749-.299 3.499.001 5.248.293 1.749 1.027 3.284 2.104 4.507a11.952 11.952 0 006.426 2.548c7.693 0 14.139-6.444 14.139-14.138 0-.206 0-.412-.011-.617C22.092 4.752 22.007 4.596 21.92 4.557zM7.26 14.043a3.034 3.034 0 001.707 2.291 3.027 3.027 0 01-1.707-2.291zm0-9.507a3.027 3.027 0 00-1.707 2.292 3.034 3.034 0 011.707-2.292z"></path>
                </svg>
              </a>
              <a href="https://facebook.com/nextsubscription" className="text-theme-secondary hover:text-[var(--theme-primary)]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.422 2H6.578C4.015 2 2 4.015 2 6.578v10.844C2 19.985 4.015 22 6.578 22h10.844C19.985 22 22 19.985 22 17.422V6.578C22 4.015 19.985 2 17.422 2zm-7.5 16H7v-4.243c0-1.451.46-2.344 2.032-2.344h1.938V7h-3.57C7.889 7 7 7.889 7 8.999v3.462H8L7.108 18h-1v-3.462c0-1.11-.889-2 1.992-2h1.346V14z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-sm text-theme-secondary">
          © 2023 Next Subscription. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// Sticky bottom CTA bar for mobile
const StickyCTA = () => {
  const navigate = useNavigate();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--theme-background)] border-t border-[var(--theme-primary)]/20 p-4 z-50">
      <PrimaryButton 
        size="large" 
        onClick={() => navigate('/user/register')}
        className="w-full"
      >
        Start Saving Today
      </PrimaryButton>
    </div>
  );
};

// Scroll to top button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollToTopRef = useRef(null);
  
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <>
      {isVisible && (
        <motion.button
          ref={scrollToTopRef}
          className="fixed bottom-24 right-6 md:bottom-6 md:right-6 w-12 h-12 rounded-full bg-[var(--theme-primary)] text-white flex items-center justify-center shadow-lg z-40"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
          </svg>
        </motion.button>
      )}
    </>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-theme-base text-theme-primary">
      <div className="w-full mx-auto max-w-10xl px-4 sm:px-6 lg:px-8">
        <Navigation />
        <Hero />
        <Benefits />
        <PricingComparison />
        <Process />
        <Trust />
        <Testimonials />
        <MiniFAQ />
        <CTASection />
        <Footer />
        <StickyCTA />
        <ScrollToTop />
      </div>
    </div>
  );
};


export default LandingPage;