# Anti-Cheating Features Documentation

Complete anti-cheating implementation for dostuff-app exam system. All modules are production-ready with zero external dependencies (except Supabase for logging).

## Features Overview

### Phase 1: Free Tier (Included)
✅ Disable copy/paste on questions  
✅ Full-screen mode with exit warnings  
✅ Disable right-click context menu  
✅ Question/answer randomization  
✅ Time limits per question  
✅ Attempt limits (1-3 tries)  

### Phase 2: Advanced Tracking
✅ Tab switch detection  
✅ IP address logging  
✅ Browser lock (disable back button)  
✅ Suspicious behavior flags  

---

## Module Reference

### 1. **Copy/Paste Protection** (`copy-paste-protection.ts`)

Disables copying, pasting, and cutting in exam interface.

```typescript
import { copyPasteProtection } from '@/lib/anti-cheating';

// Enable protection
copyPasteProtection.enable();

// Disable after exam
copyPasteProtection.disable();

// Check status
if (copyPasteProtection.isProtectionActive()) {
  console.log('Protection is active');
}
```

**Blocks:**
- Ctrl+C / Cmd+C (copy)
- Ctrl+V / Cmd+V (paste)
- Ctrl+X / Cmd+X (cut)
- Right-click context menu copy
- Event-based copy/paste attempts

---

### 2. **Full-Screen Mode** (`fullscreen-protection.ts`)

Enforces full-screen mode and tracks exits.

```typescript
import { fullScreenProtection } from '@/lib/anti-cheating';

// Request full-screen
await fullScreenProtection.requestFullscreen(examElement);

// Enable tracking
fullScreenProtection.enable();

// Check violations
const violations = fullScreenProtection.getViolations();
console.log(`Student exited fullscreen ${violations.count} times`);

// Check if currently in fullscreen
if (!fullScreenProtection.isCurrentlyFullscreen()) {
  console.warn('Student has exited fullscreen');
}
```

**Tracks:**
- Full-screen exit count
- Time of each exit
- Duration outside full-screen
- Cross-browser support (webkit, moz, standard)

---

### 3. **Right-Click Disabled** (`right-click-protection.ts`)

Prevents right-click and drag-and-drop.

```typescript
import { rightClickProtection } from '@/lib/anti-cheating';

// Enable protection
rightClickProtection.enable();

// Disables:
// - Right-click context menu
// - Drag and drop
// - Text selection copy
```

---

### 4. **Question Randomization** (`question-randomization.ts`)

Shuffles answer options to prevent memorization.

```typescript
import {
  randomizeExamQuestions,
  verifyRandomizedAnswer,
  mapAnswerToOriginalIndex
} from '@/lib/anti-cheating';

// Shuffle all questions before displaying to student
const randomizedQuestions = randomizeExamQuestions(questions, shuffleOrder = true);

// When grading, map student's answer back to original index
const studentAnswerIndex = 2; // Student selected 3rd option
const originalIndex = mapAnswerToOriginalIndex(studentAnswerIndex, indexMapping);

// Verify answer
const isCorrect = verifyRandomizedAnswer(
  studentAnswerIndex,
  correctAnswerOriginalIndex,
  indexMapping
);
```

**Features:**
- Fisher-Yates shuffle algorithm
- Maintains answer tracking via index mapping
- Supports all question types
- Preserves correct answer association

---

### 5. **Question Time Tracking** (`question-time-tracker.ts`)

Tracks time per question to detect rushing and suspicious patterns.

```typescript
import { questionTimeTracker } from '@/lib/anti-cheating';

// Start question timer
questionTimeTracker.startQuestion('question-123');

// Record answer changes
questionTimeTracker.recordAnswerChange();

// End question
questionTimeTracker.endQuestion('question-123');

// Get statistics
const stats = questionTimeTracker.getStatistics();
console.log({
  averageTimePerQuestion: stats.averageTimePerQuestion,
  rushingQuestions: stats.rushingQuestions,
  exceededTimeQuestions: stats.exceededTimeQuestions
});

// Get time remaining
const timeLeft = questionTimeTracker.getTimeRemaining();

// Check if rushing
if (questionTimeTracker.isRushing('question-123')) {
  console.warn('Student answered too quickly');
}
```

**Metrics:**
- Time per question (seconds)
- Average time per question
- Rushing detection (< 5 seconds)
- Answer change count
- Time exceeded questions

---

### 6. **Attempt Limiter** (`attempt-limiter.ts`)

Limits exam attempts to 1-3 tries per student.

