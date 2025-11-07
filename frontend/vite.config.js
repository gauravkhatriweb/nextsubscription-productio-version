/**
 * vite.config.js - Vite Build Configuration
 * 
 * Configuration file for Vite bundler and development server.
 * Configures React plugin and Tailwind CSS integration.
 * 
 * Plugins:
 * - @vitejs/plugin-react: Enables React Fast Refresh and JSX support
 * - @tailwindcss/vite: Tailwind CSS integration for Vite
 * 
 * @see https://vite.dev/config/
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
