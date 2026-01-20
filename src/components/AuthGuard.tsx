import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isStandalonePWA } from '@/lib/pwa-detection';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireOnboarding?: boolean;
}

/**
 * Auth Guard Component
 * Protects routes that require authentication
 * 
 * Features:
 * - Checks authentication status
 * - Handles PWA-specific redirects
 * - Supports optional onboarding requirement
 * - Graceful loading states
 */
const AuthGuard = ({ 
  children, 
  fallback,
  requireOnboarding = false 
}: AuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isAuthenticated, needsOnboarding } = useAuth();
  const isPWA = isStandalonePWA();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to auth
  if (!isAuthenticated || !user) {
    // In PWA standalone mode, redirect to /auth
    // In browser mode, also redirect to /auth
    // Both cases should go to /auth (PWA users came from there anyway)
    const redirectPath = '/auth';
    
    navigate(redirectPath, { 
      replace: true,
      state: { from: location.pathname }
    });
    
    return fallback || null;
  }

  // If onboarding is required and not completed
  if (requireOnboarding && needsOnboarding) {
    navigate('/teacher-onboarding', { 
      replace: true,
      state: { from: location.pathname }
    });
    
    return fallback || null;
  }

  // User is authenticated and has completed any required onboarding
  return <>{children}</>;
};

export default AuthGuard;