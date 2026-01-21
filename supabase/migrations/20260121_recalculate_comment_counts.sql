-- Recalculate comment counts for all existing feedbacks to include admin replies
UPDATE public.feedbacks
SET comment_count = (
  SELECT COUNT(*) FROM public.feedback_comments WHERE feedback_id = feedbacks.id
) + (
  SELECT COUNT(*) FROM public.admin_replies WHERE feedback_id = feedbacks.id
);

-- Verify the update
-- SELECT id, title, comment_count FROM public.feedbacks ORDER BY created_at DESC LIMIT 10;
