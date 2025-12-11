-- Fix exam_attempts table schema to support decimal scores
ALTER TABLE public.exam_attempts
ALTER COLUMN score TYPE NUMERIC(5, 2) USING score::NUMERIC(5, 2);

-- Also update total_points to be numeric to support partial scoring
ALTER TABLE public.exam_attempts
ALTER COLUMN total_points TYPE NUMERIC(10, 2) USING total_points::NUMERIC(10, 2);
