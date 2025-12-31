# AGENTS.md

This file provides guidance to architect-focused agents when working with code in this repository.

## Architect Mode Rules (Non-Obvious Only)

**Exam Security Architecture**: Anti-cheating system requires specific component hierarchy - every exam route must include PWAInstallPrompt, OfflineIndicator, and ResponsiveNavbar for security features to function.

**Dual Profile System**: User authentication fetches from both `profiles` and `user_roles` tables with priority logic. Any changes to authentication must maintain dual-table compatibility.

**Service Worker Architecture**: Service workers disabled in development, enabled in production. PWA features fail silently in dev mode - architectural decisions must account for this split.

**Mobile Architecture**: Dedicated mobile component system in `src/components/mobile/` - desktop components cannot be reused for mobile without significant refactoring.

**Cloudflare Workers Deployment**: Architecture optimized for edge deployment with static asset serving from `dist/` directory.

**Anti-Cheating Dependencies**: Browser lock, tab detection, and violation tracking are interdependent. Removing any component breaks the entire security system.

**Component Security**: `secure-avatar.tsx` provides anti-drag protection required for exam contexts - standard avatars create security vulnerabilities.

**Authentication State Management**: Complex async profile fetching with timeout handling (useAuth.ts:65-69) - changes to auth flow must preserve this pattern.