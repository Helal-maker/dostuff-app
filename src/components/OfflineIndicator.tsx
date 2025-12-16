import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, RefreshCw, Home, User, BookOpen, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Enhanced Offline Indicator Component
 * Shows connection status and provides offline functionality feedback
 * Includes cached UI for better offline experience
 */
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [cachedData, setCachedData] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showOfflineUI, setShowOfflineUI] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      setShowOfflineUI(false);
      
      // Trigger background sync when coming back online
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const syncManager = (registration as any).sync;
          if (syncManager) {
            await syncManager.register('exam-sync');
            await syncManager.register('profile-sync');
          }
        } catch (error) {
          console.log('Background sync registration failed:', error);
        }
      }
      
      // Show "back online" message briefly
      setTimeout(() => setShowOfflineMessage(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      
      // Show offline UI after a brief delay
      setTimeout(() => setShowOfflineUI(true), 1000);
      
      // Load cached data when going offline
      loadCachedData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for cached data
    if (!navigator.onLine) {
      setShowOfflineUI(true);
      loadCachedData();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedData = async () => {
    try {
      // Check if we have cached exam data
      const cacheNames = await caches.keys();
      const hasCachedData = cacheNames.some(name =>
        name.includes('dostuff-dynamic') || name.includes('dostuff-runtime')
      );
      
      if (hasCachedData) {
        setCachedData({
          exams: 'Available offline',
          profile: 'Available offline',
          results: 'Available offline'
        });
      }
    } catch (error) {
      console.log('Failed to load cached data:', error);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Trigger manual sync
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'MANUAL_SYNC' });
        }
      }
    } catch (error) {
      console.log('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Offline navigation items
  const offlineNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: BookOpen, label: 'Exams', path: '/exams' },
    { icon: BarChart3, label: 'Results', path: '/results' }
  ];

  return (
    <>
      {/* Offline indicator banner */}
      {(!isOnline || showOfflineMessage) && (
        <div className={`
          fixed top-16 left-0 right-0 z-50 bg-red-500 text-white text-center py-3 px-4 text-sm font-medium
          transition-transform duration-300 shadow-lg
          ${!isOnline ? 'translate-y-0' : 'translate-y-0'}
        `}>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">
              {!isOnline ? "You're offline" : "Connection restored"}
            </span>
            {!isOnline && cachedData && (
              <span className="text-xs bg-red-600 px-2 py-1 rounded flex items-center gap-1">
                <Database className="w-3 h-3" />
                Offline mode active
              </span>
            )}
            {isOnline && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Offline UI */}
      {!isOnline && showOfflineUI && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col h-full p-4">
            {/* Offline Header */}
            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <WifiOff className="w-6 h-6 text-red-500" />
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Offline Mode</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-red-600 dark:text-red-400"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>

            {/* Cached Content Info */}
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Database className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Offline Content Available
                    </h4>
                    <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                      <div className="flex justify-between">
                        <span>Cached Exams:</span>
                        <span className="font-medium">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profile Data:</span>
                        <span className="font-medium">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Results:</span>
                        <span className="font-medium">✓</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Changes will sync when you're back online.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Offline Navigation */}
            <Card className="bg-muted/50">
              <div className="p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Quick Access
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {offlineNavItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          // Store navigation intent for when back online
                          localStorage.setItem('offlineNavigationTarget', item.path);
                          window.location.href = item.path;
                        }}
                        className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Icon className="w-5 h-5 mb-1 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Offline Tips */}
            <Card className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                  Offline Tips
                </h4>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>You can still view cached exams and results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Profile information is available offline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>Changes will automatically sync when you're back online</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Online indicator (smaller, bottom position) */}
      {isOnline && showOfflineMessage && (
        <div className="fixed bottom-20 right-4 z-40 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-in slide-in-from-bottom-2">
          <Wifi className="w-3 h-3" />
          <span>Back online</span>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;