/**
 * main.jsx - Application Entry Point
 * 
 * This is the main entry point for the Next Subscription application. It initializes
 * the React application with all necessary providers, theme configuration, and global
 * toast notifications. The app uses a dark theme by default with glassmorphism design.
 * 
 * Key Features:
 * - Theme initialization and persistence
 * - React Router for client-side navigation
 * - User context for authentication state management
 * - Global toast notifications with custom styling
 * - Dark mode with CSS custom properties
 */

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { UserProvider } from './context/UserContext.jsx'
import axios from 'axios'
import { themeTokens } from './theme/themeTokens.js'

// FIX: Ensure all axios requests send credentials and admin tokens persist across reloads
axios.defaults.withCredentials = true

let isHandlingAdminUnauthorized = false

axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('adminToken')
    if (token && config?.url?.includes('/api/admin/')) {
      config.headers = config.headers || {}
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''

    if (status === 401 && requestUrl.includes('/api/admin/')) {
      sessionStorage.removeItem('adminToken')

      if (!isHandlingAdminUnauthorized && window.location.pathname.startsWith('/admin')) {
        isHandlingAdminUnauthorized = true
        const redirectUrl = '/admin?session=expired'
        window.location.replace(redirectUrl)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Initialize Theme Configuration
 * 
 * Sets up the application theme on initial load. Reads the saved theme preference
 * from localStorage (defaults to 'dark') and applies the appropriate CSS classes
 * to the document element for consistent theming across the application.
 * 
 * Also loads site settings from backend to apply custom theme colors.
 * 
 * The theme system uses CSS custom properties defined in index.css and applies
 * both theme-specific classes and the 'dark' class for Tailwind compatibility.
 */
const getReadableText = (hex) => {
  if (!hex) return 'var(--theme-text)'
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16) / 255
  const g = parseInt(color.substring(2, 4), 16) / 255
  const b = parseInt(color.substring(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.55 ? 'var(--theme-text)' : 'var(--theme-text)'
}

const applyPalette = (palette) => {
  const root = document.documentElement
  root.style.setProperty('--brand-primary', palette.primary || 'var(--theme-primary)')
  root.style.setProperty('--brand-secondary', palette.secondary || 'var(--theme-secondary)')
  root.style.setProperty('--brand-accent', palette.accent || 'var(--theme-accent)')
  root.style.setProperty('--bg-light', palette.background || 'var(--theme-background)')
  root.style.setProperty('--bg-base', palette.background || 'var(--theme-background)')
  root.style.setProperty('--surface-base', palette.surface || 'var(--theme-surface)')
  root.style.setProperty('--surface-elevated', palette.surface || 'var(--theme-surface)')
  root.style.setProperty('--bg-surface', palette.surface || 'var(--theme-surface)')
  root.style.setProperty('--text-primary', palette.text || 'var(--theme-text)')
  root.style.setProperty('--button-bg', palette.button || palette.primary || 'var(--theme-primary)')
  root.style.setProperty('--button-text', getReadableText(palette.button || palette.primary || 'var(--theme-primary)'))
}

const initializeTheme = async () => {
  let savedTheme = localStorage.getItem('theme')
  let fetchedSettings = null

  try {
    const apiBase = (import.meta.env.VITE_API_BASE_URL && String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/+$/, '')) || 'http://localhost:3000'
    const response = await axios.get(`${apiBase}/api/admin/settings`)

    if (response.data.success) {
      fetchedSettings = response.data.settings

      if (!savedTheme && fetchedSettings.activeThemeMode) {
        savedTheme = fetchedSettings.activeThemeMode
      }

      if (fetchedSettings.faviconUrl) {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
        link.rel = 'icon'
        link.href = `${apiBase}${fetchedSettings.faviconUrl}`
        document.getElementsByTagName('head')[0].appendChild(link)
      }

      if (fetchedSettings.siteName) {
        document.title = fetchedSettings.siteName
      }
    }
  } catch (error) {
    console.warn('Could not load site settings, using defaults')
  }

  const activeMode = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light'
  document.documentElement.className = `theme-${activeMode}`
  if (activeMode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', activeMode)

  const palette = fetchedSettings
    ? (activeMode === 'dark'
        ? (fetchedSettings.themeDark || fetchedSettings.theme)
        : (fetchedSettings.themeLight || fetchedSettings.theme))
    : (activeMode === 'dark'
        ? themeTokens.dark
        : themeTokens.light)

  applyPalette(palette)
}

// Apply theme before rendering to prevent flash of unstyled content
initializeTheme().then(() => {
  /**
   * Render Application
   * 
   * Creates the React root and renders the application with all necessary providers:
   * 
   * - BrowserRouter: Enables client-side routing for SPA navigation
   * - UserProvider: Manages global user authentication state for both subscribers and providers
   * - ToastContainer: Provides global toast notifications with glassmorphism styling
   * 
   * The toast configuration matches the app's design system with dark theme,
   * glassmorphism effects, and consistent spacing.
   */
  createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider>
        <App />
    </UserProvider>
    {/* Global Toast Notifications with Glassmorphism Styling */}
    <ToastContainer
      position="top-right"
      autoClose={2500}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastStyle={{
        background: 'var(--surface-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-base)',
        backdropFilter: 'blur(12px)'
      }}
      bodyStyle={{ fontSize: '0.9rem' }}
    />
  </BrowserRouter>
  )
})