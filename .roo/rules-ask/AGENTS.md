# AGENTS.md

This file provides guidance to ask-focused agents when working with code in this repository.

## Ask Mode Rules (Non-Obvious Only)

**Project Purpose**: This is an exam/testing platform with comprehensive anti-cheating features, not just a simple quiz app.

**Anti-Cheating Documentation**: Comprehensive anti-cheating system in `src/lib/anti-cheating/` with browser lock, tab detection, copy protection, and device tracking.

**PWA Configuration**: Extensive PWA manifest (public/manifest.json) includes protocol handlers, file handlers, and advanced permissions beyond standard PWAs.

**Deployment Platform**: Cloudflare Workers deployment (wrangler.toml), not standard hosting. Build outputs to `dist/` directory.

**Component Library**: Uses shadcn/ui with extensive custom components. Key security component: `secure-avatar.tsx` for exam contexts.

**Authentication System**: Dual profile system using both `profiles` and `user_roles` tables with complex role fetching logic in `useAuth.ts`.

**Mobile vs Desktop**: Separate mobile components in `src/components/mobile/` directory with specialized styling and animations.

**Development vs Production**: Service workers and PWA features only work in production builds, not development mode.