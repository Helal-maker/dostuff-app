/**
 * Exam Attempt Limiter
 * Tracks and limits the number of attempts a student can make on an exam
 * Default: 1-3 attempts per student
 */

interface AttemptRecord {
  attemptNumber: number;
  startTime: number;
  endTime?: number;
  score?: number;
  totalPoints?: number;
  completed: boolean;
  ipAddress?: string;
  userAgent?: string;
}

interface AttemptLimiterConfig {
  maxAttempts: number; // 1-3 allowed
  storageKey?: string;
}

class ExamAttemptLimiter {
  private config: AttemptLimiterConfig;
  private attempts: Map<string, AttemptRecord[]> = new Map(); // examId -> attempts
  private currentAttempt: AttemptRecord | null = null;
  private currentExamId: string | null = null;

  constructor(config: AttemptLimiterConfig = { maxAttempts: 3 }) {
    this.config = {
      storageKey: 'exam_attempts',
      ...config
    };
    
    // Load attempts from localStorage if available
    this.loadFromStorage();
  }

  /**
   * Start a new exam attempt
   * Returns false if max attempts exceeded
   */
  startAttempt(examId: string, userId: string): boolean {
    const key = `${examId}_${userId}`;
    const examAttempts = this.attempts.get(key) || [];

    // Check if max attempts exceeded
    if (examAttempts.length >= this.config.maxAttempts) {
      return false;
    }

    // Create new attempt record
    this.currentAttempt = {
      attemptNumber: examAttempts.length + 1,
      startTime: Date.now(),
      completed: false,
      userAgent: navigator.userAgent
    };

    this.currentExamId = key;
    examAttempts.push(this.currentAttempt);
    this.attempts.set(key, examAttempts);

    return true;
  }

  /**
   * End current attempt
   */
  endAttempt(score?: number, totalPoints?: number) {
    if (!this.currentAttempt) return;

    this.currentAttempt.endTime = Date.now();
    this.currentAttempt.completed = true;
    this.currentAttempt.score = score;
    this.currentAttempt.totalPoints = totalPoints;

    this.saveToStorage();
  }

  /**
   * Get number of attempts used
   */
  getAttemptsUsed(examId: string, userId: string): number {
    const key = `${examId}_${userId}`;
    return (this.attempts.get(key) || []).length;
  }

  /**
   * Get remaining attempts
   */
  getAttemptsRemaining(examId: string, userId: string): number {
    const used = this.getAttemptsUsed(examId, userId);
    return Math.max(0, this.config.maxAttempts - used);
  }

  /**
   * Check if student can attempt exam
   */
  canAttempt(examId: string, userId: string): boolean {
    return this.getAttemptsRemaining(examId, userId) > 0;
  }

  /**
   * Get all attempts for an exam
   */
  getAttempts(examId: string, userId: string): AttemptRecord[] {
    const key = `${examId}_${userId}`;
    return this.attempts.get(key) || [];
  }

  /**
   * Get best score from all attempts
   */
  getBestScore(examId: string, userId: string): number {
    const attempts = this.getAttempts(examId, userId);
    const completedAttempts = attempts.filter(a => a.completed && a.score !== undefined);
    
    if (completedAttempts.length === 0) return 0;
    
    return Math.max(...completedAttempts.map(a => a.score || 0));
  }

  /**
   * Get average score from all attempts
   */
  getAverageScore(examId: string, userId: string): number {
    const attempts = this.getAttempts(examId, userId);
    const completedAttempts = attempts.filter(a => a.completed && a.score !== undefined);
    
    if (completedAttempts.length === 0) return 0;
    
    const sum = completedAttempts.reduce((total, a) => total + (a.score || 0), 0);
    return Math.round(sum / completedAttempts.length);
  }

  /**
   * Get attempt history with stats
   */
  getAttemptHistory(examId: string, userId: string) {
    const attempts = this.getAttempts(examId, userId);
    
    return attempts.map(attempt => ({
      attemptNumber: attempt.attemptNumber,
      startTime: new Date(attempt.startTime).toISOString(),
      endTime: attempt.endTime ? new Date(attempt.endTime).toISOString() : null,
      duration: attempt.endTime ? Math.round((attempt.endTime - attempt.startTime) / 1000) : null,
      completed: attempt.completed,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.score && attempt.totalPoints 
        ? Math.round((attempt.score / attempt.totalPoints) * 100)
        : null
    }));
  }

  /**
   * Reset attempts for a specific exam (admin only)
   * Should be called from backend with proper authorization
   */
  resetAttempts(examId: string, userId: string) {
    const key = `${examId}_${userId}`;
    this.attempts.delete(key);
    this.saveToStorage();
  }

  /**
   * Save attempts to localStorage
   */
  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.attempts);
      localStorage.setItem(this.config.storageKey!, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save attempts to localStorage:', error);
    }
  }

  /**
   * Load attempts from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.config.storageKey!);
      if (stored) {
        const data = JSON.parse(stored);
        this.attempts = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load attempts from localStorage:', error);
    }
  }

  /**
   * Get current attempt info
   */
  getCurrentAttempt(): AttemptRecord | null {
    return this.currentAttempt;
  }

  /**
   * Get current attempt number
   */
  getCurrentAttemptNumber(examId: string, userId: string): number {
    const used = this.getAttemptsUsed(examId, userId);
    return used > 0 ? used : 0;
  }
}

// Export singleton instance
export const examAttemptLimiter = new ExamAttemptLimiter();

// Export class for custom instantiation
export { ExamAttemptLimiter };
