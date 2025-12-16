/**
 * Enhanced Service Worker Registration Utilities
 * Framework-agnostic service worker management with PWA installation support
 */

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
  onInstallPromptAvailable?: (event: BeforeInstallPromptEvent) => void;
}

/**
 * Enhanced PWA installation prompt event interface
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Register service worker with PWA configuration
 */
export const registerServiceWorker = async (config: ServiceWorkerConfig = {}) => {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported in this browser');
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[PWA] Service worker registration skipped in development');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered successfully:', registration.scope);

    // Handle successful registration
    if (config.onSuccess) {
      config.onSuccess(registration);
    }

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('[PWA] New service worker available');
            
            if (config.onUpdate) {
              config.onUpdate(registration);
            }
          }
        });
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      console.log('[PWA] App is online');
      if (config.onOnline) {
        config.onOnline();
      }
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] App is offline');
      if (config.onOffline) {
        config.onOffline();
      }
    });

    return registration;

  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
};

/**
 * Enhanced PWA installation handler
 */
export const setupPWAInstallPrompt = (config: {
  onPromptAvailable?: (event: BeforeInstallPromptEvent) => void;
  onInstallSuccess?: () => void;
  onInstallDismissed?: () => void;
}) => {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[PWA] Install prompt available');
    
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Store the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    if (config.onPromptAvailable) {
      config.onPromptAvailable(deferredPrompt);
    }
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] PWA was installed successfully');
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    if (config.onInstallSuccess) {
      config.onInstallSuccess();
    }
  });

  return {
    canInstall: () => !!deferredPrompt,
    prompt: async () => {
      if (!deferredPrompt) {
        return false;
      }

      try {
        // Show the install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('[PWA] Install prompt outcome:', outcome);
        
        if (outcome === 'accepted') {
          if (config.onInstallSuccess) {
            config.onInstallSuccess();
          }
        } else {
          if (config.onInstallDismissed) {
            config.onInstallDismissed();
          }
        }
        
        // Clear the deferred prompt
        deferredPrompt = null;
        return outcome === 'accepted';
      } catch (error) {
        console.error('[PWA] Install prompt failed:', error);
        return false;
      }
    }
  };
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      const result = await registration.unregister();
      console.log('[PWA] Service Worker unregistered:', result);
      return result;
    }
    
    return false;
  } catch (error) {
    console.error('[PWA] Service Worker unregistration failed:', error);
    return false;
  }
};

/**
 * Check if the app is running as a PWA
 */
export const isPWA = (): boolean => {
  return isStandalone() || isInWebApInstallPrompt();
};

/**
 * Check if running in standalone mode (PWA installed)
 */
const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

/**
 * Check if browser shows install prompt capability
 */
const isInWebApInstallPrompt = (): boolean => {
  return 'BeforeInstallPromptEvent' in window;
};

/**
 * Request PWA installation (enhanced version)
 */
export const requestPWAInstall = async (): Promise<boolean> => {
  if (!('BeforeInstallPromptEvent' in window)) {
    console.log('[PWA] Install prompt not supported');
    return false;
  }

  try {
    const installPromptEvent = (window as any).deferredPrompt;
    
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      
      console.log('[PWA] Install prompt outcome:', outcome);
      
      // Clear the deferred prompt
      (window as any).deferredPrompt = null;
      
      return outcome === 'accepted';
    }
    
    return false;
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return false;
  }
};

/**
 * Get PWA install prompt availability (enhanced)
 */
export const canInstallPWA = (): boolean => {
  return 'BeforeInstallPromptEvent' in window && !!(window as any).deferredPrompt;
};

/**
 * Update PWA badge/counter (if supported)
 */
export const setPwaBadge = (count: number) => {
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      (navigator as any).setAppBadge(count);
    } else {
      (navigator as any).clearAppBadge();
    }
  }
};

/**
 * Request notification permission (for PWA notifications)
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission;
  }

  return Notification.permission;
};

/**
 * Show PWA notification
 */
export const showPWANotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        ...options
      });
    });
  }
};

/**
 * Check if app is running as installed PWA
 */
export const isAppInstalled = (): boolean => {
  return isStandalone() || 
         window.matchMedia('(display-mode: fullscreen)').matches ||
         window.matchMedia('(display-mode: minimal-ui)').matches;
};

/**
 * Get service worker status
 */
export const getServiceWorkerStatus = async () => {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, registered: false, updated: false };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  
  return {
    supported: true,
    registered: !!registration,
    updated: !!registration?.waiting,
    installing: !!registration?.installing,
    active: !!registration?.active
  };
};

/**
 * Force service worker update
 */
export const updateServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[PWA] Service worker update failed:', error);
    return false;
  }
};