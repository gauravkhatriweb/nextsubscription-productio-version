// REF: THEME/REFACTOR: Updated to use centralized constants
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCSSVariables } from '../constants/themeTokens';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const initialTheme = systemPrefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
    }
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    // Store theme in localStorage
    localStorage.setItem('theme', theme);
    
    // Apply CSS variables to root element
    const root = document.documentElement;
    const cssVariables = getCSSVariables(theme);
    
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Apply theme class for compatibility with existing CSS
    root.className = `theme-${theme}`;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};