# Database Integration & Real-Time Analytics - Complete Implementation

## ✅ Features Implemented

### 1. **Exam Start Tracking** ✅
When a student starts an exam:
- IP address is captured
- Device information is logged (user agent, platform, screen resolution, timezone, language)
- Stored in `exam_attempt_logs` table

**Files Updated:**
- `TakeExam.tsx` - Calls `trackExamAttemptStart()` on exam load
- `database-tracker.ts` - `trackExamAttemptStart()` function

---

### 2. **Question Randomization & Order Storage** ✅
When questions are randomized:
- Original question order is stored
- Shuffled order is stored
- Order mapping (original index → shuffled index) is created
- All stored in `question_order` table

**Files Updated:**
- `TakeExam.tsx` - Calls `storeQuestionOrder()` after randomizing
- `database-tracker.ts` - `storeQuestionOrder()` function

---

### 3. **Security Events Logging** ✅
Every rule violation is logged:
- Tab switches → `security_events` table
- Fullscreen exits → `security_events` table
- Devtools attempts → `security_events` table
- Copy/paste attempts → `security_events` table

**Events Include:**
- Event type
- Event details (context)
- Timestamp (milliseconds)
- Severity level (low/medium/high)

**Files Updated:**
- `TakeExam.tsx` - Calls `logSecurityEvent()` for each violation
- `database-tracker.ts` - `logSecurityEvent()` function

---

### 4. **Exam Submission Status Update** ✅
When exam is submitted:
- `is_completed` set to true
- `score` calculated and saved
- `total_points` saved
- `passed` determined
- `end_time` recorded
- `failure_reason` saved (if applicable): `"wrong_answers"` or `"rules_violation"`
- `is_terminated` flag set (if exam was terminated)
- `termination_reason` saved with details
- `violation_details` stored with rules broken

**Files Updated:**
- `TakeExam.tsx` - Calls `updateExamAttemptStatus()` on submit/terminate
- `database-tracker.ts` - `updateExamAttemptStatus()` function

---

### 5. **Termination Modal** ✅
When exam is terminated (2nd violation):
- User sees modal explaining termination
- Message states: "Your exam will be reviewed by the teacher/exam creator"
- Shows which rules were broken
- Auto-fails exam with score 0
- Flags attempt as "high" risk in `exam_flagged_attempts`

**Files Updated:**
- `TakeExam.tsx` - Shows `showTerminationModal` with detailed message

---

### 6. **Student Dashboard Analytics** ✅
For each exam attempt, students see:
- **Termination Status** - Red alert if terminated with reason
- **Failure Reason** - If failed due to wrong answers vs rule violations
- **Status Icons** - Visual indicators (check, warning, error)
- **Real-time Updates** - Via live subscription

**Features:**
- Shows all attempts with scores
- Highlights terminated attempts in red
- Shows failure reasons
- Color-coded by performance

**Files Updated:**
- `StudentDashboard.tsx` - Shows failure reasons and termination status
- Added `useRealTimeExamAttempts()` subscription

---

### 7. **Teacher Dashboard Analytics** ✅
Teachers see:
- **Flagged Attempts Section** - Shows all flagged attempts requiring review
  - Exam name
  - Risk level (HIGH/MEDIUM)
  - Reason for flag
  - Violations list
  - "Review" button
- **Real-time Alerts** - Toast notification when new flagged attempt
- **Exam List** - All created exams with attempt counts
- **Active Monitoring** - Live updates of new violations

**Features:**
- Unreviewed flagged attempts appear at top
- Shows up to 5 most recent
- Color-coded by risk level
- Real-time notification on new flags

**Files Updated:**
- `TeacherDashboard.tsx` - Shows flagged attempts
- Added `useRealTimeFlaggedAttempts()` subscription

---

### 8. **Results Page Analytics** ✅
When student views exam results:
- **Termination Details** - If exam was terminated
  - Reason displayed
  - Rules broken listed
  - Review notice
- **Failure Reason** - Shows why they failed
- **Security Events** - Timeline of violations with timestamps
- **Question Review** - With correct/incorrect status

**Files Updated:**
- `ExamResults.tsx` - Shows termination, failure reason, security events

---

### 9. **Database Schema Updates** ✅
New tables created:
- `question_order` - Tracks randomized question order
- `security_events` - Logs all rule violations
- `exam_flagged_attempts` - (Already exists) Stores high-risk attempts
- `exam_attempt_logs` - (Already exists) Device information

