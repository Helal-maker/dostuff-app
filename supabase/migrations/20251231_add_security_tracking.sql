-- Security & Tracking Schema Update
-- Adds tables for question order tracking and security events logging

-- 1. Create question_order table for tracking randomized question orders
CREATE TABLE IF NOT EXISTS question_order (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  original_order JSONB NOT NULL, -- Array of question IDs in original order
  shuffled_order JSONB NOT NULL, -- Array of question IDs in shuffled order
  order_mapping JSONB NOT NULL,  -- Maps original index to shuffled index
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create security_events table for tracking rule violations
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- "tab-switch", "fullscreen-exit", "devtools", "copy-paste", "right-click"
  event_details JSONB DEFAULT NULL, -- Additional context
  timestamp BIGINT NOT NULL,  -- Milliseconds since epoch
  severity TEXT DEFAULT 'medium', -- "low", "medium", "high"
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_order_exam_id ON question_order(exam_id);
CREATE INDEX IF NOT EXISTS idx_question_order_user_id ON question_order(user_id);
CREATE INDEX IF NOT EXISTS idx_question_order_attempt_id ON question_order(attempt_id);

CREATE INDEX IF NOT EXISTS idx_security_events_exam_id ON security_events(exam_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_attempt_id ON security_events(attempt_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- 4. Add column to exam_attempts to track failure reason
ALTER TABLE exam_attempts 
ADD COLUMN IF NOT EXISTS failure_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_terminated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS termination_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS violation_details JSONB DEFAULT NULL;

-- 5. Sample data structure documentation
/*
-- question_order example:
{
  "id": "uuid",
  "exam_id": "exam-uuid",
  "attempt_id": "attempt-uuid",
  "user_id": "user-uuid",
  "original_order": ["q1", "q2", "q3", "q4", "q5"],
  "shuffled_order": ["q3", "q1", "q5", "q2", "q4"],
  "order_mapping": {
    "0": 1,  -- original Q1 is now at index 1
    "1": 3,  -- original Q2 is now at index 3
    "2": 0,  -- original Q3 is now at index 0
    "3": 4,  -- original Q4 is now at index 4
    "4": 2   -- original Q5 is now at index 2
  }
}

-- security_events example:
{
  "id": "uuid",
  "exam_id": "exam-uuid",
  "attempt_id": "attempt-uuid",
  "user_id": "user-uuid",
  "event_type": "tab-switch",
  "event_details": {
    "count": 1,
    "visibility_state": "hidden"
  },
  "timestamp": 1704067200000,
  "severity": "high",
  "created_at": "2024-12-31T12:00:00Z"
}

-- exam_attempts additions:
{
  "failure_reason": "wrong_answers" OR "rules_violation",
  "is_terminated": true,
  "termination_reason": "Tab switch detected twice",
  "violation_details": {
    "violations": [
      {
        "type": "tab-switch",
        "timestamp": 1704067200000,
        "count": 1
      },
      {
        "type": "fullscreen-exit",
        "timestamp": 1704067300000,
        "count": 1
      }
    ],
    "rules_broken": ["tab-switch", "fullscreen-exit"],
    "total_violations": 2
  }
}
*/
