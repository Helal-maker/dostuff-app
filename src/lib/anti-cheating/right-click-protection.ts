/**
 * Right-Click Context Menu Disabler
 * Prevents students from using right-click on exam questions
 */

interface RightClickConfig {
  enabled: boolean;
  blockContextMenu?: boolean;
  blockDragAndDrop?: boolean;
  showWarning?: boolean;
}

class RightClickProtection {
  private isActive = false;
  private config: RightClickConfig;
  private handlers: Map<string, EventListener> = new Map();

  constructor(config: RightClickConfig = { enabled: true, blockContextMenu: true, blockDragAndDrop: true }) {
    this.config = config;
  }

  /**
   * Enable right-click protection
   */
  enable() {
    if (this.isActive) return;
    this.isActive = true;

    // Block context menu (right-click)
    if (this.config.blockContextMenu) {
      const contextMenuHandler = this.handleContextMenu.bind(this);
      this.handlers.set('contextmenu', contextMenuHandler);
      document.addEventListener('contextmenu', contextMenuHandler);
    }

    // Block drag and drop (another way to copy content)
    if (this.config.blockDragAndDrop) {
      const dragHandler = this.handleDragStart.bind(this);
      const dropHandler = this.handleDrop.bind(this);
      
      this.handlers.set('dragstart', dragHandler);
      this.handlers.set('drop', dropHandler);
      
      document.addEventListener('dragstart', dragHandler);
      document.addEventListener('drop', dropHandler);
    }
  }

  /**
   * Disable right-click protection
   */
  disable() {
    if (!this.isActive) return;
    this.isActive = false;

    this.handlers.forEach((handler, event) => {
      document.removeEventListener(event, handler);
    });
    this.handlers.clear();
  }

  /**
   * Handle context menu (right-click)
   */
  private handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    
    if (this.config.showWarning) {
      console.warn('Right-click is disabled during the exam.');
    }
    
    return false;
  }

  /**
   * Handle drag start
   */
  private handleDragStart(e: DragEvent) {
    e.preventDefault();
    
    if (this.config.showWarning) {
      console.warn('Dragging is disabled during the exam.');
    }
    
    return false;
  }

  /**
   * Handle drop
   */
  private handleDrop(e: DragEvent) {
    e.preventDefault();
    
    if (this.config.showWarning) {
      console.warn('Dropping is disabled during the exam.');
    }
    
    return false;
  }

  /**
   * Check if protection is active
   */
  isProtectionActive(): boolean {
    return this.isActive;
  }
}

// Export singleton instance
export const rightClickProtection = new RightClickProtection();

// Export class for custom instantiation
export { RightClickProtection };
