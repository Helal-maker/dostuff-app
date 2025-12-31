/**
 * Question Time Limit Tracking
 * Tracks and enforces per-question time limits to detect rushing/suspicious activity
 */

interface QuestionTimer {
  questionId: string;
  startTime: number;
  endTime?: number;
  timeSpent: number;
  hasExceeded: boolean;
  changeCount: number; // How many times student changed answer
}

interface QuestionTimeLimitConfig {
  secondsPerQuestion: number; // Default: 30-60 seconds
  warningThresholdPercent: number; // Warn at 80% of time
  onTimeExceeded?: (questionId: string, timeSpent: number) => void;
  onWarning?: (questionId: string, timeRemaining: number) => void;
}

class QuestionTimeTracker {
  private timers: Map<string, QuestionTimer> = new Map();
  private config: QuestionTimeLimitConfig;
  private warningShown: Set<string> = new Set();
  private currentQuestionId: string | null = null;
  private timeExceededQuestions: Set<string> = new Set();

  constructor(config: QuestionTimeLimitConfig = { secondsPerQuestion: 45, warningThresholdPercent: 80 }) {
    this.config = config;
  }

  /**
   * Start timer for a question
   */
  startQuestion(questionId: string) {
    if (this.currentQuestionId && !this.timers.get(this.currentQuestionId)?.endTime) {
      this.endQuestion(this.currentQuestionId);
    }

    this.currentQuestionId = questionId;
    
    // Don't overwrite existing timer if already started
    if (this.timers.has(questionId)) {
      return;
    }

    const timer: QuestionTimer = {
      questionId,
      startTime: Date.now(),
      timeSpent: 0,
      hasExceeded: false,
      changeCount: 0
    };

    this.timers.set(questionId, timer);
    
    // Start warning timeout
    this.startWarningTimeout(questionId);
    this.startExceededTimeout(questionId);
  }

  /**
   * End timer for current question
   */
  endQuestion(questionId: string) {
    const timer = this.timers.get(questionId);
    if (!timer || timer.endTime) return;

    timer.endTime = Date.now();
    timer.timeSpent = Math.round((timer.endTime - timer.startTime) / 1000);
  }

  /**
   * Track answer change for current question
   */
  recordAnswerChange(questionId?: string) {
    const id = questionId || this.currentQuestionId;
    if (!id) return;

    const timer = this.timers.get(id);
    if (timer) {
      timer.changeCount++;
    }
  }

  /**
   * Get time remaining for current question
   */
  getTimeRemaining(questionId?: string): number {
    const id = questionId || this.currentQuestionId;
    if (!id) return this.config.secondsPerQuestion;

    const timer = this.timers.get(id);
    if (!timer || timer.endTime) {
      return this.config.secondsPerQuestion;
    }

    const elapsed = Math.round((Date.now() - timer.startTime) / 1000);
    const remaining = Math.max(0, this.config.secondsPerQuestion - elapsed);
    
    return remaining;
  }

  /**
   * Get time spent on a question
   */
  getTimeSpent(questionId: string): number {
    const timer = this.timers.get(questionId);
    if (!timer) return 0;
    
    if (timer.endTime) {
      return timer.timeSpent;
    }
    
    // Currently active
    return Math.round((Date.now() - timer.startTime) / 1000);
  }

  /**
   * Check if student is rushing (answering too fast)
   * Returns true if time spent is less than 5 seconds
   */
  isRushing(questionId: string): boolean {
    const timeSpent = this.getTimeSpent(questionId);
    return timeSpent < 5;
  }

  /**
   * Get all timers for analysis
   */
  getAllTimers(): QuestionTimer[] {
    return Array.from(this.timers.values());
  }

  /**
   * Get questions answered too quickly
   */
  getRushingQuestions(): string[] {
    return Array.from(this.timers.values())
      .filter(timer => timer.timeSpent < 5)
      .map(timer => timer.questionId);
  }

  /**
   * Get questions that exceeded time limit
   */
  getExceededTimeQuestions(): string[] {
    return Array.from(this.timeExceededQuestions);
  }

  /**
   * Get average time per question
   */
  getAverageTimePerQuestion(): number {
    const timers = Array.from(this.timers.values());
    if (timers.length === 0) return 0;

    const totalTime = timers.reduce((sum, timer) => sum + timer.timeSpent, 0);
    return Math.round(totalTime / timers.length);
  }

  /**
   * Get statistics for suspicious activity detection
   */
  getStatistics() {
    const allTimers = Array.from(this.timers.values());
    
    return {
      totalQuestionsAnswered: allTimers.length,
      averageTimePerQuestion: this.getAverageTimePerQuestion(),
      rushingQuestions: this.getRushingQuestions().length,
      exceededTimeQuestions: this.getExceededTimeQuestions().length,
      totalAnswerChanges: allTimers.reduce((sum, t) => sum + t.changeCount, 0),
      questionsWithManyChanges: allTimers.filter(t => t.changeCount > 3).length
    };
  }

  /**
   * Set warning timeout
   */
  private startWarningTimeout(questionId: string) {
    const warningDelay = (this.config.secondsPerQuestion * this.config.warningThresholdPercent) / 100;
    
    setTimeout(() => {
      if (!this.warningShown.has(questionId) && this.timers.get(questionId)?.endTime === undefined) {
        this.warningShown.add(questionId);
        const remaining = this.getTimeRemaining(questionId);
        
        if (this.config.onWarning) {
          this.config.onWarning(questionId, remaining);
        }
      }
    }, warningDelay * 1000);
  }

  /**
   * Set timeout for exceeding time limit
   */
  private startExceededTimeout(questionId: string) {
    setTimeout(() => {
      const timer = this.timers.get(questionId);
      if (timer && !timer.endTime) {
        timer.hasExceeded = true;
        this.timeExceededQuestions.add(questionId);
        
        if (this.config.onTimeExceeded) {
          this.config.onTimeExceeded(questionId, this.config.secondsPerQuestion);
        }
      }
    }, this.config.secondsPerQuestion * 1000);
  }

  /**
   * Reset all timers
   */
  reset() {
    this.timers.clear();
    this.warningShown.clear();
    this.currentQuestionId = null;
    this.timeExceededQuestions.clear();
  }
}

// Export singleton instance
export const questionTimeTracker = new QuestionTimeTracker();

// Export class for custom instantiation
export { QuestionTimeTracker };
