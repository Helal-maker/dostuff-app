# AGENTS.md

This file provides guidance to code-focused agents when working with code in this repository.

## Code Mode Rules (Non-Obvious Only)

**Anti-Cheating Component Requirements**: All exam routes MUST include PWAInstallPrompt, OfflineIndicator, and ResponsiveNavbar (App.tsx:41-44). Missing these breaks exam security features and can cause violations to go undetected.

**Secure Avatar Usage**: Use `secure-avatar.tsx` instead of regular avatars in exam contexts. It has comprehensive anti-drag/anti-drop protection (lines 19-47) that prevents content copying.

**Mobile Component Override**: For mobile-specific features, use components from `src/components/mobile/` directory. Desktop components lack mobile-optimized styling and won't work properly on mobile devices.

**Supabase Client Setup**: The Supabase client in `src/integrations/supabase/client.ts:10-16` has explicit auth configuration - localStorage storage, persistent sessions, and auto-refresh are all enabled. Don't modify these defaults.

**Development vs Production**: Service workers are disabled in development (service-worker-registration.ts:35-37). PWA features work only in production builds, not in dev mode.

**Anti-Cheating Library Usage**: Use `initializeAntiCheating()` from `src/lib/anti-cheating/index.ts` for all exam components. It enables copy protection, fullscreen mode, tab detection, and browser lock.