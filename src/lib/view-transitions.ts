/**
 * View Transitions API utilities
 * Provides smooth page transitions and animations
 */

export interface TransitionOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  direction?: 'forward' | 'backward';
}

export class ViewTransitionManager {
  private static instance: ViewTransitionManager;
  private isSupported: boolean;

  private constructor() {
    this.isSupported = 'startViewTransition' in document;
  }

  static getInstance(): ViewTransitionManager {
    if (!ViewTransitionManager.instance) {
      ViewTransitionManager.instance = new ViewTransitionManager();
    }
    return ViewTransitionManager.instance;
  }

  /**
   * Check if View Transitions API is supported
   */
  isViewTransitionSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Navigate with smooth transition
   */
  async navigateWithTransition(
    url: string, 
    options: TransitionOptions = {}
  ): Promise<void> {
    const { duration = 300, easing = 'ease-in-out', direction = 'forward' } = options;

    if (!this.isSupported) {
      // Fallback to regular navigation
      window.location.href = url;
      return;
    }

    return new Promise((resolve) => {
      const transition = (document as any).startViewTransition(() => {
        window.location.href = url;
      });

      transition.finished.then(() => {
        resolve();
      });
    });
  }

  /**
   * Create custom transition animation
   */
  async animateWithTransition(
    callback: () => void | Promise<void>,
    options: TransitionOptions = {}
  ): Promise<void> {
    const { duration = 300, easing = 'ease-in-out' } = options;

    if (!this.isSupported) {
      // Fallback to direct execution
      await callback();
      return;
    }

    return new Promise((resolve) => {
      const transition = (document as any).startViewTransition(async () => {
        await callback();
      });

      transition.finished.then(() => {
        resolve();
      });
    });
  }

  /**
   * Add transition styles to document
   */
  addTransitionStyles(): void {
    if (!this.isSupported) return;

    const style = document.createElement('style');
    style.textContent = `
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation-duration: 300ms;
        animation-timing-function: ease-in-out;
      }

      ::view-transition-old(slide-out-left) {
        animation: slide-out-left 300ms ease-in-out;
      }

      ::view-transition-new(slide-in-right) {
        animation: slide-in-right 300ms ease-in-out;
      }

      @keyframes slide-out-left {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
      }

      @keyframes slide-in-right {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      .page-transition-enter {
        opacity: 0;
        transform: translateX(30px);
      }

      .page-transition-enter-active {
        opacity: 1;
        transform: translateX(0);
        transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
      }

      .page-transition-exit {
        opacity: 1;
        transform: translateX(0);
      }

      .page-transition-exit-active {
        opacity: 0;
        transform: translateX(-30px);
        transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
      }
    `;
    document.head.appendChild(style);
  }
}

// Export singleton instance
export const viewTransition = ViewTransitionManager.getInstance();

// React hook for view transitions
export const useViewTransition = () => {
  const manager = ViewTransitionManager.getInstance();

  const navigate = (url: string, options?: TransitionOptions) => {
    return manager.navigateWithTransition(url, options);
  };

  const animate = (callback: () => void | Promise<void>, options?: TransitionOptions) => {
    return manager.animateWithTransition(callback, options);
  };

  const isSupported = manager.isViewTransitionSupported();

  return {
    navigate,
    animate,
    isSupported
  };
};
