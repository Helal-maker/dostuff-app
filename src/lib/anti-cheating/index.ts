/**
 * Anti-Cheating Module Hub
 * Central export point for all anti-cheating features
 */

// Copy/Paste Protection
import {
  copyPasteProtection,
  CopyPasteProtection
} from './copy-paste-protection';

// Full-Screen Protection
import {
  fullScreenProtection,
  FullScreenProtection
} from './fullscreen-protection';

// Right-Click Protection
import {
  rightClickProtection,
  RightClickProtection
} from './right-click-protection';

// Question Randomization
import {
  shuffleArray,
  shuffleMultipleChoiceWithTracking,
  randomizeQuestionAnswers,
  randomizeExamQuestions,
  mapAnswerToOriginalIndex,
  mapOriginalIndexToShuffled,
  verifyRandomizedAnswer
} from './question-randomization';

// Question Time Tracking
import {
  questionTimeTracker,
  QuestionTimeTracker
} from './question-time-tracker';

// Exam Attempt Limiter
import {
  examAttemptLimiter,
  ExamAttemptLimiter
} from './attempt-limiter';

// Tab Switch Detection
import {
  tabSwitchDetector,
  TabSwitchDetector
} from './tab-switch-detector';

// Device Tracking
import {
  fetchStudentIPAddress,
  getDeviceInfo,
  generateDeviceFingerprint,
  logExamAttemptDevice,
  checkSuspiciousDeviceActivity,
  DeviceTracker
} from './device-tracking';

// Browser Lock
import {
  browserLock,
  BrowserLock
} from './browser-lock';

// Suspicious Behavior Detection
import {
  suspiciousBehaviorDetector,
  SuspiciousBehaviorDetector
} from './suspicious-behavior-detector';

// Exam Violation Tracker
import {
  examViolationTracker,
  ExamViolationTracker
} from './violation-tracker';

// Export everything
export {
  copyPasteProtection,
  CopyPasteProtection,
  fullScreenProtection,
  FullScreenProtection,
  rightClickProtection,
  RightClickProtection,
  shuffleArray,
  shuffleMultipleChoiceWithTracking,
  randomizeQuestionAnswers,
  randomizeExamQuestions,
  mapAnswerToOriginalIndex,
  mapOriginalIndexToShuffled,
  verifyRandomizedAnswer,
  questionTimeTracker,
  QuestionTimeTracker,
  examAttemptLimiter,
  ExamAttemptLimiter,
  tabSwitchDetector,
  TabSwitchDetector,
  fetchStudentIPAddress,
  getDeviceInfo,
  generateDeviceFingerprint,
  logExamAttemptDevice,
  checkSuspiciousDeviceActivity,
  DeviceTracker,
  browserLock,
  BrowserLock,
  suspiciousBehaviorDetector,
  SuspiciousBehaviorDetector,
  examViolationTracker,
  ExamViolationTracker
};

/**
 * Initialize anti-cheating features
 */
export function initializeAntiCheating(config: any = {}) {
  const {
    copyPasteProtection: enableCopyPaste = true,
    fullScreenMode = true,
    rightClickDisabled = true,
    detectTabSwitch = true,
    browserLock: enableBrowserLock = true
  } = config;

  // Enable all protections
  if (enableCopyPaste) {
    copyPasteProtection.enable();
  }

  if (fullScreenMode) {
    fullScreenProtection.enable();
  }

  if (rightClickDisabled) {
    rightClickProtection.enable();
  }

  if (detectTabSwitch) {
    tabSwitchDetector.enable();
  }

  if (enableBrowserLock) {
    browserLock.enable();
  }

  console.log('✅ Anti-cheating features initialized');
}

/**
 * Disable all anti-cheating features
 */
export function disableAntiCheating() {
  copyPasteProtection.disable();
  fullScreenProtection.disable();
  rightClickProtection.disable();
  tabSwitchDetector.disable();
  browserLock.disable();

  console.log('✅ All anti-cheating features disabled');
}
