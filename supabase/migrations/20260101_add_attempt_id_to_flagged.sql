-- Add attempt_id to exam_flagged_attempts table
-- This allows linking flagged attempts to the specific exam_attempts record

ALTER TABLE exam_flagged_attempts
ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE;

-- Create index for faster lookups by attempt_id
CREATE INDEX IF NOT EXISTS idx_flagged_attempts_attempt_id ON exam_flagged_attempts(attempt_id);
