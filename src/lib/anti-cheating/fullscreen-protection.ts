/**
 * Full-Screen Mode Enforcement
 * Forces and maintains full-screen during exam
 */

interface FullScreenConfig {
  enabled: boolean;
  autoReRequest?: boolean;
  onExit?: () => void;
}

class FullScreenProtection {
  private isActive = false;
  private config: FullScreenConfig;
  private exitCount = 0;
  private fullscreenChangeHandler: EventListener | null = null;
  private autoReRequestInterval: NodeJS.Timeout | null = null;

  constructor(config: FullScreenConfig = { enabled: true, autoReRequest: true }) {
    this.config = config;
  }

  async requestFullscreen(element?: HTMLElement): Promise<void> {
    const target = element || document.documentElement;
    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen({ navigationUI: "hide" } as any);
      } else if ((target as any).webkitRequestFullscreen) {
        await (target as any).webkitRequestFullscreen();
      } else if ((target as any).mozRequestFullScreen) {
        await (target as any).mozRequestFullScreen();
      }
    } catch (e) {
      console.warn('Fullscreen request denied');
    }
  }

  enable() {
    if (this.isActive) return;
    this.isActive = true;

    this.fullscreenChangeHandler = this.handleFullscreenChange.bind(this);
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', this.fullscreenChangeHandler);

    this.requestFullscreen();

    // Auto re-request every 2 seconds if not in fullscreen
    if (this.config.autoReRequest) {
      this.autoReRequestInterval = setInterval(() => {
        if (!this.isCurrentlyFullscreen() && this.isActive) {
          this.requestFullscreen();
        }
      }, 2000);
    }
  }

  disable() {
    if (!this.isActive) return;
    this.isActive = false;

    if (this.fullscreenChangeHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
      document.removeEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
      document.removeEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
    }

    if (this.autoReRequestInterval) {
      clearInterval(this.autoReRequestInterval);
    }
  }

  private handleFullscreenChange() {
    if (!this.isCurrentlyFullscreen() && this.isActive) {
      this.exitCount++;
      if (this.config.onExit) {
        this.config.onExit();
      }
    }
  }

  isCurrentlyFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement
    );
  }

  getExitCount(): number {
    return this.exitCount;
  }

  resetExitCount() {
    this.exitCount = 0;
  }
}

export const fullScreenProtection = new FullScreenProtection();
export { FullScreenProtection };
