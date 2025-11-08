import React from 'react';

/**
 * SecondaryButton component - Provides consistent secondary button styling
 * with glassmorphism effects matching the design system
 */
const SecondaryButton = ({ 
  children, 
  className = '', 
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  variant = 'glass', // 'glass' or 'outline'
  ...props 
}) => {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    glass: `
      bg-[var(--theme-glass-background)] backdrop-blur-md border border-[var(--theme-glass-border)]
      text-[var(--theme-text)] 
      hover:bg-[var(--theme-glass-hover-background)] hover:border-[var(--theme-border-focus)]
    `,
    outline: `
      bg-transparent border-2 border-[var(--theme-primary)]
      text-[var(--theme-primary)]
      hover:bg-[var(--theme-primary)] hover:text-[var(--theme-text)]
    `
  };

  const baseClasses = `
    font-semibold font-['Poppins',sans-serif]
    rounded-xl
    shadow-[var(--theme-shadow-small)]
    hover:shadow-[var(--theme-shadow-medium)]
    hover:scale-[1.02]
    active:scale-[0.98]
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:hover:scale-100 disabled:hover:shadow-[var(--theme-shadow-small)]
    focus:outline-none focus:ring-2 focus:ring-[var(--theme-text)]/20 focus:ring-offset-2
  `;
  
  return (
    <button 
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[var(--theme-text)]/30 border-t-[var(--theme-text)] rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default SecondaryButton;