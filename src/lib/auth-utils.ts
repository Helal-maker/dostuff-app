import { supabase } from "@/integrations/supabase/client";
import { isStandalonePWA } from "@/lib/pwa-detection";

/**
 * PWA-aware logout utility
 * Handles redirects appropriately for PWA vs browser users
 */
export const pwaSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
    
    // Clear any cached user data
    // This would depend on your caching strategy
    
    // Handle redirect based on PWA mode
    if (isStandalonePWA()) {
      // In PWA standalone mode, redirect to /auth (stay in app)
      window.location.href = '/auth';
    } else {
      // In browser mode, redirect to landing page
      window.location.href = '/';
    }
    
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

/**
 * Get the appropriate redirect URL after authentication
 * based on PWA mode and current location
 */
export const getAuthRedirectUrl = (): string => {
  const isPWA = isStandalonePWA();
  const currentUrl = new URL(window.location.href);
  
  // If user was trying to access a specific page, return there
  const redirectTo = currentUrl.searchParams.get('redirectTo');
  if (redirectTo) {
    return redirectTo;
  }
  
  if (isPWA) {
    // In PWA mode, authenticated users go to dashboard
    return '/dashboard';
  } else {
    // In browser mode, can go back to landing page or dashboard
    return '/dashboard';
  }
};

/**
 * Get the appropriate post-logout redirect URL
 */
export const getLogoutRedirectUrl = (): string => {
  if (isStandalonePWA()) {
    // PWA users should stay in the app and go to auth
    return '/auth';
  } else {
    // Browser users can go to landing page
    return '/';
  }
};

/**
 * Check if the current session is valid
 */
export const isValidSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return !error && !!session;
  } catch {
    return false;
  }
};

/**
 * Get user session with error handling
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};