# AGENTS.md

This file provides guidance to debug-focused agents when working with code in this repository.

## Debug Mode Rules (Non-Obvious Only)

**Service Worker Debugging**: Service workers are disabled in development mode. Debug PWA features using `npm run build` and `npm run preview` instead of `npm run dev`.

**Anti-Cheating Logs**: Check `src/lib/anti-cheating/violation-tracker.ts` for security violation logs. Browser lock failures and tab switches are logged but don't show console errors.

**Supabase Auth Debugging**: Authentication issues often stem from dual profile/role fetching (useAuth.ts:34-38). Check both `profiles` and `user_roles` tables.

**PWA Debugging**: Service worker status available via `getServiceWorkerStatus()` in service-worker-registration.ts. Check browser DevTools > Application > Service Workers.

**Push Notification Debugging**: Push notifications require HTTPS and proper VAPID keys. Check `src/lib/push-notifications.ts:95` for VITE_PUSH_PUBLIC_KEY environment variable.

**Mobile Debugging**: Use dedicated mobile components from `src/components/mobile/` - desktop components won't work properly on mobile due to styling differences.