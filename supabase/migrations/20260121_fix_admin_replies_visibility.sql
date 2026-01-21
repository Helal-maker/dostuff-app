-- Fix RLS policies to ensure admin replies are visible to all users
-- Drop the existing policy if it has issues and recreate it

-- Ensure admin_replies SELECT policy allows public viewing
DROP POLICY IF EXISTS "Anyone can view admin replies" ON public.admin_replies;

CREATE POLICY "Anyone can view admin replies"
ON public.admin_replies
FOR SELECT
USING (true);

-- Verify feedback_comments SELECT policy is also public
DROP POLICY IF EXISTS "Anyone can view comments" ON public.feedback_comments;

CREATE POLICY "Anyone can view comments"
ON public.feedback_comments
FOR SELECT
USING (true);

-- Add a test to ensure the tables have RLS enabled but are readable
-- Both tables should allow SELECT to everyone via USING (true)