**New Columns in exam_attempts:**
- `failure_reason` - TEXT (wrong_answers | rules_violation)
- `is_terminated` - BOOLEAN
- `termination_reason` - TEXT
- `violation_details` - JSONB

**Migration File:**
- `supabase/migrations/20251231_add_security_tracking.sql`

---

### 10. **Real-Time Subscriptions** ✅
Three real-time hooks created:
1. `useRealTimeExamAttempts()` - Subscribe to exam attempt changes
2. `useRealTimeSecurityEvents()` - Subscribe to security events
3. `useRealTimeFlaggedAttempts()` - Subscribe to flagged attempts

**Usage:**
```typescript
// In StudentDashboard
useRealTimeExamAttempts((updatedAttempt) => {
  // Update UI when attempt changes
}, { student_id: user.id });

// In TeacherDashboard
useRealTimeFlaggedAttempts((newFlaggedAttempt) => {
  // Add to list and show notification
});
```

**Files:**
- `hooks/useRealTimeExam.ts` - All three hooks

---

## 📊 Data Flow Diagram

```
EXAM START
├─ Create exam_attempts record
├─ Log IP & device in exam_attempt_logs
├─ Store question order in question_order
└─ Enable anti-cheating protections
   
DURING EXAM
├─ Track time per question
├─ Monitor violations
├─ Log security events to security_events table
│  ├─ Tab switch
│  ├─ Fullscreen exit
│  └─ etc.
└─ Update answers in real-time

VIOLATION RULES
├─ First violation → Warning modal shown
├─ Log to security_events table
└─ Second violation → TERMINATE
   ├─ Update exam_attempts
   │  ├─ is_terminated = true
   │  ├─ termination_reason = reason
   │  ├─ violation_details = all violations
   │  └─ score = 0, passed = false
   ├─ Insert into exam_flagged_attempts
   │  ├─ risk_level = 'high'
   │  └─ analysis = reason & violations
   ├─ Show termination modal
   └─ Auto-redirect to results

EXAM SUBMIT (Normal)
├─ Calculate score
├─ Update exam_attempts with
│  ├─ score, total_points, passed
│  └─ failure_reason (if failed)
├─ Log suspicious behavior score
└─ Flag if behavior score > 60

RESULTS PAGE
├─ Load exam_attempts with all details
├─ Fetch security_events for timeline
├─ Fetch question_order for context
├─ Display:
│  ├─ Termination reason (if terminated)
│  ├─ Failure reason (if failed)
│  └─ Security events timeline
└─ Real-time updates via subscription
```

---

## 🔄 Real-Time Features

### Student Dashboard
- **Live Score Updates** - When attempt score changes
- **Status Changes** - When attempt is terminated or reviewed
- Updates every time teacher marks as reviewed

### Teacher Dashboard
- **Instant Alerts** - Toast notification when new flagged attempt
- **Live List** - Flagged attempts appear in real-time
- **One-way Sync** - Automatic refresh without page reload

---

## 📈 Analytics Available

### For Students
1. **Attempt History** with:
   - Score percentage
   - Time taken
   - Pass/fail status
   - Termination indicator
   - Failure reason

2. **Detailed Results** showing:
   - Termination details + review notice
   - Failure reason (wrong answers vs rules)
   - Security events timeline with timestamps
   - Question-by-question review

### For Teachers
1. **Flagged Attempts** showing:
   - Student email/name
   - Exam name
   - Risk level
   - Reason for flag
   - Violations breakdown
   - Direct "Review" link

2. **Statistics** by exam:
   - Total attempts
   - Questions per exam
   - Published/draft status
   - Creation date

---

## 🚀 How It Works Together

**Example Scenario:**
1. Student starts exam → Device logged, questions randomized, order stored
2. Student switches tabs → Security event logged, violation tracker increments
3. Warning modal shows → "One more violation will fail"
4. Student exits fullscreen → Second violation recorded
5. Exam terminates → Termination modal shows, exam auto-fails, flagged attempt created
6. Student sees results → Termination reason, rules broken, security timeline shown
7. Teacher sees alert → Toast notification of new flagged attempt
8. Teacher dashboard updates → Flagged attempt appears in real-time at top
9. Teacher clicks "Review" → Goes to results page to see all details

---

## 💾 Database Structure Summary

