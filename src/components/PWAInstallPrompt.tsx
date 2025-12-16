import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, Bell, Zap, Star, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { canInstallPWA, requestPWAInstall, isAppInstalled } from '@/lib/service-worker-registration';
import { isStandalonePWA, isMobile } from '@/lib/pwa-detection';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
  delay?: number; // Time in milliseconds before showing prompt
  showAdvanced?: boolean; // Show advanced features
}

/**
 * Enhanced PWA Install Prompt Component
 * Shows install prompt with features and benefits
 */
const PWAInstallPrompt = ({
  onDismiss,
  delay = 5000, // 5 seconds default delay
  showAdvanced = true
}: PWAInstallPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasBeenDismissed) {
      setDismissed(true);
      return;
    }

    // Check if app is already installed
    setIsInstalled(isAppInstalled());
    
    // Check if PWA installation is available
    setCanInstall(canInstallPWA());

    // Only show prompt if not installed, can install, and not dismissed
    if (!isAppInstalled() && canInstallPWA() && !hasBeenDismissed) {
      // Show prompt after delay to allow user engagement
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  const handleInstall = async () => {
    if (!canInstall) return;

    setIsInstalling(true);
    
    try {
      const success = await requestPWAInstall();
      
      if (success) {
        setIsInstalled(true);
        setShowPrompt(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    localStorage.removeItem('pwa-install-dismissed');
    // Show again in 24 hours
    setTimeout(() => {
      setDismissed(false);
    }, 24 * 60 * 60 * 1000);
  };

  // Don't show if already installed, can't install, or dismissed
  if (isInstalled || !canInstall || !showPrompt || dismissed) {
    return null;
  }

  const isMobileDevice = isMobile();

  const features = [
    {
      icon: Wifi,
      title: 'Offline Support',
      description: 'Access content without internet'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get instant exam alerts'
    },
    {
      icon: Zap,
      title: 'Fast Loading',
      description: 'Instant app startup'
    },
    {
      icon: Star,
      title: 'Better Experience',
      description: 'Native app feel'
    }
  ];

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-500 shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isMobileDevice ? (
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Install Do Stuff
              </h3>
              <Badge variant="secondary" className="text-xs">
                PWA
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {isMobileDevice
                ? "Install for offline access, faster loading, and native app experience."
                : "Install for quick access, offline functionality, and desktop shortcuts."
              }
            </p>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <Icon className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {feature.title}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                size="sm"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                {isInstalling ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-1" />
                    Install App
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleRemindLater}
                variant="outline"
                size="sm"
                className="px-3"
              >
                Later
              </Button>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200 dark:border-gray-700">
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Don't show again
              </button>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Settings className="w-3 h-3" />
                <span>Always secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PWAInstallPrompt;