import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import React from "react";

// Mobile-specific typography utilities
export const MobileTypography = {
  // Headings
  h1: (className?: string) => cn(
    "font-bold text-foreground",
    "text-2xl leading-tight", // mobile
    className
  ),
  
  h2: (className?: string) => cn(
    "font-bold text-foreground",
    "text-xl leading-tight", // mobile
    className
  ),
  
  h3: (className?: string) => cn(
    "font-semibold text-foreground",
    "text-lg leading-snug", // mobile
    className
  ),
  
  // Body text
  body: (className?: string) => cn(
    "text-foreground",
    "text-base leading-relaxed", // mobile
    className
  ),
  
  bodySmall: (className?: string) => cn(
    "text-muted-foreground",
    "text-sm leading-relaxed", // mobile
    className
  ),
  
  caption: (className?: string) => cn(
    "text-muted-foreground",
    "text-xs leading-normal", // mobile
    className
  ),
  
  // Interactive text
  button: (className?: string) => cn(
    "font-medium text-foreground",
    "text-base leading-none", // mobile
    className
  ),
  
  link: (className?: string) => cn(
    "text-primary font-medium",
    "text-base leading-relaxed", // mobile
    "hover:underline transition-colors",
    className
  ),
};

// Mobile-specific spacing utilities
export const MobileSpacing = {
  section: "space-y-6", // Mobile sections have more breathing room
  cardGroup: "space-y-4", // Cards are closer together on mobile
  formGroup: "space-y-4", // Forms have consistent spacing
  listItem: "space-y-3", // List items are compact
  headerGroup: "space-y-2", // Headers and subtext
};

// Mobile-specific layout utilities
export const MobileLayout = {
  container: cn(
    "w-full px-4", // Mobile uses full width with padding
    "max-w-none" // No max-width constraint on mobile
  ),
  
  page: cn(
    "min-h-screen bg-background",
    "pb-16" // Account for bottom navigation
  ),
  
  grid: {
    auto: "grid grid-cols-1 gap-4", // Single column on mobile
    stats: "grid grid-cols-2 gap-4", // Two columns for stats
    actions: "grid grid-cols-2 gap-4", // Two columns for action buttons
  },
  
  flex: {
    row: "flex items-center gap-3", // Tighter gaps on mobile
    column: "flex flex-col gap-3",
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
  },
};

// Mobile-specific interactive states
export const MobileStates = {
  // Touch feedback
  touch: cn(
    "transition-transform duration-150 ease-out",
    "active:scale-95" // Visual feedback on touch
  ),
  
  // Focus states for accessibility
  focus: cn(
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    "focus:ring-offset-background"
  ),
  
  // Loading state
  loading: cn(
    "opacity-50 pointer-events-none",
    "transition-opacity duration-200"
  ),
  
  // Disabled state
  disabled: cn(
    "opacity-40 cursor-not-allowed",
    "transition-opacity duration-200"
  ),
};

// Mobile-specific card styles
export const MobileCardStyles = {
  base: cn(
    "bg-gradient-card border-0 shadow-medium",
    "rounded-xl", // More rounded on mobile
    "transition-all duration-200",
    "hover:shadow-glow"
  ),
  
  interactive: cn(
    "active:scale-[0.98]", // Touch feedback
    "cursor-pointer"
  ),
  
  compact: cn(
    "p-4", // Tighter padding on mobile
    "space-y-3" // Tighter internal spacing
  ),
  
  spacious: cn(
    "p-6", // More generous padding
    "space-y-4" // More generous internal spacing
  ),
};