### exam_attempts (updated)
```json
{
  "id": "uuid",
  "exam_id": "uuid",
  "student_id": "uuid",
  "score": 85.5,
  "total_points": 100,
  "passed": true,
  "is_completed": true,
  "failure_reason": "wrong_answers",
  "is_terminated": false,
  "termination_reason": null,
  "violation_details": null,
  "answers": {}
}
```

### question_order (new)
```json
{
  "id": "uuid",
  "exam_id": "uuid",
  "user_id": "uuid",
  "attempt_id": "uuid",
  "original_order": ["q1", "q2", "q3"],
  "shuffled_order": ["q3", "q1", "q2"],
  "order_mapping": { "0": 1, "1": 2, "2": 0 }
}
```

### security_events (new)
```json
{
  "id": "uuid",
  "exam_id": "uuid",
  "user_id": "uuid",
  "attempt_id": "uuid",
  "event_type": "tab-switch",
  "event_details": {},
  "timestamp": 1704067200000,
  "severity": "high"
}
```

### exam_flagged_attempts (updated)
```json
{
  "id": "uuid",
  "exam_id": "uuid",
  "user_id": "uuid",
  "risk_level": "high",
  "flags": [
    { "type": "tab-switch", "severity": "high", "timestamp": ... }
  ],
  "analysis": {
    "reason": "Tab switch detected twice",
    "violations": [...]
  },
  "reviewed": false
}
```

---

## 🔗 Files Modified/Created

### New Files:
- `src/lib/anti-cheating/database-tracker.ts` - All database functions
- `src/hooks/useRealTimeExam.ts` - Real-time subscriptions
- `supabase/migrations/20251231_add_security_tracking.sql` - Database schema

### Modified Files:
- `src/pages/TakeExam.tsx` - Exam flow + database integration + termination modal
- `src/pages/ExamResults.tsx` - Show failure reasons + security events
- `src/components/dashboard/StudentDashboard.tsx` - Show termination/failure status + real-time
- `src/components/dashboard/TeacherDashboard.tsx` - Flagged attempts list + real-time alerts
- `src/lib/anti-cheating/index.ts` - Export database-tracker functions

---

## 🎯 Testing Checklist

**Exam Start:**
- [ ] IP address logged in exam_attempt_logs
- [ ] Device info (platform, screen res, timezone) logged
- [ ] Question order stored correctly
- [ ] Original and shuffled order match questions

**During Exam:**
- [ ] Tab switch logged to security_events
- [ ] Fullscreen exit logged
- [ ] Warning modal shows on first violation
- [ ] Real-time update triggers in dashboard

**Termination:**
- [ ] Second violation triggers termination
- [ ] Termination modal displays message
- [ ] Exam marked as terminated
- [ ] Score set to 0, passed set to false
- [ ] Flagged attempt created with risk_level='high'
- [ ] Violations details stored correctly

**Student Results Page:**
- [ ] Termination reason displays
- [ ] Rules broken listed
- [ ] Security events timeline shows
- [ ] Timestamps correct for events

**Teacher Dashboard:**
- [ ] Flagged attempts appear
- [ ] Risk level badge shows
- [ ] Reason for flag displays
- [ ] Real-time notification fires
- [ ] "Review" button works
- [ ] List updates without refresh

**Real-Time Features:**
- [ ] Student dashboard updates when attempt status changes
- [ ] Teacher gets toast when new flag created
- [ ] Flagged list updates in real-time
- [ ] No page reload needed

---

## ⚡ Performance Considerations

1. **Indexes Added** - On all foreign keys and timestamps
2. **JSONB Columns** - For flexible violation/analysis data
3. **Real-time Filters** - Only subscribe to relevant data
4. **Pagination Ready** - Can be added to flagged attempts list
5. **Batch Queries** - Device logs and event inserts optimized

---

## 🔐 Security Notes

- All data stored server-side, cannot be modified by client
- Termination logged with full violation details for audit trail
- Teacher review status tracked (`reviewed` column)
- IP addresses stored for manual verification
- Device fingerprints help detect cheating patterns
- Real-time alerts notify teachers immediately of flags

---

## 📝 Next Steps (Optional)

1. **Teacher Review UI** - Detailed review page for flagged attempts
2. **Analytics Dashboard** - Charts of most common violations
3. **Bulk Actions** - Mark multiple as reviewed
4. **Alerts Settings** - Teachers choose notification frequency
5. **Archive System** - Move reviewed attempts to archive
6. **Export Reports** - CSV/PDF export of flagged attempts
