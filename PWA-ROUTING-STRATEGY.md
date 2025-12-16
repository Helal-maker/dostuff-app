# PWA Routing Strategy Implementation Guide

## Overview

This document provides a comprehensive implementation guide for the PWA-aware routing strategy that enables mobile PWA users to bypass the landing page and go directly to authentication, while desktop browser users continue to see the landing page as default.

## Architecture

### Core Components

1. **PWA Detection Utility** (`src/lib/pwa-detection.ts`)
   - Framework-agnostic PWA detection
   - Multiple detection methods for cross-browser compatibility
   - Device type detection

2. **Root Route Component** (`src/pages/RootRoute.tsx`)
   - Handles conditional routing logic
   - Manages authentication state
   - Redirects based on PWA mode and auth state

3. **Auth Guard Component** (`src/components/AuthGuard.tsx`)
   - Protects authenticated routes
   - Handles PWA-specific redirects
   - Optional onboarding requirements

4. **PWA Utilities**
   - Auth utilities (`src/lib/auth-utils.ts`)
   - Service worker registration (`src/lib/service-worker-registration.ts`)

5. **PWA Configuration**
   - Manifest (`public/manifest.json`)
   - Service worker (`public/sw.js`)
   - HTML integration (`index.html`)

## Routing Logic

### Root Route Decision Tree

```
User visits "/" → 
├─ If authenticated → redirect to /dashboard (or /teacher-onboarding)
├─ If PWA standalone mode → redirect to /auth  
├─ If deep link detected → show appropriate page
└─ If browser mode → show landing page (Index)
```

### Auth Guard Decision Tree

```
Protected route access →
├─ If not authenticated → redirect to /auth
├─ If onboarding required → redirect to /teacher-onboarding
└─ If authenticated and requirements met → show protected content
```

## Implementation Steps

### Step 1: PWA Detection

```typescript
// src/lib/pwa-detection.ts
import { initializePwaDetection, isStandalonePWA, isPWAStandalone } from '@/lib/pwa-detection';

// Initialize in app root
useEffect(() => {
  initializePwaDetection();
}, []);

// Use detection in components
const isPWA = isStandalonePWA();
```

### Step 2: Root Route Implementation

```typescript
// src/pages/RootRoute.tsx
const RootRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(isStandalonePWA());
  }, []);

  useEffect(() => {
    if (!isInitialized || loading) return;

    const isDeepLink = location.pathname !== '/' || location.search || location.hash;
    if (isDeepLink) return;

    // Priority 1: Authenticated users
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Priority 2: PWA users
    if (isPWA) {
      navigate('/auth', { replace: true });
      return;
    }

    // Priority 3: Show landing page
  }, [isInitialized, loading, isAuthenticated, user, isPWA]);

  // Render landing page for non-PWA users
  return <Index />;
};
```

### Step 3: Protected Routes with AuthGuard

```typescript
// src/App.tsx
<Route 
  path="/dashboard" 
  element={
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  } 
/>

<Route 
  path="/teacher-onboarding" 
  element={
    <AuthGuard requireOnboarding={true}>
      <TeacherOnboarding />
    </AuthGuard>
  } 
/>
```

### Step 4: PWA-Aware Logout

```typescript
// src/lib/auth-utils.ts
import { pwaSignOut, getLogoutRedirectUrl } from '@/lib/auth-utils';

// In components
const handleSignOut = async () => {
  try {
    await pwaSignOut();
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### Step 5: Service Worker Registration

```typescript
// src/lib/service-worker-registration.ts
import { registerServiceWorker } from '@/lib/service-worker-registration';