```typescript
import { examAttemptLimiter } from '@/lib/anti-cheating';

// Start attempt
const canAttempt = examAttemptLimiter.startAttempt(examId, userId);
if (!canAttempt) {
  console.log('Maximum attempts exceeded');
  return;
}

// End attempt with score
examAttemptLimiter.endAttempt(score, totalPoints);

// Check attempts
const used = examAttemptLimiter.getAttemptsUsed(examId, userId);
const remaining = examAttemptLimiter.getAttemptsRemaining(examId, userId);

// Get history
const history = examAttemptLimiter.getAttemptHistory(examId, userId);
console.log({
  attempts: history,
  bestScore: examAttemptLimiter.getBestScore(examId, userId),
  averageScore: examAttemptLimiter.getAverageScore(examId, userId)
});
```

**Persists:**
- Attempts in localStorage
- Attempt count per exam per user
- Score and completion status
- Duration and timestamps

---

### 7. **Tab Switch Detection** (`tab-switch-detector.ts`)

Tracks when student leaves the exam tab.

```typescript
import { tabSwitchDetector } from '@/lib/anti-cheating';

// Enable detection
tabSwitchDetector.enable();

// Get violations
const violations = tabSwitchDetector.getViolations();

// Get statistics
const stats = tabSwitchDetector.getStatistics();
console.log({
  tabSwitches: stats.tabSwitches,
  windowFocusLosses: stats.windowFocusLosses,
  totalTimeAway: stats.totalTimeAway // in milliseconds
});

// Check current state
if (!tabSwitchDetector.isExamVisible()) {
  console.warn('Exam tab not visible');
}

if (!tabSwitchDetector.isWindowFocused()) {
  console.warn('Window lost focus');
}
```

**Detects:**
- Tab switches (visibility change)
- Window focus loss
- Time away from exam
- Violation count and severity

---

### 8. **Device Tracking** (`device-tracking.ts`)

Logs IP address and device info to detect multi-student scenarios.

```typescript
import {
  fetchStudentIPAddress,
  logExamAttemptDevice,
  checkSuspiciousDeviceActivity,
  generateDeviceFingerprint
} from '@/lib/anti-cheating';

// Log device when exam starts
const deviceInfo = await logExamAttemptDevice(examId, userId, supabaseClient);

// Get IP address (async)
const ipAddress = await fetchStudentIPAddress();

// Get device fingerprint
const fingerprint = generateDeviceFingerprint();

// Check for multiple users on same IP
const { isSuspicious, reason } = await checkSuspiciousDeviceActivity(
  examId,
  ipAddress,
  supabaseClient
);

if (isSuspicious) {
  console.warn(`⚠️ ${reason}`);
}
```

**Collects:**
- IP address (via public API)
- Device fingerprint
- User agent and platform
- Screen resolution and timezone
- Browser language and capabilities

**Requires Supabase table:**
```sql
CREATE TABLE exam_attempt_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL,
  user_id UUID NOT NULL,
  ip_address TEXT,
  device_fingerprint TEXT,
  user_agent TEXT,
  platform TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 9. **Browser Lock** (`browser-lock.ts`)

Prevents navigation away from exam.

```typescript
import { browserLock } from '@/lib/anti-cheating';

// Enable browser lock
browserLock.enable();

// This prevents:
// - Back/forward button navigation
// - Closing tab without warning
// - External link navigation
// - F12, Ctrl+Shift+I (developer tools)

// Disable after exam
browserLock.disable();

// Check status
if (browserLock.isLocked()) {
  console.log('Exam is locked');
}
```

**Prevents:**
- Back button navigation
- Tab closing (warns user)
- External navigation
- Developer tools access
- Browser inspector access

---

### 10. **Suspicious Behavior Detection** (`suspicious-behavior-detector.ts`)

Analyzes behavior patterns and flags suspicious activity.

```typescript
import { suspiciousBehaviorDetector } from '@/lib/anti-cheating';

// Flag rushing on specific question
suspiciousBehaviorDetector.flagRushing('question-123', 3, 'medium');

// Check for repeated answer patterns
const hasPattern = suspiciousBehaviorDetector.flagPatternMatching(answers);

// Check for inconsistent performance
suspiciousBehaviorDetector.flagInconsistentPerformance(questionPerformance);

// Flag multiple violations
suspiciousBehaviorDetector.flagMultipleViolations(
  tabSwitches,
  fullscreenExits,
  copyAttempts
);

// Analyze overall behavior
const analysis = suspiciousBehaviorDetector.analyzeBehavior({
  score: 95,
  totalPoints: 100,
  timeTaken: 120, // seconds
  questionCount: 20,
  tabSwitches: 2,
  fullscreenExits: 1,
  copyAttempts: 0,
  rushingCount: 3,
  questionPerformance: [
    { difficulty: 'easy', correct: true },
    { difficulty: 'hard', correct: true }
  ]
});

