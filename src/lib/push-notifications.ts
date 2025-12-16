/**
 * Push Notification Service for Do Stuff PWA
 * 
 * Features:
 * - Request notification permissions
 * - Send notifications for key user interactions
 * - Handle notification clicks
 * - Background sync notifications
 */

/**
 * Send a notification
 */
export function sendNotification(title: string, options?: NotificationOptions): void {
  if (!canSendNotifications()) {
    console.log('Cannot send notification: permissions not granted');
    return;
  }

  try {
    const notification = new Notification(title, options);

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      if (options?.data && options.data.url) {
        window.location.href = options.data.url;
      }
    };

    // Handle notification close
    notification.onclose = () => {
      console.log('Notification closed');
    };
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Check if notifications are supported and permitted
 */
export function canSendNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send notification via service worker (for when app is not focused)
 */
export async function sendPushNotification(title: string, body: string, data?: any): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service worker not available');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if push manager is available
    if (!registration.pushManager) {
      console.log('Push manager not available');
      return;
    }

    // Get subscription or subscribe
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_PUSH_PUBLIC_KEY
      });
    }

    // Send push notification to service worker
    await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscription,
        title,
        body,
        data
      })
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

/**
 * Setup notification click handlers
 */
export function setupNotificationHandlers(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        console.log('Notification clicked:', event.data);
        
        if (event.data.url) {
          window.location.href = event.data.url;
        }
      }
    });
  }
}

/**
 * Send notification for exam-related events
 */
export function notifyExamEvent(type: 'created' | 'updated' | 'deleted' | 'joined', examName: string): void {
  const messages = {
    created: `Exam "${examName}" created successfully!`,
    updated: `Exam "${examName}" updated!`,
    deleted: `Exam "${examName}" deleted`,
    joined: `Successfully joined exam "${examName}"`
  };

  sendNotification(`Exam ${type}`, {
    body: messages[type],
    icon: '/icon-192x192.png',
    data: { url: '/exams' }
  });
}

/**
 * Send notification for result-related events
 */
export function notifyResultEvent(type: 'available' | 'updated', examName: string): void {
  const messages = {
    available: `Results for "${examName}" are now available!`,
    updated: `Results for "${examName}" have been updated`
  };

  sendNotification(`Results ${type}`, {
    body: messages[type],
    icon: '/icon-192x192.png',
    data: { url: '/results' }
  });
}

/**
 * Send notification for profile events
 */
export function notifyProfileEvent(type: 'updated' | 'verified'): void {
  const messages = {
    updated: 'Your profile has been updated successfully!',
    verified: 'Your account has been verified!'
  };

  sendNotification(`Profile ${type}`, {
    body: messages[type],
    icon: '/icon-192x192.png',
    data: { url: '/profile' }
  });
}

/**
 * Send notification for connectivity events
 */
export function notifyConnectivityEvent(isOnline: boolean): void {
  if (isOnline) {
    sendNotification('Back Online', {
      body: 'Your connection has been restored. Syncing data...',
      icon: '/icon-192x192.png',
      data: { url: '/' }
    });
  } else {
    sendNotification('Offline Mode', {
      body: 'You are now offline. Some features may be limited.',
      icon: '/icon-192x192.png',
      data: { url: '/' },
      requireInteraction: false
    });
  }
}

/**
 * Initialize push notifications
 */
export async function initializePushNotifications(): Promise<void> {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
      console.log('Push notifications enabled');
      setupNotificationHandlers();
    } else {
      console.log('Push notifications disabled by user');
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
}
