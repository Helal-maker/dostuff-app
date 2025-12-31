/**
 * Browser Lock & Developer Tools Blocker
 * Prevents navigation, tab closing, and blocks F12/developer tools
 */

interface BrowserLockConfig {
  enabled: boolean;
  blockDevTools?: boolean;
  warnOnLeave?: boolean;
}

class BrowserLock {
  private isActive = false;
  private config: BrowserLockConfig;
  private handlers: Map<string, EventListener> = new Map();

  constructor(config: BrowserLockConfig = { 
    enabled: true,
    blockDevTools: true,
    warnOnLeave: true
  }) {
    this.config = config;
  }

  enable() {
    if (this.isActive) return;
    this.isActive = true;

    // Prevent back button
    window.history.pushState(null, '', window.location.href);
    for (let i = 0; i < 5; i++) {
      window.history.pushState(null, '', window.location.href);
    }

    // Popstate
    const popStateHandler = (e: PopStateEvent) => {
      window.history.pushState(null, '', window.location.href);
    };
    this.handlers.set('popstate', popStateHandler);
    window.addEventListener('popstate', popStateHandler);

    // Before unload
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.returnValue = 'Exam in progress. Are you sure?';
      return e.returnValue;
    };
    this.handlers.set('beforeunload', beforeUnloadHandler);
    window.addEventListener('beforeunload', beforeUnloadHandler);

    // Block dev tools
    if (this.config.blockDevTools) {
      const keydownHandler = (e: KeyboardEvent) => this.blockDevTools(e);
      this.handlers.set('keydown', keydownHandler);
      document.addEventListener('keydown', keydownHandler);
    }

    // Block right-click context menu
    const contextHandler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[data-allow-context]');
      if (!target) e.preventDefault();
    };
    this.handlers.set('contextmenu', contextHandler);
    document.addEventListener('contextmenu', contextHandler);
  }

  disable() {
    if (!this.isActive) return;
    this.isActive = false;

    this.handlers.forEach((handler, event) => {
      if (event === 'beforeunload' || event === 'popstate') {
        window.removeEventListener(event, handler);
      } else {
        document.removeEventListener(event, handler);
      }
    });
    this.handlers.clear();
  }

  private blockDevTools(e: KeyboardEvent) {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      console.warn('🚫 Developer tools blocked');
      return;
    }

    const isCtrl = e.ctrlKey || e.metaKey;
    
    // Ctrl+Shift+I (Inspect)
    if (isCtrl && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      console.warn('🚫 Developer tools blocked');
      return;
    }

    // Ctrl+Shift+J (Console)
    if (isCtrl && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      console.warn('🚫 Developer tools blocked');
      return;
    }

    // Ctrl+Shift+C (Inspect element)
    if (isCtrl && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      console.warn('🚫 Developer tools blocked');
      return;
    }

    // Ctrl+Shift+K (Console in Firefox)
    if (isCtrl && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      console.warn('🚫 Developer tools blocked');
      return;
    }
  }

  isLocked(): boolean {
    return this.isActive;
  }
}

export const browserLock = new BrowserLock();
export { BrowserLock };
