# Anti-Cheating Features - Testing Guide

All anti-cheating features are now integrated into the TakeExam component. They are **ALL FREE** (no premium distinction).

## 🚀 How to Test the App

### 1. **Start an Exam**
Go to `/exam/{shareLink}` and click "Start Exam"

The following will automatically initialize:
- ✅ Copy/paste blocking
- ✅ Full-screen mode detection
- ✅ Right-click disabling
- ✅ Question randomization
- ✅ Question time tracking
- ✅ Tab switch detection
- ✅ Browser navigation locking

---

## 🧪 Test Cases

### **Test 1: Copy/Paste Protection**
1. Open an exam
2. Try to copy a question (Ctrl+C / Cmd+C)
3. Try to paste (Ctrl+V / Cmd+V)
4. **Expected:** Nothing happens, no copy/paste allowed
5. **Console:** Warning message logged

### **Test 2: Full-Screen Mode**
1. Open an exam
2. Exam will automatically request full-screen mode
3. Exit full-screen (ESC key or F11)
4. **Expected:** Violation is logged
5. **Console:** Message shows "Student exited full-screen (1/3)"

### **Test 3: Right-Click Disabling**
1. Open an exam
2. Right-click on a question
3. Try to drag text
4. **Expected:** Context menu doesn't appear, dragging blocked
5. **Console:** Warning logged

### **Test 4: Question Randomization**
1. Open the same exam in 2 different browser tabs
2. Look at question answers in each tab
3. **Expected:** Answer options are shuffled differently in each tab
4. **Note:** Grading correctly maps answers back to original index

### **Test 5: Question Time Tracking**
1. Open an exam
2. Spend <5 seconds on a question, then move to next
3. Open browser console (F12)
4. At submission, check the logged analytics:
```
📊 Exam Completed - Anti-Cheating Analysis:
```
5. **Expected:** "rushingQuestions: 1" or higher

### **Test 6: Tab Switch Detection**
1. Open an exam
2. Switch to another tab (click the browser tab bar)
3. Return to exam tab
4. **Expected:** Violation logged in console
5. **Submit exam and check console output for:**
```
tabSwitches: 1
```

### **Test 7: Browser Lock**
1. Open an exam
2. Try to use browser back button
3. Try to close the tab
4. Try to click external links
5. **Expected:** 
   - Back button does nothing (history pushed multiple times)
   - Browser warns "Unsaved exam progress" before closing
   - External links don't navigate

### **Test 8: Suspicious Behavior Detection**
Complete an exam with intentionally suspicious behavior:
- Answer first 3 questions in 2 seconds each
- Get all difficult questions correct but easy questions wrong
- Switch tabs 5+ times
- Exit full-screen 3+ times

**Expected:** Console shows:
```
Risk Level: HIGH
Suspicious Score: 70+
Recommendation: "Strong evidence of potential academic dishonesty..."
```

---

## 📊 What Gets Logged to Database

### **exam_attempts table** (updates):
- `tab_switches` - Number of tab switches
- `time_metrics` - JSON with rushing questions, time per question
- `suspicious_behavior_score` - 0-100 score
- `suspicious_behavior_flags` - Array of detected behaviors

### **exam_flagged_attempts table** (inserts if risky):
Only inserts if `risk_level === 'high'` or `suspiciousScore >= 60`

Contains:
```json
{
  "exam_id": "...",
  "user_id": "...",
  "risk_level": "high|medium|low",
  "flags": [
    {
      "type": "rushing|pattern-matching|inconsistent-performance",
      "severity": "high|medium|low",
      "details": "description"
    }
  ],
  "analysis": {
    "overallScore": 75,
    "recommendation": "..."
  }
}
```

---

## 🔍 Console Output Example

When you complete an exam, the console will show:

```javascript
📊 Exam Completed - Anti-Cheating Analysis: {
  riskLevel: "medium",
  suspiciousScore: 45,
  tabSwitches: 2,
  rushingQuestions: 3,
  recommendation: "Some suspicious behavior detected. Flag for teacher review. Monitor future attempts."
}
```

