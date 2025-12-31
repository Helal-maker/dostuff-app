/**
 * Tab/Window Switch Detection
 * Monitors when student leaves the exam tab or switches windows
 * Logs violations and can trigger warnings
 */

interface TabSwitchViolation {
  timestamp: number;
  windowFocusLost: boolean;
  tabSwitched: boolean;
  duration: number; // milliseconds away from exam
}

interface TabSwitchConfig {
  enabled: boolean;
  maxViolations?: number;
  onViolation?: (violation: TabSwitchViolation) => void;
  onMaxViolationsExceeded?: () => void;
  showWarning?: boolean;
}

class TabSwitchDetector {
  private isActive = false;
  private config: TabSwitchConfig;
  private violations: TabSwitchViolation[] = [];
  private lastVisibleTime: number = Date.now();
  private lastFocusTime: number = Date.now();
  private lastViolationTimestamp: number = 0; // Track last violation to deduplicate
  private handlers: Map<string, EventListener> = new Map();

  constructor(config: TabSwitchConfig = { enabled: true, maxViolations: 3 }) {
    this.config = {
      showWarning: true,
      ...config
    };
  }

  /**
   * Enable tab switch detection
   */
  enable() {
    if (this.isActive) return;
    this.isActive = true;

    // Detect visibility changes (tab switch)
    const visibilityHandler = this.handleVisibilityChange.bind(this);
    this.handlers.set('visibilitychange', visibilityHandler);
    document.addEventListener('visibilitychange', visibilityHandler);

    // Detect window focus changes
    const focusHandler = this.handleWindowFocus.bind(this);
    const blurHandler = this.handleWindowBlur.bind(this);

    this.handlers.set('focus', focusHandler);
    this.handlers.set('blur', blurHandler);

    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);
  }

  /**
   * Disable tab switch detection
   */
  disable() {
    if (!this.isActive) return;
    this.isActive = false;

    this.handlers.forEach((handler, event) => {
      if (event === 'focus' || event === 'blur') {
        window.removeEventListener(event, handler);
      } else {
        document.removeEventListener(event, handler);
      }
    });
    this.handlers.clear();
  }

  /**
   * Handle visibility change (tab switch)
   */
  private handleVisibilityChange() {
    if (document.hidden) {
      // Student left the tab
      this.lastVisibleTime = Date.now();
      
      if (this.config.showWarning) {
        console.warn('⚠️ You switched tabs. Teachers can see this.');
      }
    } else {
      // Student returned to tab
      const now = Date.now();
      
      // Deduplicate: skip if another violation was recorded less than 300ms ago
      if (now - this.lastViolationTimestamp < 300) {
        return;
      }

      const duration = Date.now() - this.lastVisibleTime;
      
      const violation: TabSwitchViolation = {
        timestamp: this.lastVisibleTime,
        windowFocusLost: false,
        tabSwitched: true,
        duration
      };

      this.violations.push(violation);
      this.lastViolationTimestamp = now;
      
      if (this.config.onViolation) {
        this.config.onViolation(violation);
      }

      // Check if max violations exceeded
      if (
        this.config.maxViolations &&
        this.violations.length >= this.config.maxViolations &&
        this.config.onMaxViolationsExceeded
      ) {
        this.config.onMaxViolationsExceeded();
      }
    }
  }

  /**
   * Handle window focus loss
   */
  private handleWindowBlur() {
    this.lastFocusTime = Date.now();
    
    if (this.config.showWarning) {
      console.warn('⚠️ Window lost focus. Teachers can see this.');
    }
  }

  /**
   * Handle window focus gain
   */
  private handleWindowFocus() {
    const now = Date.now();
    const duration = now - this.lastFocusTime;
    
    // Only record if away for more than 100ms (ignore quick focus changes)
    if (duration > 100) {
      // Deduplicate: skip if another violation was recorded less than 300ms ago
      if (now - this.lastViolationTimestamp < 300) {
        return;
      }

      const violation: TabSwitchViolation = {
        timestamp: this.lastFocusTime,
        windowFocusLost: true,
        tabSwitched: false,
        duration
      };

      this.violations.push(violation);
      this.lastViolationTimestamp = now;

      if (this.config.onViolation) {
        this.config.onViolation(violation);
      }

      // Check if max violations exceeded
      if (
        this.config.maxViolations &&
        this.violations.length >= this.config.maxViolations &&
        this.config.onMaxViolationsExceeded
      ) {
        this.config.onMaxViolationsExceeded();
      }
    }
  }

  /**
   * Get all violations
   */
  getViolations(): TabSwitchViolation[] {
    return [...this.violations];
  }

  /**
   * Get total violation count
   */
  getViolationCount(): number {
    return this.violations.length;
  }

  /**
   * Get tab switch count
   */
  getTabSwitchCount(): number {
    return this.violations.filter(v => v.tabSwitched).length;
  }

  /**
   * Get window focus loss count
   */
  getWindowFocusLossCount(): number {
    return this.violations.filter(v => v.windowFocusLost).length;
  }

  /**
   * Get total time away from exam
   */
  getTotalTimeAway(): number {
    return this.violations.reduce((total, v) => total + v.duration, 0);
  }

  /**
   * Check if exam is currently visible
   */
  isExamVisible(): boolean {
    return !document.hidden;
  }

  /**
   * Check if window has focus
   */
  isWindowFocused(): boolean {
    return document.hasFocus();
  }

  /**
   * Get violation statistics
   */
  getStatistics() {
    return {
      totalViolations: this.getViolationCount(),
      tabSwitches: this.getTabSwitchCount(),
      windowFocusLosses: this.getWindowFocusLossCount(),
      totalTimeAway: this.getTotalTimeAway(),
      averageTimeAway: this.violations.length > 0
        ? Math.round(this.getTotalTimeAway() / this.violations.length)
        : 0
    };
  }

  /**
   * Reset violations
   */
  reset() {
    this.violations = [];
    this.lastVisibleTime = Date.now();
    this.lastFocusTime = Date.now();
    this.lastViolationTimestamp = 0;
  }
}

// Export singleton instance
export const tabSwitchDetector = new TabSwitchDetector();

// Export class for custom instantiation
export { TabSwitchDetector };
