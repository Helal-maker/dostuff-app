/**
 * Exam Violation Tracker
 * Unified tracking: First violation = warn, Second+ = terminate
 */

export type ViolationType = 'fullscreen-exit' | 'tab-switch' | 'devtools' | 'copy-paste';

interface Violation {
  type: ViolationType;
  timestamp: number;
  details?: string;
}

interface ViolationConfig {
  onFirstViolation?: (violation: Violation) => void;
  onSecondViolation?: (violation: Violation, previousViolation: Violation) => void;
}

class ExamViolationTracker {
  private violations: Violation[] = [];
  private config: ViolationConfig;

  constructor(config: ViolationConfig = {}) {
    this.config = config;
  }

  recordViolation(type: ViolationType, details?: string): number {
    const violation: Violation = {
      type,
      timestamp: Date.now(),
      details
    };

    this.violations.push(violation);
    const count = this.violations.length;

    if (count === 1) {
      console.warn(`⚠️ FIRST VIOLATION: ${type}`);
      if (this.config.onFirstViolation) {
        this.config.onFirstViolation(violation);
      }
    } else if (count >= 2) {
      console.error(`🚫 SECOND+ VIOLATION: ${type} - EXAM WILL BE TERMINATED`);
      if (this.config.onSecondViolation) {
        this.config.onSecondViolation(violation, this.violations[0]);
      }
    }

    return count;
  }

  getViolations(): Violation[] {
    return [...this.violations];
  }

  getViolationCount(): number {
    return this.violations.length;
  }

  shouldTerminate(): boolean {
    return this.violations.length >= 2;
  }

  getReason(): string {
    if (this.violations.length === 0) return '';
    
    const types = this.violations.map(v => v.type);
    const first = types[0];
    const second = types[1] || first;
    
    return `Rules violation detected: ${first} → ${second}`;
  }

  reset() {
    this.violations = [];
  }
}

export const examViolationTracker = new ExamViolationTracker();
export { ExamViolationTracker };
