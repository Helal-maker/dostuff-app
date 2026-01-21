# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

**Service Worker Registration**: Service workers are intentionally **disabled in development mode** (vite.config.ts:35-37). Only register in production builds - this causes PWA features to fail silently in dev.

**Supabase Auth Configuration**: The client has explicit auth settings in `src/integrations/supabase/client.ts:10-16` - localStorage storage, persistent sessions, and auto-refresh are all enabled by default.

**Component Tagging**: `lovable-tagger` plugin only activates in development mode (vite.config.ts:14-15). Production builds exclude component tags for performance.

**Wrangler Deployment**: Project deploys to Cloudflare Workers (wrangler.toml), not standard hosting. Build command must be `npm run build` and outputs to `dist/`.

**Dual Authentication System**: User profiles come from both `profiles` and `user_roles` tables. The `useAuth` hook (src/hooks/useAuth.ts:34-38) fetches from both, with role priority logic.

**Anti-Cheating Integration**: Every exam route in App.tsx includes anti-cheating components. Missing `PWAInstallPrompt`, `OfflineIndicator`, or `ResponsiveNavbar` breaks exam security features.

**PWA Manifest Complexity**: Manifest includes protocol handlers (`web+dostuff`), file handlers for `.dostuff/.exam` files, and extensive permissions beyond standard PWAs.

**Mobile Component Separation**: Dedicated mobile components in `src/components/mobile/` with specialized styling utilities. Desktop components won't work properly on mobile without these.

**Secure Avatar Protection**: `secure-avatar.tsx` has extensive anti-drag/anti-drop protection (lines 19-47). Regular avatars should use this component to prevent content copying.

**Path Alias Configuration**: TypeScript paths configured in tsconfig.json:9-11 with `@/*` mapping to `./src/*`. Vite resolves these in vite.config.ts:18-20.

## Commands

**Development**: `npm run dev` (Vite on port 8080, service workers disabled)
**Production Build**: `npm run build` (for Cloudflare Workers deployment)
**Build Dev Mode**: `npm run build:dev` (different from standard build)
**Lint**: `npm run lint` (ESLint with TypeScript support)
**Preview**: `npm run preview` (Vite preview server)
**PWA Icons**: `npm run generate:pwa-icons` (generates all PWA icon sizes)