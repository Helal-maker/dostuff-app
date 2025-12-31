-- Add attempt_id column to exam_attempt_logs to correlate device logs with exam attempts
ALTER TABLE exam_attempt_logs
ADD COLUMN attempt_id UUID REFERENCES exam_attempts(id) ON DELETE CASCADE;

-- Create index for the new column for efficient querying
CREATE INDEX IF NOT EXISTS idx_exam_attempt_logs_attempt_id ON exam_attempt_logs(attempt_id);
