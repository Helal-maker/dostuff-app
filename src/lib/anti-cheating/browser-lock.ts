/**
 * Browser Lock & Navigation Control
 * Prevents students from navigating away from exam using back/forward buttons
 * Also prevents closing tab and warns about unsaved progress
 */

interface BrowserLockConfig {
  enabled: boolean;
  showWarnings?: boolean;
  preventBackButton?: boolean;
  preventNavigation?: boolean;
  warnOnLeave?: boolean;
}

class BrowserLock {
  private isActive = false;
  private config: BrowserLockConfig;
  private stateStack: number = 0;
  private handlers: Map<string, EventListener> = new Map();

  constructor(config: BrowserLockConfig = { 
    enabled: true,
    preventBackButton: true,
    preventNavigation: true,
    warnOnLeave: true,
    showWarnings: true
  }) {
    this.config = config;
  }

  /**
   * Enable browser lock
   */
  enable() {
    if (this.isActive) return;
    this.isActive = true;

    // Disable back button
    if (this.config.preventBackButton) {
      this.disableBackButton();
    }

    // Prevent navigation
    if (this.config.preventNavigation) {
      const beforeUnloadHandler = this.handleBeforeUnload.bind(this);
      this.handlers.set('beforeunload', beforeUnloadHandler);
      window.addEventListener('beforeunload', beforeUnloadHandler);
    }

    // Handle popstate (back/forward button)
    const popStateHandler = this.handlePopState.bind(this);
    this.handlers.set('popstate', popStateHandler);
    window.addEventListener('popstate', popStateHandler);

    // Prevent link clicks to external pages
    const clickHandler = this.handleLinkClick.bind(this);
    this.handlers.set('click', clickHandler);
    document.addEventListener('click', clickHandler, true);
  }

  /**
   * Disable browser lock
   */
  disable() {
    if (!this.isActive) return;
    this.isActive = false;

    this.handlers.forEach((handler, event) => {
      if (event === 'beforeunload' || event === 'popstate') {
        window.removeEventListener(event, handler);
      } else if (event === 'click') {
        document.removeEventListener(event, handler, true);
      }
    });
    this.handlers.clear();
  }

  /**
   * Disable back button by pushing a history state
   */
  private disableBackButton() {
    // Push an initial state
    window.history.pushState(null, '', window.location.href);
    
    // Push multiple states to prevent back navigation
    for (let i = 0; i < 5; i++) {
      window.history.pushState(null, '', window.location.href);
    }
  }

  /**
   * Handle browser back/forward button
   */
  private handlePopState(event: PopStateEvent) {
    if (this.isActive) {
      // Push state again to prevent back navigation
      window.history.pushState(null, '', window.location.href);
      
      if (this.config.showWarnings) {
        console.warn('Navigation is disabled during exam. Please complete the exam to exit.');
      }
    }
  }

  /**
   * Handle before unload (closing tab/window)
   */
  private handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.isActive) return;

    const message = 'You have unsaved exam progress. Are you sure you want to leave?';
    event.returnValue = message;
    return message;
  }

  /**
   * Handle link clicks
   */
  private handleLinkClick(event: Event) {
    const target = event.target as HTMLElement;
    const link = target.closest('a') as HTMLAnchorElement;

    if (!link || !this.isActive) return;

    const href = link.getAttribute('href');
    
    // Allow internal navigation within exam
    if (!href || href.startsWith('#') || href.startsWith('/exam')) {
      return;
    }

    // Block external navigation
    if (href && !href.startsWith('/')) {
      event.preventDefault();
      if (this.config.showWarnings) {
        console.warn('External navigation is disabled during the exam.');
      }
    }
  }

  /**
   * Prevent right-click and keyboard shortcuts that could open developer tools
   * (Helps prevent cheating through console access)
   */
  blockDeveloperTools() {
    const keyDownHandler = (e: KeyboardEvent) => {
      const isMacCtrlKey = (e.ctrlKey || e.metaKey) && !e.altKey;
      
      // Block F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Block Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Block Ctrl+Shift+J (Developer Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Block Ctrl+Shift+C (Element Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
    };

    this.handlers.set('keydown-devtools', keyDownHandler);
    document.addEventListener('keydown', keyDownHandler);
  }

  /**
   * Allow specific navigation (e.g., submit exam button)
   */
  allowNavigation(url: string) {
    window.location.href = url;
  }

  /**
   * Check if browser lock is active
   */
  isLocked(): boolean {
    return this.isActive;
  }
}

/**
 * Warn user before leaving exam with unsaved answers
 */
export function warnBeforeLeaving(enabled: boolean = true) {
  if (enabled) {
    window.addEventListener('beforeunload', (event) => {
      const message = 'You have unsaved exam answers. All progress will be lost if you leave.';
      event.preventDefault();
      event.returnValue = message;
      return message;
    });
  }
}

/**
 * Redirect user if they try to close tab
 * Note: Modern browsers restrict this capability for security
 */
export function redirectOnClose(targetUrl: string) {
  window.addEventListener('beforeunload', (event) => {
    // This is limited in modern browsers - they won't allow redirection on close
    // But we can at least warn the user
    const message = 'Are you sure? Your exam progress will be saved.';
    event.returnValue = message;
    return message;
  });
}

// Export singleton instance
export const browserLock = new BrowserLock();

// Export class for custom instantiation
export { BrowserLock };