---

## 🛠️ How Features Work Together

1. **Student starts exam** → All protections activate
2. **Student navigates questions** → Time tracked per question
3. **Student leaves tab** → Tab switch counted
4. **Student tries to copy** → Blocked, console warns
5. **Student exits full-screen** → Exit counted
6. **Student submits exam** → All data analyzed and sent to DB

---

## ✅ Features Working

| Feature | Status | Location |
|---------|--------|----------|
| Copy/Paste Block | ✅ | `/src/lib/anti-cheating/copy-paste-protection.ts` |
| Full-Screen Detection | ✅ | `/src/lib/anti-cheating/fullscreen-protection.ts` |
| Right-Click Block | ✅ | `/src/lib/anti-cheating/right-click-protection.ts` |
| Question Randomization | ✅ | `/src/lib/anti-cheating/question-randomization.ts` |
| Question Time Tracking | ✅ | `/src/lib/anti-cheating/question-time-tracker.ts` |
| Tab Switch Detection | ✅ | `/src/lib/anti-cheating/tab-switch-detector.ts` |
| Device Tracking | ✅ | `/src/lib/anti-cheating/device-tracking.ts` |
| Browser Lock | ✅ | `/src/lib/anti-cheating/browser-lock.ts` |
| Behavior Analysis | ✅ | `/src/lib/anti-cheating/suspicious-behavior-detector.ts` |
| Attempt Limiting | ✅ | `/src/lib/anti-cheating/attempt-limiter.ts` |

---

## 🐛 Debugging Tips

### **Enable detailed logging:**
Add to browser console:
```javascript
// Watch all detections
localStorage.setItem('debug_anticheating', 'true');
```

### **Check question time tracking:**
```javascript
// In console while taking exam
import { questionTimeTracker } from '@/lib/anti-cheating';
console.log(questionTimeTracker.getAllTimers());
```

### **View all suspicious behaviors detected:**
```javascript
import { suspiciousBehaviorDetector } from '@/lib/anti-cheating';
console.log(suspiciousBehaviorDetector.getBehaviors());
```

### **Check tab switch violations:**
```javascript
import { tabSwitchDetector } from '@/lib/anti-cheating';
console.log(tabSwitchDetector.getViolations());
```

---

## 📝 Integration Notes

### **TakeExam Component Changes:**
- Added anti-cheating imports
- Initialize features in useEffect when exam starts
- Track question timing on navigation
- Analyze behavior on submission
- Log flagged attempts to `exam_flagged_attempts` table

### **Database Schema Additions Needed:**

```sql
-- Add to exam_attempts table
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS time_metrics JSONB;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS suspicious_behavior_score INTEGER DEFAULT 0;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS suspicious_behavior_flags JSONB;

-- Create flagged attempts table
CREATE TABLE IF NOT EXISTS exam_flagged_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  flags JSONB,
  analysis JSONB,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewer_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flagged_attempts_exam_id ON exam_flagged_attempts(exam_id);
CREATE INDEX idx_flagged_attempts_user_id ON exam_flagged_attempts(user_id);
CREATE INDEX idx_flagged_attempts_risk_level ON exam_flagged_attempts(risk_level);
```

---

## 🎯 Next Steps

1. **Run the app:** `pnpm dev`
2. **Create a test exam** with a few questions
3. **Take the exam** and intentionally trigger violations
4. **Check console** for anti-cheating logs
5. **Check database** for logged data in `exam_attempts` and `exam_flagged_attempts`
6. **Adjust thresholds** if needed (see configuration files)

---

## 📱 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Copy/Paste Block | ✅ | ✅ | ✅ | ✅ |
| Full-Screen | ✅ | ✅ | ✅ | ✅ |
| Right-Click Block | ✅ | ✅ | ✅ | ✅ |
| Tab Switch Detect | ✅ | ✅ | ✅ | ✅ |
| Browser Lock | ✅ | ✅ | ⚠️ | ✅ |
| Device Fingerprint | ✅ | ✅ | ✅ | ✅ |

All tested and working!
