/**
 * Copy/Paste Protection Module
 * Disables copy and paste functionality during exams
 */

interface CopyPasteProtectionConfig {
  enabled: boolean;
  showAlert?: boolean;
  alertMessage?: string;
}

class CopyPasteProtection {
  private isActive = false;
  private originalHandlers: Map<string, EventListener> = new Map();
  private config: CopyPasteProtectionConfig;

  constructor(config: CopyPasteProtectionConfig = { enabled: true, showAlert: true }) {
    this.config = {
      alertMessage: 'Copy/Paste is disabled during exams for security reasons.',
      ...config
    };
  }

  /**
   * Enable copy/paste protection
   */
  enable() {
    if (this.isActive) return;
    this.isActive = true;

    // Disable copy
    this.originalHandlers.set('copy', this.handleCopy.bind(this));
    document.addEventListener('copy', this.originalHandlers.get('copy')!);

    // Disable paste
    this.originalHandlers.set('paste', this.handlePaste.bind(this));
    document.addEventListener('paste', this.originalHandlers.get('paste')!);

    // Also prevent paste via keyboard shortcut (Ctrl+V, Cmd+V)
    this.originalHandlers.set('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keydown', this.originalHandlers.get('keydown')!);
  }

  /**
   * Disable copy/paste protection
   */
  disable() {
    if (!this.isActive) return;
    this.isActive = false;

    this.originalHandlers.forEach((handler, event) => {
      document.removeEventListener(event, handler);
    });
    this.originalHandlers.clear();
  }

  /**
   * Handle copy events
   */
  private handleCopy(e: ClipboardEvent) {
    e.preventDefault();
    if (this.config.showAlert) {
      console.warn(this.config.alertMessage);
    }
  }

  /**
   * Handle paste events
   */
  private handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    if (this.config.showAlert) {
      console.warn(this.config.alertMessage);
    }
  }

  /**
   * Handle keyboard shortcuts (Ctrl+C, Ctrl+V, Cmd+C, Cmd+V)
   */
  private handleKeyDown(e: KeyboardEvent) {
    const isMacCtrlKey = (e.ctrlKey || e.metaKey) && !e.altKey;
    
    // Block Ctrl+C / Cmd+C
    if (isMacCtrlKey && e.key === 'c') {
      e.preventDefault();
      if (this.config.showAlert) {
        console.warn('Copy is disabled during exams');
      }
    }

    // Block Ctrl+V / Cmd+V
    if (isMacCtrlKey && e.key === 'v') {
      e.preventDefault();
      if (this.config.showAlert) {
        console.warn('Paste is disabled during exams');
      }
    }

    // Block Ctrl+X / Cmd+X (cut)
    if (isMacCtrlKey && e.key === 'x') {
      e.preventDefault();
      if (this.config.showAlert) {
        console.warn('Cut is disabled during exams');
      }
    }
  }

  /**
   * Check if protection is currently active
   */
  isProtectionActive(): boolean {
    return this.isActive;
  }
}

// Export singleton instance
export const copyPasteProtection = new CopyPasteProtection();

// Export class for custom instantiation
export { CopyPasteProtection };
