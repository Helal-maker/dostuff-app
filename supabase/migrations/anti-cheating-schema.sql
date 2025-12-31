-- Anti-Cheating Database Schema Updates
-- Run these migrations to enable anti-cheating data logging

-- 1. Add anti-cheating columns to exam_attempts table
ALTER TABLE exam_attempts 
ADD COLUMN IF NOT EXISTS tab_switches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_metrics JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS suspicious_behavior_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suspicious_behavior_flags JSONB DEFAULT NULL;

-- 2. Create exam_flagged_attempts table for high-risk behavior
CREATE TABLE IF NOT EXISTS exam_flagged_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  flags JSONB DEFAULT NULL,
  analysis JSONB DEFAULT NULL,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewer_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_flagged_attempts_exam_id ON exam_flagged_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_flagged_attempts_user_id ON exam_flagged_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_flagged_attempts_risk_level ON exam_flagged_attempts(risk_level);
CREATE INDEX IF NOT EXISTS idx_flagged_attempts_created_at ON exam_flagged_attempts(created_at DESC);

-- 4. Create exam_attempt_logs table for device tracking
CREATE TABLE IF NOT EXISTS exam_attempt_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT DEFAULT NULL,
  device_fingerprint TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  platform TEXT DEFAULT NULL,
  screen_resolution TEXT DEFAULT NULL,
  timezone TEXT DEFAULT NULL,
  language TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create indexes for device logs
CREATE INDEX IF NOT EXISTS idx_exam_attempt_logs_exam_id ON exam_attempt_logs(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempt_logs_user_id ON exam_attempt_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempt_logs_ip_address ON exam_attempt_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_exam_attempt_logs_created_at ON exam_attempt_logs(created_at DESC);

-- Schema Examples:

-- exam_flagged_attempts data example:
/*
{
  "id": "uuid",
  "exam_id": "exam-uuid",
  "user_id": "user-uuid",
  "risk_level": "high",
  "flags": [
    {
      "type": "rushing",
      "severity": "low",
      "timestamp": 1704016500000,
      "details": "Student answered question too quickly (3s)"
    },
    {
      "type": "multiple-violations",
      "severity": "high",
      "timestamp": 1704016600000,
      "details": "Multiple suspicious activities detected"
    }
  ],
  "analysis": {
    "overallScore": 75,
    "riskLevel": "high",
    "recommendation": "Strong evidence of potential academic dishonesty...",
    "summary": "HIGH risk - Student score: 95.0%..."
  },
  "reviewed": false,
  "created_at": "2024-12-31T10:00:00Z"
}
*/

-- exam_attempts updates example:
/*
{
  "tab_switches": 2,
  "time_metrics": {
    "totalQuestionsAnswered": 20,
    "averageTimePerQuestion": 45,
    "rushingQuestions": 3,
    "exceededTimeQuestions": 1,
    "totalAnswerChanges": 15,
    "questionsWithManyChanges": 2
  },
  "suspicious_behavior_score": 45,
  "suspicious_behavior_flags": [
    {
      "type": "rushing",
      "severity": "low"
    }
  ]
}
*/
