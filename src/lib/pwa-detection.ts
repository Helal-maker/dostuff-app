/**
 * PWA Detection Utilities
 * Framework-agnostic functions to detect PWA standalone mode
 */

/**
 * Detect if the app is running in PWA standalone mode
 * This works across different browsers and platforms
 */
export const isPWAStandalone = (): boolean => {
  // Check if running in standalone mode (iOS Safari)
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  // Check if running in standalone mode (Android Chrome, Desktop Chrome)
  const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for other PWA indicators
  const isPWA = isIOSStandalone || isAndroidStandalone;
  
  // Additional check for iOS PWA added to home screen
  const isIOSPWALaunch = (window.navigator as any).standalone ||
    (window.matchMedia('(display-mode: standalone)').matches) ||
    (document.referrer.startsWith('android-app://'));
  
  return isPWA || isIOSPWALaunch;
};

/**
 * Detect if the app is running on a mobile device
 * Useful for conditional logic based on device type
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if the app is running in a standalone PWA context
 * More specific than isPWAStandalone - includes additional checks
 */
export const isStandalonePWA = (): boolean => {
  // Check for window.navigator.standalone (iOS Safari)
  const isIOSStandalone = (window.navigator as any).standalone === true;
  
  // Check for display-mode: standalone CSS media query
  const hasStandaloneDisplayMode = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for the document to be in PWA context
  const isInPWAMode = document.documentElement.getAttribute('data-pwa-mode') === 'standalone';
  
  // Check for service worker registration (indicates PWA setup)
  const hasServiceWorker = 'serviceWorker' in navigator;
  
  // Return true if running in standalone mode
  return (isIOSStandalone || hasStandaloneDisplayMode || isInPWAMode) && hasServiceWorker;
};

/**
 * Get the current PWA display mode
 * Returns 'standalone', 'fullscreen', 'minimal-ui', 'browser', or 'unknown'
 */
export const getPwaDisplayMode = (): string => {
  // Check iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return 'standalone';
  }
  
  // Check CSS display-mode media queries
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  
  if (window.matchMedia('(display-mode: browser)').matches) {
    return 'browser';
  }
  
  return 'unknown';
};

/**
 * Add data attributes to document for PWA mode detection
 * This helps with CSS styling and debugging
 */
export const setPwaModeAttribute = (): void => {
  const displayMode = getPwaDisplayMode();
  document.documentElement.setAttribute('data-pwa-mode', displayMode);
  
  if (isStandalonePWA()) {
    document.documentElement.setAttribute('data-pwa-standalone', 'true');
  }
  
  if (isMobile()) {
    document.documentElement.setAttribute('data-mobile', 'true');
  }
};

/**
 * Initialize PWA detection on app load
 * Call this in your app's root component
 */
export const initializePwaDetection = (): void => {
  setPwaModeAttribute();
  
  // Listen for display mode changes (some browsers support this)
  const displayModeQuery = window.matchMedia('(display-mode: standalone)');
  
  const handleDisplayModeChange = (e: MediaQueryListEvent) => {
    setPwaModeAttribute();
  };
  
  if (displayModeQuery.addEventListener) {
    displayModeQuery.addEventListener('change', handleDisplayModeChange);
  } else if (displayModeQuery.addListener) {
    // Fallback for older browsers
    displayModeQuery.addListener(handleDisplayModeChange);
  }
};