// Mobile-specific button styles
export const MobileButtonStyles = {
  primary: cn(
    "bg-gradient-primary text-primary-foreground",
    "hover:opacity-90 active:scale-95",
    "transition-all duration-200",
    "rounded-xl font-medium"
  ),
  
  secondary: cn(
    "bg-background border border-border",
    "hover:bg-muted/50 active:scale-95",
    "transition-all duration-200",
    "rounded-xl font-medium"
  ),
  
  ghost: cn(
    "hover:bg-muted/50 active:scale-95",
    "transition-all duration-200",
    "rounded-xl font-medium"
  ),
  
  // Size variants
  sm: cn(
    "h-9 px-3 text-sm", // Touch-friendly minimum height
    "min-w-[44px]" // Apple's recommended minimum touch target
  ),
  
  md: cn(
    "h-12 px-6 text-base", // Comfortable touch target
    "min-w-[44px]"
  ),
  
  lg: cn(
    "h-14 px-8 text-lg", // Large touch target
    "min-w-[44px]"
  ),
  
  full: cn(
    "w-full h-12 text-base",
    "min-w-[44px]"
  ),
};

// Mobile-specific input styles
export const MobileInputStyles = {
  base: cn(
    "bg-background border border-border",
    "focus:border-primary focus:ring-2 focus:ring-primary/20",
    "transition-all duration-200",
    "rounded-xl" // More rounded on mobile
  ),
  
  size: cn(
    "h-12 px-4 py-3 text-base", // Touch-friendly sizing
    "min-h-[44px]" // Minimum touch target height
  ),
  
  withIcon: cn(
    "pl-10 pr-4" // Extra padding for icons
  ),
  
  withAction: cn(
    "pr-10 pl-4" // Extra padding for action buttons
  ),
};

// Mobile-specific navigation styles
export const MobileNavigationStyles = {
  bottomNav: cn(
    "fixed bottom-0 left-0 right-0 z-50",
    "bg-background/95 backdrop-blur-md",
    "border-t border-border",
    "safe-area-pb" // Account for device safe areas
  ),
  
  navItem: cn(
    "flex flex-col items-center justify-center p-2",
    "min-h-[44px] min-w-[44px]", // Touch-friendly
    "transition-all duration-200",
    "active:scale-95"
  ),
  
  navItemActive: cn(
    "text-primary bg-primary/10",
    "rounded-lg"
  ),
  
  navItemInactive: cn(
    "text-muted-foreground hover:text-foreground",
    "hover:bg-muted/50",
    "rounded-lg"
  ),
};

// Mobile-specific utility classes
export const MobileUtils = {
  // Safe area utilities for devices with notches
  safeArea: {
    top: "pt-safe-top",
    bottom: "pb-safe-bottom",
    left: "pl-safe-left",
    right: "pr-safe-right",
  },
  
  // Touch-friendly minimum sizes
  touchTarget: "min-h-[44px] min-w-[44px]",
  
  // Mobile-specific shadows
  shadows: {
    soft: "shadow-soft",
    medium: "shadow-medium",
    strong: "shadow-strong",
    glow: "shadow-glow",
  },
  
  // Mobile-specific borders
  borders: {
    subtle: "border border-border/50",
    prominent: "border border-border",
    accent: "border border-primary/20",
  },
  
  // Mobile-specific animations
  animations: {
    fadeIn: "animate-in fade-in duration-300",
    slideUp: "animate-in slide-in-from-bottom-4 duration-300",
    slideDown: "animate-in slide-in-from-top-4 duration-300",
    scaleIn: "animate-in zoom-in-95 duration-200",
  },
};

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  mobile: T;
  desktop: T;
}): T {
  const isMobile = useIsMobile();
  return isMobile ? values.mobile : values.desktop;
}

// Responsive component wrapper
export const ResponsiveComponent: React.FC<{
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  className?: string;
}> = ({ mobile, desktop, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={className}>
      {isMobile ? mobile : desktop}
    </div>
  );
};

export default {
  MobileTypography,
  MobileSpacing,
  MobileLayout,
  MobileStates,
  MobileCardStyles,
  MobileButtonStyles,
  MobileInputStyles,
  MobileNavigationStyles,
  MobileUtils,
  useResponsiveValue,
  ResponsiveComponent,
};