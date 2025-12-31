/**
 * Suspicious Behavior Detection & Flagging
 * Analyzes student exam behavior patterns to detect potential cheating
 */

interface SuspiciousBehavior {
  type: 'rushing' | 'pattern-matching' | 'inconsistent-performance' | 'multiple-violations' | 'impossible-timing';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  details: string;
  evidence: any;
}

interface BehaviorAnalysis {
  overallScore: number; // 0-100 (higher = more suspicious)
  flags: SuspiciousBehavior[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  summary: string;
}

class SuspiciousBehaviorDetector {
  private behaviors: SuspiciousBehavior[] = [];

  /**
   * Flag rushing behavior (answering too quickly)
   */
  flagRushing(
    questionId: string,
    timeSpent: number,
    questionDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): boolean {
    const thresholds = {
      easy: 3,
      medium: 5,
      hard: 8
    };

    if (timeSpent < thresholds[questionDifficulty]) {
      this.behaviors.push({
        type: 'rushing',
        severity: 'low',
        timestamp: Date.now(),
        details: `Student answered question too quickly (${timeSpent}s)`,
        evidence: {
          questionId,
          timeSpent,
          expectedMinimum: thresholds[questionDifficulty]
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Detect answer pattern matching (same answers in sequence)
   * Could indicate copying from answer key or another student
   */
  flagPatternMatching(answers: any[], windowSize: number = 5): boolean {
    if (answers.length < windowSize) return false;

    // Check for repeating answer patterns
    for (let i = 0; i < answers.length - windowSize; i++) {
      const window = answers.slice(i, i + windowSize);
      const uniqueAnswers = new Set(window).size;

      // If most answers in window are the same, it's suspicious
      if (uniqueAnswers <= 2) {
        this.behaviors.push({
          type: 'pattern-matching',
          severity: 'high',
          timestamp: Date.now(),
          details: `Detected repetitive answer pattern (${uniqueAnswers} unique answers in ${windowSize} questions)`,
          evidence: {
            windowStart: i,
            windowSize,
            uniqueAnswers,
            pattern: window
          }
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Detect inconsistent performance
   * E.g., very high score on difficult questions but very low on easy ones
   */
  flagInconsistentPerformance(
    questionPerformance: Array<{ difficulty: string; correct: boolean }>
  ): boolean {
    const easy = questionPerformance.filter(q => q.difficulty === 'easy');
    const hard = questionPerformance.filter(q => q.difficulty === 'hard');

    if (easy.length === 0 || hard.length === 0) return false;

    const easyCorrectRate = easy.filter(q => q.correct).length / easy.length;
    const hardCorrectRate = hard.filter(q => q.correct).length / hard.length;

    // If easier questions have much lower success rate, it's suspicious
    if (easyCorrectRate < 0.3 && hardCorrectRate > 0.7) {
      this.behaviors.push({
        type: 'inconsistent-performance',
        severity: 'high',
        timestamp: Date.now(),
        details: `Inconsistent performance: Easy questions ${(easyCorrectRate * 100).toFixed(0)}%, Hard questions ${(hardCorrectRate * 100).toFixed(0)}%`,
        evidence: {
          easyCorrectRate,
          hardCorrectRate,
          easyCount: easy.length,
          hardCount: hard.length
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Flag multiple suspicious activities together
   */
  flagMultipleViolations(
    tabSwitches: number,
    fullscreenExits: number,
    copyAttempts: number
  ): boolean {
    const totalViolations = tabSwitches + fullscreenExits + copyAttempts;

    if (totalViolations >= 3) {
      const severity = totalViolations >= 6 ? 'high' : 'medium';
      
      this.behaviors.push({
        type: 'multiple-violations',
        severity,
        timestamp: Date.now(),
        details: `Multiple suspicious activities detected: ${tabSwitches} tab switches, ${fullscreenExits} fullscreen exits, ${copyAttempts} copy attempts`,
        evidence: {
          tabSwitches,
          fullscreenExits,
          copyAttempts,
          totalViolations
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Detect impossible timing
   * E.g., answering all questions in less than average human reading time
   */
  flagImpossibleTiming(
    totalQuestionsCount: number,
    totalTimeSpent: number, // in seconds
    averageReadingTime: number = 5 // seconds per question minimum
  ): boolean {
    const minimumExpectedTime = totalQuestionsCount * averageReadingTime;

    if (totalTimeSpent < minimumExpectedTime) {
      this.behaviors.push({
        type: 'impossible-timing',
        severity: 'high',
        timestamp: Date.now(),
        details: `Exam completed suspiciously fast (${totalTimeSpent}s vs minimum expected ${minimumExpectedTime}s)`,
        evidence: {
          totalQuestionsCount,
          totalTimeSpent,
          minimumExpectedTime,
          averagePerQuestion: Math.round(totalTimeSpent / totalQuestionsCount)
        }
      });
      return true;
    }

    return false;
  }

  /**
   * Get all detected suspicious behaviors
   */
  getBehaviors(): SuspiciousBehavior[] {
    return [...this.behaviors];
  }

  /**
   * Analyze overall behavior and provide risk assessment
   */
  analyzeBehavior(metadata: {
    score: number;
    totalPoints: number;
    timeTaken: number;
    questionCount: number;
    tabSwitches?: number;
    fullscreenExits?: number;
    copyAttempts?: number;
    rushingCount?: number;
    questionPerformance?: Array<{ difficulty: string; correct: boolean }>;
  }): BehaviorAnalysis {
    let suspicionScore = 0;
    const flags: SuspiciousBehavior[] = [];

    // Factor 1: Performance vs time ratio
    const percentageScore = (metadata.score / metadata.totalPoints) * 100;
    const averageTimePerQuestion = metadata.timeTaken / metadata.questionCount;

    if (percentageScore > 90 && averageTimePerQuestion < 10) {
      suspicionScore += 25;
      flags.push({
        type: 'rushing',
        severity: 'high',
        timestamp: Date.now(),
        details: `Perfect/near-perfect score with suspiciously fast completion (${averageTimePerQuestion.toFixed(1)}s per question)`,
        evidence: { percentageScore, averageTimePerQuestion }
      });
    }

    // Factor 2: Multiple violations
    const totalViolations = 
      (metadata.tabSwitches || 0) + 
      (metadata.fullscreenExits || 0) + 
      (metadata.copyAttempts || 0);

    if (totalViolations >= 3) {
      suspicionScore += 30;
    }

    // Factor 3: Rushing on many questions
    if ((metadata.rushingCount || 0) > metadata.questionCount * 0.3) {
      suspicionScore += 20;
    }

    // Factor 4: Inconsistent performance
    if (metadata.questionPerformance && metadata.questionPerformance.length > 0) {
      const easy = metadata.questionPerformance.filter(q => q.difficulty === 'easy');
      const hard = metadata.questionPerformance.filter(q => q.difficulty === 'hard');

      if (easy.length > 0 && hard.length > 0) {
        const easyRate = easy.filter(q => q.correct).length / easy.length;
        const hardRate = hard.filter(q => q.correct).length / hard.length;

        if (easyRate < 0.3 && hardRate > 0.7) {
          suspicionScore += 25;
        }
      }
    }

    // Cap score at 100
    suspicionScore = Math.min(100, suspicionScore);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (suspicionScore >= 70) {
      riskLevel = 'high';
    } else if (suspicionScore >= 40) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }

    // Generate recommendation
    let recommendation = '';
    if (riskLevel === 'high') {
      recommendation = 'Strong evidence of potential academic dishonesty. Consider manual review or requiring student to retake exam under proctor supervision.';
    } else if (riskLevel === 'medium') {
      recommendation = 'Some suspicious behavior detected. Flag for teacher review. Monitor future attempts.';
    } else {
      recommendation = 'Behavior appears normal. No action needed.';
    }

    return {
      overallScore: suspicionScore,
      flags: flags.concat(this.behaviors),
      riskLevel,
      recommendation,
      summary: `${riskLevel.toUpperCase()} risk - Student score: ${percentageScore.toFixed(1)}%, Time per question: ${averageTimePerQuestion.toFixed(1)}s, Violations: ${totalViolations}`
    };
  }

  /**
   * Reset all recorded behaviors
   */
  reset() {
    this.behaviors = [];
  }

  /**
   * Export behaviors for logging to database
   */
  exportForLogging() {
    return {
      behaviors: this.behaviors,
      count: this.behaviors.length,
      highSeverityCount: this.behaviors.filter(b => b.severity === 'high').length,
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const suspiciousBehaviorDetector = new SuspiciousBehaviorDetector();

// Export class for custom instantiation
export { SuspiciousBehaviorDetector };
