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
  warnBeforeLeaving,
  redirectOnClose,
  browserLock,
  BrowserLock
} from './browser-lock';

// Suspicious Behavior Detection
import {
  suspiciousBehaviorDetector,
  SuspiciousBehaviorDetector
} from './suspicious-behavior-detector';

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
  warnBeforeLeaving,
  redirectOnClose,
  browserLock,
  BrowserLock,
  suspiciousBehaviorDetector,
  SuspiciousBehaviorDetector
};

/**
 * Unified Anti-Cheating Configuration
 * Initialize all anti-cheating measures at once
 */
export interface AntiCheatingConfig {
  copyPasteProtection?: boolean;
  fullScreenMode?: boolean;
  rightClickDisabled?: boolean;
  randomizeQuestions?: boolean;
  trackQuestionTime?: boolean;
  limitAttempts?: number;
  detectTabSwitch?: boolean;
  trackDevice?: boolean;
  browserLock?: boolean;
  detectSuspiciousBehavior?: boolean;
}

/**
 * Initialize anti-cheating features
 */
export function initializeAntiCheating(config: AntiCheatingConfig = {}) {
  const {
    copyPasteProtection: enableCopyPaste = true,
    fullScreenMode = true,
    rightClickDisabled = true,
    limitAttempts = 3,
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

  console.log('✅ Anti-cheating features initialized', {
    copyPaste: enableCopyPaste,
    fullScreen: fullScreenMode,
    rightClick: rightClickDisabled,
    tabSwitch: detectTabSwitch,
    browserLock: enableBrowserLock
  });
}

/**
 * Disable all anti-cheating features
 * Useful for cleanup after exam completion
 */
export function disableAntiCheating() {
  copyPasteProtection.disable();
  fullScreenProtection.disable();
  rightClickProtection.disable();
  tabSwitchDetector.disable();
  browserLock.disable();

  console.log('✅ All anti-cheating features disabled');
}
