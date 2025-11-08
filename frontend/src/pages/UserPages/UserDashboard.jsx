import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import logo from '../../assets/branding/nextsubscription_main_logo.png';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitialized } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated || !user || user.type !== 'user') {
      navigate('/user/login');
    }
  }, [isAuthenticated, user, navigate, isInitialized]);

  // Mock data for dashboard cards
  const subscriptionStats = {
    active: 5,
    expiring: 2,
    pending: 1,
    tickets: 3
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const cardVariants = {
    rest: { 
      scale: 1,
      boxShadow: 'var(--theme-glass-shadow)'
    },
    hover: { 
      scale: 1.02,
      boxShadow: '0 12px 40px rgba(228, 54, 54, 0.25)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Navigation items for sidebar
  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/user/dashboard' },
    { name: 'Subscriptions', icon: '📋', path: '/user/subscriptions' },
    { name: 'Support', icon: '💬', path: '/legal/contact' },
    { name: 'Settings', icon: '⚙️', path: '/user/profile' },
  ];

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[var(--theme-background)]'>
        <div className='text-[var(--theme-text)]'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-primary)]/15 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-30' />
      
      <div className='flex'>
        {/* Mobile sidebar toggle */}
        <button 
          className='md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)]'
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg className='w-6 h-6 text-[var(--theme-text)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>

        {/* Sidebar */}
        <motion.aside 
          className={`fixed md:relative z-20 h-screen w-64 bg-[var(--theme-surface)] border-r border-[var(--theme-border)] transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
          initial={{ x: -200 }}
          animate={{ x: sidebarOpen ? 0 : -200 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className='p-6 border-b border-[var(--theme-border)]'>
            <div className='flex items-center space-x-3'>
              <div className='inline-flex items-center justify-center rounded-2xl p-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-accent)] to-[var(--theme-secondary)]'>
                <div className='rounded-2xl bg-[var(--theme-background)] p-2'>
                  <img src={logo} alt='Next Subscription logo' className='h-8 w-8' />
                </div>
              </div>
              <h1 className='text-xl font-bold text-[var(--theme-text)]'>Next Subscription</h1>
            </div>
          </div>
          
          <nav className='p-4'>
            <ul className='space-y-2'>
              {navItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className='flex items-center space-x-3 px-4 py-3 rounded-xl text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors duration-200'
                  >
                    <span className='text-lg'>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
              >
                <button
                  onClick={() => {
                    // Handle logout
                    navigate('/');
                  }}
                  className='w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[var(--theme-text)] hover:bg-[var(--theme-surface-hover)] transition-colors duration-200'
                >
                  <span className='text-lg'>🚪</span>
                  <span>Logout</span>
                </button>
              </motion.li>
            </ul>
          </nav>
        </motion.aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className='fixed inset-0 z-10 bg-black/50 md:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className='flex-1 p-4 md:p-8'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mb-8'
          >
            <h1 className='text-2xl md:text-3xl font-bold text-[var(--theme-text)]'>
              Hi {user?.name || 'there'}, your subscriptions at a glance.
            </h1>
            <p className='text-[var(--theme-text-secondary)] mt-2'>
              Manage all your subscriptions in one place
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
          >
            {/* Active Subscriptions Card */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-6 shadow-[var(--theme-glass-shadow)] transition-all duration-300'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-[var(--theme-text)]'>Active Subscriptions</h3>
                <span className='text-2xl'>✅</span>
              </div>
              <p className='text-3xl font-bold mt-4 text-[var(--theme-primary)]'>{subscriptionStats.active}</p>
              <p className='text-sm text-[var(--theme-text-secondary)] mt-2'>Currently active services</p>
            </motion.div>

            {/* Expiring Soon Card */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-6 shadow-[var(--theme-glass-shadow)] transition-all duration-300'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-[var(--theme-text)]'>Expiring Soon</h3>
                <span className='text-2xl'>⏰</span>
              </div>
              <p className='text-3xl font-bold mt-4 text-[var(--theme-warning)]'>{subscriptionStats.expiring}</p>
              <p className='text-sm text-[var(--theme-text-secondary)] mt-2'>Renew before they end</p>
            </motion.div>

            {/* Pending Renewals Card */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-6 shadow-[var(--theme-glass-shadow)] transition-all duration-300'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-[var(--theme-text)]'>Pending Renewals</h3>
                <span className='text-2xl'>🔄</span>
              </div>
              <p className='text-3xl font-bold mt-4 text-[var(--theme-info)]'>{subscriptionStats.pending}</p>
              <p className='text-sm text-[var(--theme-text-secondary)] mt-2'>Action required</p>
            </motion.div>

            {/* Warranty Tickets Card */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-6 shadow-[var(--theme-glass-shadow)] transition-all duration-300'
            >
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-[var(--theme-text)]'>Warranty Tickets</h3>
                <span className='text-2xl'>🎟️</span>
              </div>
              <p className='text-3xl font-bold mt-4 text-[var(--theme-accent)]'>{subscriptionStats.tickets}</p>
              <p className='text-sm text-[var(--theme-text-secondary)] mt-2'>Open support requests</p>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='mt-10'
          >
            <div className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] backdrop-blur-md p-8 shadow-[var(--theme-glass-shadow)] text-center'>
              <h2 className='text-2xl font-bold text-[var(--theme-text)] mb-4'>Need more subscriptions?</h2>
              <p className='text-[var(--theme-text-secondary)] mb-6 max-w-2xl mx-auto'>
                Discover and manage all your subscriptions in one place. Get exclusive deals and save money on your favorite services.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/user/checkout')}
                className='inline-flex items-center justify-center rounded-full bg-[var(--theme-primary)] px-8 py-4 text-base font-semibold text-white shadow-[var(--theme-shadow-brand)] transition-all duration-200 hover:bg-[var(--theme-primary)] hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(228,54,54,0.4)]'
              >
                Buy More Subscriptions
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;