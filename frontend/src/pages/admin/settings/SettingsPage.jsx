/**
 * Admin Settings Page (Router)
 * 
 * FIX: Redirects to branding page by default ONLY when on exact /admin/settings path.
 * Prevents redirect loops and preserves current route when refreshing on sub-pages.
 * Main navigation is now handled in AdminLayout with collapsible sub-tabs.
 * 
 * @component
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ROUTE-FIX: Debug logging for redirect logic
  useEffect(() => {
    console.log('[DEBUG] SettingsPage - Current path:', location.pathname);
    // ROUTE-FIX: Only redirect if on exact /admin/settings path (not sub-pages)
    if (location.pathname === '/admin/settings') {
      console.log('[DEBUG] SettingsPage - Redirecting to /admin/settings/branding');
      navigate('/admin/settings/branding', { replace: true });
    } else {
      console.log('[DEBUG] SettingsPage - No redirect needed, path is:', location.pathname);
    }
  }, [navigate, location.pathname]);

  return null;
};

export default SettingsPage;

