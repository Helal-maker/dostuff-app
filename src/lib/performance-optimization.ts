/**
 * Performance Optimization Service for Do Stuff PWA
 * 
 * Features:
 * - Optimize offline performance
 * - Implement lazy loading strategies
 * - Cache management for better offline experience
 * - Memory management for long-running PWAs
 */

/**
 * Initialize performance optimizations for PWA
 */
export function initializePerformanceOptimizations(): void {
  console.log('Initializing performance optimizations...');

  // Set up performance monitoring
  setupPerformanceMonitoring();

  // Optimize caching strategies
  optimizeCaching();

  // Set up memory management
  setupMemoryManagement();

  // Set up lazy loading
  setupLazyLoading();

  console.log('Performance optimizations initialized');
}

/**
 * Set up performance monitoring
 */
function setupPerformanceMonitoring(): void {
  if ('performance' in window) {
    // Monitor navigation timing
    const navigationTiming = window.performance.timing;
    
    // Monitor memory usage
    if ('memory' in window.performance) {
      setInterval(() => {
        const memory = (window.performance as any).memory;
        if (memory && memory.usedJSHeapSize > 200 * 1024 * 1024) { // 200MB
          console.warn('High memory usage detected:', memory.usedJSHeapSize / 1024 / 1024, 'MB');
          cleanupMemory();
        }
      }, 30000); // Check every 30 seconds
    }
  }
}

/**
 * Optimize caching strategies
 */
function optimizeCaching(): void {
  // Clear old caches periodically
  setInterval(async () => {
    try {
      const cacheNames = await caches.keys();
      const currentTime = Date.now();
      
      for (const cacheName of cacheNames) {
        if (cacheName.includes('dostuff')) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          // Remove old entries (older than 7 days)
          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const dateHeader = response.headers.get('date');
              if (dateHeader) {
                const cacheDate = new Date(dateHeader).getTime();
                if (currentTime - cacheDate > 7 * 24 * 60 * 60 * 1000) { // 7 days
                  await cache.delete(request);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Cache optimization failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // Run daily
}

/**
 * Set up memory management
 */
function setupMemoryManagement(): void {
  // Handle visibility change to clean up when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cleanupMemory();
    }
  });

  // Handle beforeunload to clean up
  window.addEventListener('beforeunload', cleanupMemory);
}

/**
 * Clean up memory
 */
export function cleanupMemory(): void {
  console.log('Cleaning up memory...');

  // Clear temporary caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.includes('temp') || cacheName.includes('runtime')) {
          caches.delete(cacheName).catch(console.error);
        }
      });
    });
  }

  // Clear temporary data
  localStorage.removeItem('temp-data');
  sessionStorage.clear();

  // Run garbage collection (if available)
  if ('gc' in window) {
    (window as any).gc();
  }
}

/**
 * Set up lazy loading for images and components
 */
function setupLazyLoading(): void {
  // Lazy load images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const lazyLoad = (image: HTMLImageElement) => {
    const src = image.getAttribute('data-src');
    if (src) {
      image.src = src;
      image.removeAttribute('data-src');
    }
  };

  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          lazyLoad(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px'
    });

    lazyImages.forEach((img) => {
      observer.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    lazyImages.forEach((img) => {
      lazyLoad(img as HTMLImageElement);
    });
  }
}

/**
 * Optimize offline performance by preloading critical assets
 */
export async function preloadCriticalAssets(): Promise<void> {
  try {
    const criticalAssets = [
      '/',
      '/index.html',
      '/manifest.json',
      '/favicon.ico',
      '/icon-192x192.png',
      '/icon-512x512.png',
      '/assets/logo-dostuff.png'
    ];

    // Preload assets
    await Promise.all(
      criticalAssets.map(async (asset) => {
        try {
          const cache = await caches.open('dostuff-critical');
          await cache.add(asset);
        } catch (error) {
          console.warn(`Failed to preload ${asset}:`, error);
        }
      })
    );

    console.log('Critical assets preloaded');
  } catch (error) {
    console.error('Failed to preload critical assets:', error);
  }
}

/**
 * Optimize service worker performance
 */
export function optimizeServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PERFORMANCE_OPTIMIZE') {
        console.log('Service worker performance optimization triggered');
        cleanupMemory();
      }
    });
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(): any {
  if ('performance' in window) {
    return {
      navigationTiming: window.performance.timing,
      memory: (window.performance as any).memory,
      timing: window.performance.now()
    };
  }
  return null;
}

/**
 * Optimize for offline use
 */
export async function optimizeForOffline(): Promise<void> {
  try {
    // Preload critical assets
    await preloadCriticalAssets();

    // Optimize caching
    optimizeCaching();

    // Set up offline event listeners
    window.addEventListener('offline', () => {
      console.log('Switched to offline mode - optimizing for offline use');
      
      // Reduce animation complexity
      document.body.classList.add('offline-mode');
      
      // Disable non-critical features
      disableNonCriticalFeatures();
    });

    window.addEventListener('online', () => {
      console.log('Switched to online mode - restoring full functionality');
      document.body.classList.remove('offline-mode');
      enableAllFeatures();
    });
  } catch (error) {
    console.error('Failed to optimize for offline:', error);
  }
}

/**
 * Disable non-critical features for offline mode
 */
function disableNonCriticalFeatures(): void {
  // Disable animations
  document.body.style.setProperty('--animation-duration', '0.1s');
  
  // Reduce image quality
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src');
    if (src && src.includes('quality=')) {
      img.setAttribute('src', src.replace('quality=75', 'quality=50'));
    }
  });
}

/**
 * Enable all features for online mode
 */
function enableAllFeatures(): void {
  // Restore animations
  document.body.style.setProperty('--animation-duration', '0.3s');
  
  // Restore image quality
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src');
    if (src && src.includes('quality=')) {
      img.setAttribute('src', src.replace('quality=50', 'quality=75'));
    }
  });
}