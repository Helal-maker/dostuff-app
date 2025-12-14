import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Mobile-specific slide animation
export const MobileSlideUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className }) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isMobile, delay]);

  return (
    <div
      className={cn(
        "transition-all duration-500 ease-out",
        isMobile && isVisible 
          ? "transform translate-y-0 opacity-100" 
          : isMobile 
            ? "transform translate-y-4 opacity-0"
            : "",
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile card entrance animation
export const MobileCardEntrance: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
}> = ({ children, index, className }) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isMobile, index]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        isMobile && isVisible 
          ? "transform scale-100 opacity-100 translate-y-0" 
          : isMobile 
            ? "transform scale-95 opacity-0 translate-y-2"
            : "",
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile button press animation
export const MobileButtonPress: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}> = ({ children, onClick, disabled, className, type = "button" }) => {
  const [isPressed, setIsPressed] = useState(false);
  const isMobile = useIsMobile();

  const handleMouseDown = () => {
    if (isMobile && !disabled) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    if (isMobile && !disabled) {
      setIsPressed(false);
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={cn(
        "transition-transform duration-150 ease-out",
        isMobile && isPressed ? "scale-95" : "scale-100",
        className
      )}
    >
      {children}
    </button>
  );
};

// Mobile page transition wrapper
export const MobilePageTransition: React.FC<{
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}> = ({ children, direction = "left", className }) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(!isMobile);

  useEffect(() => {
    if (isMobile) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isMobile]);

  const getTransform = () => {
    if (!isMobile || isVisible) return "translate-x-0 translate-y-0";
    
    switch (direction) {
      case "left":
        return "translate-x-4";
      case "right":
        return "-translate-x-4";
      case "up":
        return "translate-y-4";
      case "down":
        return "-translate-y-4";
      default:
        return "translate-x-4";
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        getTransform(),
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile loading spinner
export const MobileLoadingSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className }) => {
  const isMobile = useIsMobile();
  
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div
      className={cn(
        "border-2 border-current border-t-transparent rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
};

// Mobile pull-to-refresh indicator
export const MobilePullToRefresh: React.FC<{
  isRefreshing: boolean;
  pullDistance: number;
  threshold: number;
  className?: string;
}> = ({ isRefreshing, pullDistance, threshold, className }) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      className={cn(
        "flex items-center justify-center transition-all duration-200",
        pullDistance > 0 ? "h-12 opacity-100" : "h-0 opacity-0",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <MobileLoadingSpinner 
          size="sm" 
          className={cn(
            "transition-opacity duration-200",
            isRefreshing ? "opacity-100" : "opacity-50"
          )} 
        />
        <span className="text-sm text-muted-foreground">
          {isRefreshing ? "Refreshing..." : "Pull to refresh"}
        </span>
      </div>
    </div>
  );
};

// Mobile toast notification
export const MobileToast: React.FC<{
  message: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  className?: string;
}> = ({ message, type, isVisible, onClose, duration = 3000, className }) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const typeStyles = {
    success: "bg-success text-success-foreground",
    error: "bg-destructive text-destructive-foreground",
    warning: "bg-warning text-warning-foreground",
    info: "bg-primary text-primary-foreground"
  };

  if (!isMobile) return null;

  return (
    <div
      className={cn(
        "fixed top-20 left-4 right-4 z-50 transition-all duration-300 transform",
        isVisible 
          ? "translate-y-0 opacity-100 scale-100" 
          : "-translate-y-2 opacity-0 scale-95",
        className
      )}
    >
      <div className={cn(
        "px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm",
        typeStyles[type]
      )}>
        <div className="flex items-center justify-between">
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default {
  MobileSlideUp,
  MobileCardEntrance,
  MobileButtonPress,
  MobilePageTransition,
  MobileLoadingSpinner,
  MobilePullToRefresh,
  MobileToast
};