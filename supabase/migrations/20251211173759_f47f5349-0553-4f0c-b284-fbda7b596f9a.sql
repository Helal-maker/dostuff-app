-- Allow teachers to view student profiles (for analytics)
-- This policy allows teachers to see the names of students who took their exams

CREATE POLICY "Teachers can view student profiles for their exams"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM exam_attempts ea
    JOIN exams e ON e.id = ea.exam_id
    WHERE ea.student_id = profiles.user_id
    AND e.teacher_id = auth.uid()
  )
);