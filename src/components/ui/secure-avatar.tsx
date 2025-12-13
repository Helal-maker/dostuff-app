import React, { useCallback } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface SecureAvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SecureAvatar: React.FC<SecureAvatarProps> = ({ 
  src, 
  alt = "Avatar", 
  fallback = "U",
  className = "",
  size = "md"
}) => {
  // Prevent drag and drop
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  const handleSelectStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl", 
    xl: "text-2xl"
  };

  return (
    <div
      className={`
        relative inline-block select-none pointer-events-none
        ${sizeClasses[size]}
        ${className}
      `}
      draggable={false}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      onSelectStart={handleSelectStart}
      style={{
        userSelect: 'none',
        pointerEvents: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Avatar 
        className={`
          w-full h-full rounded-full overflow-hidden
          select-none pointer-events-none
          ${sizeClasses[size]}
        `}
        style={{
          userSelect: 'none',
          pointerEvents: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      >
        <AvatarImage 
          src={src || undefined}
          alt={alt}
          className="select-none pointer-events-none"
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            filter: 'none',
          }}
          crossOrigin="anonymous"
        />
        <AvatarFallback 
          className={`
            ${textSizeClasses[size]}
            select-none pointer-events-none
            bg-primary text-primary-foreground
          `}
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          }}
        >
          {fallback}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default SecureAvatar;
