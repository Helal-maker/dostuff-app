import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isStandalonePWA, isPWAStandalone, initializePwaDetection } from '@/lib/pwa-detection';
import { useAuth } from '@/hooks/useAuth';
import Index from './Index';

/**
 * PWA-aware Root Route Component
 * Handles conditional routing for PWA vs browser experience
 * 
 * Logic:
 * 1. If user is authenticated -> redirect to /dashboard
 * 2. If running in PWA standalone mode -> redirect to /auth
 * 3. If in browser or not PWA -> show landing page (Index)
 * 4. Handle deep links properly (never redirect if user navigates to specific path)
 */
const RootRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [isPWA, setIsPWA] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize PWA detection
    initializePwaDetection();
    setIsPWA(isStandalonePWA());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Don't redirect if still initializing
    if (!isInitialized || loading) return;

    // Don't redirect for deep links or non-root paths
    const isDeepLink = location.pathname !== '/' || location.search || location.hash;
    if (isDeepLink) return;

    // Priority 1: If authenticated, go to dashboard (regardless of PWA mode)
    if (isAuthenticated && user) {
      // If user needs onboarding, redirect there first
      if (user.profile?.role === 'teacher' && !user.profile?.onboarding_completed) {
        navigate('/teacher-onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    // Priority 2: If running in PWA standalone mode, redirect to auth
    if (isPWA || isPWAStandalone()) {
      navigate('/auth', { replace: true });
      return;
    }

    // Priority 3: Otherwise, show landing page (Index component will render)
  }, [isInitialized, loading, isAuthenticated, user, isPWA, navigate, location]);

  // Show loading state while initializing
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, don't render landing page (navigation will handle redirect)
  if (isAuthenticated && user) {
    return null;
  }

  // If PWA and not authenticated, don't render landing page (will redirect to auth)
  if (isPWA && !isAuthenticated) {
    return null;
  }

  // Render landing page for non-PWA users or when not in standalone mode
  return <Index />;
};

export default RootRoute;