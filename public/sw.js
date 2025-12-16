/**
 * Enhanced Service Worker for Do Stuff PWA
 * 
 * Features:
 * - Caches app shell for offline functionality
 * - Provides cache-first strategy for static assets
 * - Network-first strategy for API calls
 * - Clean up old caches on activation
 * - Handles skip waiting messages for updates
 * - Enhanced offline fallbacks
 * 
 * Note: Routing redirects are handled client-side by React Router
 * This service worker focuses on caching and offline functionality
 */

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `dostuff-${CACHE_VERSION}`;
const STATIC_CACHE = `dostuff-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dostuff-dynamic-${CACHE_VERSION}`;
const RUNTIME_CACHE = `dostuff-runtime-${CACHE_VERSION}`;

// Assets to cache immediately for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  '/icon.svg',
  '/placeholder.svg',
  '/assets/logo-dostuff.png',
  '/assets/hero-education.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== RUNTIME_CACHE &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Handle skip waiting messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting message received');
    self.skipWaiting();
  }
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirstStrategy(request));
  } else if (isAPIRequest(request)) {
    // Network-first strategy for API calls
    event.respondWith(networkFirstStrategy(request));
  } else if (isNavigationRequest(request)) {
    // Network-first strategy for navigation requests
    event.respondWith(navigationStrategy(request));
  } else {
    // Default strategy for other requests
    event.respondWith(cacheFirstStrategy(request));
  }
});

/**
 * Cache-first strategy - serve from cache, fallback to network
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses for static assets
    if (networkResponse.ok && isStaticAsset(request)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    
    // Return a basic offline response for static assets
    if (isStaticAsset(request)) {
      return new Response('Offline', { 
        status: 503, 
        statusText: 'Service Unavailable' 
      });
    }
    
    throw error;
  }
}

/**
 * Network-first strategy - try network first, fallback to cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses for dynamic content
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for API requests
    if (isAPIRequest(request)) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'This content is not available offline'
      }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

/**
 * Navigation strategy - handle SPA routing
 */
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, trying cache:', error);
    
    // For SPA navigation, try to serve cached index.html
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Final fallback
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Do Stuff - Offline</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
            }
            .container {
              max-width: 400px;
              padding: 2rem;
            }
            h1 { margin-bottom: 1rem; }
            p { opacity: 0.9; line-height: 1.6; }
            button {
              background: white;
              color: #667eea;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              margin-top: 1rem;
            }
            button:hover { transform: translateY(-1px); }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 You're Offline</h1>
            <p>Don't worry! You can still access your cached content. Check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 200
    });
  }
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp|avif)$/);
}

/**
 * Check if request is for an API
 */
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/api/') || 
         url.hostname.includes('supabase') ||
         url.hostname.includes('api.');
}

/**
 * Check if request is for navigation
 */
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'exam-sync') {
    event.waitUntil(syncExamData());
  }
  
  if (event.tag === 'profile-sync') {
    event.waitUntil(syncProfileData());
  }
});

/**
 * Sync exam data when back online
 */
async function syncExamData() {
  try {
    console.log('[SW] Syncing exam data...');
    
    // Get pending exam actions from IndexedDB
    const pendingActions = await getPendingActions('exam-actions');
    
    for (const action of pendingActions) {
      try {
        const response = await fetch('/api/exam-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        if (response.ok) {
          await removePendingAction('exam-actions', action.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync exam action:', error);
      }
    }
    
    console.log('[SW] Exam data sync completed');
  } catch (error) {
    console.error('[SW] Failed to sync exam data:', error);
  }
}

/**
 * Sync profile data when back online
 */
async function syncProfileData() {
  try {
    console.log('[SW] Syncing profile data...');
    
    const pendingActions = await getPendingActions('profile-actions');
    
    for (const action of pendingActions) {
      try {
        const response = await fetch('/api/profile-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        if (response.ok) {
          await removePendingAction('profile-actions', action.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync profile action:', error);
      }
    }
    
    console.log('[SW] Profile data sync completed');
  } catch (error) {
    console.error('[SW] Failed to sync profile data:', error);
  }
}

/**
 * Get pending actions from IndexedDB
 */
async function getPendingActions(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DoStuffOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Remove pending action from IndexedDB
 */
async function removePendingAction(storeName, actionId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DoStuffOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(actionId);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

/**
 * Add pending action to IndexedDB
 */
async function addPendingAction(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DoStuffOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const addRequest = store.add({
        data,
        timestamp: Date.now()
      });
      
      addRequest.onsuccess = () => resolve(addRequest.result);
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Handle push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Do Stuff', options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

/**
 * Periodic background sync (experimental)
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncExamData());
  }
});