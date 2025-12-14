import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerAction?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBottomNav = true,
  showHeader = true,
  headerTitle,
  headerAction
}) => {
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Only show mobile layout on mobile devices
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-soft">
          <div className="flex items-center justify-between h-14 px-4">
            {headerAction || <div />}
            {headerTitle && (
              <h1 className="text-lg font-semibold text-foreground truncate">
                {headerTitle}
              </h1>
            )}
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-16">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;