// Register service worker
registerServiceWorker({
  onSuccess: (registration) => {
    console.log('Service Worker registered:', registration);
  },
  onUpdate: (registration) => {
    console.log('New Service Worker available');
  }
});
```

### Step 6: PWA Manifest Configuration

```json
// public/manifest.json
{
  "name": "Do Stuff - Exam Platform",
  "short_name": "Do Stuff",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [...],
  "shortcuts": [...]
}
```

## Edge Cases Handling

### 1. Deep Links
- **Implementation**: Check `location.pathname !== '/'` in RootRoute
- **Behavior**: Never redirect if user navigates to specific path
- **Example**: `/exam/share-link` should always work

### 2. Authentication State Changes
- **Implementation**: AuthGuard and RootRoute both check auth state
- **Behavior**: Smooth transitions based on auth changes
- **Example**: Login → redirect to dashboard, Logout → redirect appropriately

### 3. PWA Installation Timing
- **Implementation**: Detect PWA mode on app initialization
- **Behavior**: Handle cases where user installs app after initial load
- **Example**: Handle `beforeinstallprompt` events

### 4. Network Connectivity
- **Implementation**: Service worker handles offline scenarios
- **Behavior**: Cache-first for static assets, network-first for API
- **Example**: Offline mode shows cached content

### 5. Browser Compatibility
- **Implementation**: Multiple PWA detection methods
- **Behavior**: Graceful fallback for unsupported browsers
- **Example**: iOS Safari uses `navigator.standalone`, Android uses CSS media queries

### 6. Logout Behavior
- **Implementation**: PWA-aware logout function
- **Behavior**: PWA users stay in app (redirect to /auth), browser users go to landing page
- **Example**: `pwaSignOut()` handles different redirect scenarios

## Configuration Files

### index.html Updates

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- Theme Colors -->
<meta name="theme-color" content="#3b82f6" />

<!-- iOS PWA Support -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="Do Stuff" />

<!-- Service Worker Registration -->
<script>
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

### Service Worker Configuration

```javascript
// public/sw.js
const CACHE_NAME = 'dostuff-v1.0.0';
const STATIC_CACHE = 'dostuff-static-v1.0.0';
const DYNAMIC_CACHE = 'dostuff-dynamic-v1.0.0';

// Cache-first for static assets
// Network-first for API calls
// Network-first for navigation requests
```

## Testing Strategy

### 1. Browser Testing
- Chrome (Desktop/Mobile)
- Safari (Desktop/Mobile)
- Firefox (Desktop/Mobile)
- Edge (Desktop)

### 2. PWA Installation Testing
- Install from Chrome menu
- Install from Safari "Add to Home Screen"
- Test standalone mode behavior

### 3. Authentication Flow Testing
- Login in PWA mode
- Login in browser mode
- Logout in both modes
- Deep link access

### 4. Offline Testing
- Test offline functionality
- Test cache strategies
- Test service worker updates

## Deployment Considerations

### 1. HTTPS Requirement
- Service workers require HTTPS
- PWA features require secure context

### 2. Caching Strategy
- Implement appropriate cache invalidation
- Monitor cache size
- Handle service worker updates

### 3. Performance Monitoring
- Track PWA installation rates
- Monitor service worker performance
- Measure routing transition times

### 4. Analytics Integration
- Track PWA vs browser usage
- Monitor user flows
- Measure conversion rates

## Framework Integration Notes

### React Router Integration
- Uses `useNavigate`, `useLocation` hooks
- Integrates with React Suspense
- Supports lazy loading

### State Management
- Works with existing auth state
- Integrates with Supabase auth
- Handles loading states

### TypeScript Support
- Fully typed utilities
- Generic AuthGuard component
- Type-safe PWA detection

## Maintenance Guidelines

### 1. Regular Updates
- Update service worker cache version
- Review PWA detection methods
- Update manifest configuration

### 2. Browser Compatibility
- Test new browser versions
- Update detection methods as needed
- Monitor deprecated features

### 3. Performance Optimization
- Monitor bundle size impact
- Optimize PWA detection performance
- Review caching strategies

### 4. User Experience
- Monitor user feedback
- Track installation completion rates
- Optimize routing transitions

## Troubleshooting

### Common Issues

1. **PWA not detected**
   - Check HTTPS requirement
   - Verify manifest.json is accessible
   - Check service worker registration

2. **Routing loops**
   - Check auth state initialization
   - Verify dependency arrays in useEffect
   - Check navigation calls

3. **Service worker not updating**
   - Update cache name/version
   - Check updatefound event handler
   - Verify skipWaiting() calls

4. **PWA install prompt not showing**
   - Check browser support
   - Verify manifest.json configuration
   - Check engagement requirements

### Debug Tools

1. **Browser DevTools**
   - Application tab for service workers
   - Network tab for caching
   - Console for PWA detection logs

2. **Lighthouse PWA Audit**
   - Run PWA audit
   - Check manifest validation
   - Verify service worker functionality

3. **Custom Logging**
   - Add console.log in PWA detection
   - Log routing decisions
   - Track auth state changes

## Conclusion

This PWA routing strategy provides a robust, framework-agnostic solution for delivering different user experiences based on PWA installation status. The implementation ensures smooth transitions, proper edge case handling, and maintains existing functionality while adding PWA-specific enhancements.

The modular architecture allows for easy maintenance and updates, while the comprehensive testing strategy ensures reliability across different browsers and devices.