console.log({
  riskLevel: analysis.riskLevel, // 'low' | 'medium' | 'high'
  score: analysis.overallScore, // 0-100
  recommendation: analysis.recommendation,
  flags: analysis.flags
});
```

**Risk Assessment:**
- Rushing detection (answering too fast)
- Pattern matching (repeated answers)
- Inconsistent performance (easy vs hard)
- Multiple violations accumulation
- Impossible timing (completion too fast)

---

## Integration Example

### Complete Setup in TakeExam Component

```typescript
import { useEffect, useState } from 'react';
import {
  initializeAntiCheating,
  disableAntiCheating,
  questionTimeTracker,
  examAttemptLimiter,
  suspiciousBehaviorDetector,
  logExamAttemptDevice
} from '@/lib/anti-cheating';

export default function TakeExam() {
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    if (!examStarted) return;

    // Initialize all anti-cheating features
    initializeAntiCheating({
      copyPasteProtection: true,
      fullScreenMode: true,
      rightClickDisabled: true,
      randomizeQuestions: true,
      trackQuestionTime: true,
      detectTabSwitch: true,
      browserLock: true
    });

    // Log device information
    logExamAttemptDevice(examId, userId, supabaseClient);

    // Start attempt
    const canAttempt = examAttemptLimiter.startAttempt(examId, userId);
    if (!canAttempt) {
      console.log('Cannot start exam - max attempts exceeded');
      return;
    }

    return () => {
      // Cleanup on unmount
      disableAntiCheating();
    };
  }, [examStarted]);

  const handleQuestionChange = (questionId: string) => {
    // Track question timing
    questionTimeTracker.startQuestion(questionId);
  };

  const handleExamSubmit = async () => {
    const stats = questionTimeTracker.getStatistics();
    const behaviors = suspiciousBehaviorDetector.analyzeBehavior({
      score: finalScore,
      totalPoints: maxPoints,
      timeTaken: totalTime,
      questionCount: questions.length,
      ...stats
    });

    // Log suspicious behavior
    if (behaviors.riskLevel === 'high') {
      await supabaseClient
        .from('exam_flagged_attempts')
        .insert({
          exam_id: examId,
          user_id: userId,
          risk_level: behaviors.riskLevel,
          flags: behaviors.flags,
          analysis: behaviors
        });
    }

    // End attempt
    examAttemptLimiter.endAttempt(finalScore, maxPoints);
  };

  return (
    // Exam UI
  );
}
```

---

## Supabase Schema for Logging

```sql
-- Exam attempt logs (device tracking)
CREATE TABLE exam_attempt_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ip_address TEXT,
  device_fingerprint TEXT,
  user_agent TEXT,
  platform TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flagged attempts (suspicious behavior)
CREATE TABLE exam_flagged_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  risk_level TEXT NOT NULL, -- 'low' | 'medium' | 'high'
  flags JSONB, -- Array of suspicious behaviors
  analysis JSONB, -- Full analysis results
  reviewed BOOLEAN DEFAULT FALSE,
  reviewer_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_exam_attempt_logs_exam_id ON exam_attempt_logs(exam_id);
CREATE INDEX idx_exam_attempt_logs_user_id ON exam_attempt_logs(user_id);
CREATE INDEX idx_exam_attempt_logs_ip ON exam_attempt_logs(ip_address);
CREATE INDEX idx_flagged_attempts_exam_id ON exam_flagged_attempts(exam_id);
CREATE INDEX idx_flagged_attempts_user_id ON exam_flagged_attempts(user_id);
CREATE INDEX idx_flagged_attempts_risk_level ON exam_flagged_attempts(risk_level);
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Copy/Paste Block | ✅ | ✅ | ✅ | ✅ |
| Full-Screen | ✅ | ✅ | ✅ | ✅ |
| Right-Click Block | ✅ | ✅ | ✅ | ✅ |
| Tab Switch Detect | ✅ | ✅ | ✅ | ✅ |
| IP Fetching | ✅ | ✅ | ✅ | ✅ |
| Browser Lock | ✅ | ✅ | ⚠️ | ✅ |

⚠️ = Limited support, warnings only

---

## Security Notes

1. **Client-Side Only**: These are browser-side protections. For full security, validate on backend.
2. **IP Detection**: Requires public IP services. Can be blocked by proxies/VPNs.
3. **Browser Lock**: Modern browsers restrict some capabilities for user safety.
4. **LocalStorage**: Attempt limiting uses localStorage (can be cleared by user).
5. **Backend Validation**: Always validate exam submissions server-side.

---

## Performance Impact

All modules are optimized for minimal performance impact:
- Event listeners are cleaned up
- No polling or continuous timers
- Efficient data structures
- Lazy loading where applicable
- Zero external dependencies (except Supabase)

---

## Future Enhancements

Phase 3 (Premium):
- Webcam monitoring (random photo capture)
- Keystroke dynamics analysis
- Audio detection (surrounding noise)
- Face detection (requires camera permission)
- AI-powered proctoring
