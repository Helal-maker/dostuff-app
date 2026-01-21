-- Create a function to update comment count whenever admin_replies are added or deleted
CREATE OR REPLACE FUNCTION update_feedback_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Count both user comments and admin replies
  UPDATE feedbacks
  SET comment_count = (
    SELECT COUNT(*) FROM feedback_comments WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
  ) + (
    SELECT COUNT(*) FROM admin_replies WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
  )
  WHERE id = COALESCE(NEW.feedback_id, OLD.feedback_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin_replies INSERT
CREATE TRIGGER trigger_admin_reply_insert
AFTER INSERT ON public.admin_replies
FOR EACH ROW
EXECUTE FUNCTION update_feedback_comment_count();

-- Create trigger for admin_replies DELETE
CREATE TRIGGER trigger_admin_reply_delete
AFTER DELETE ON public.admin_replies
FOR EACH ROW
EXECUTE FUNCTION update_feedback_comment_count();

-- Create trigger for feedback_comments INSERT if not already exists
DROP TRIGGER IF EXISTS trigger_comment_insert ON public.feedback_comments;
CREATE TRIGGER trigger_comment_insert
AFTER INSERT ON public.feedback_comments
FOR EACH ROW
EXECUTE FUNCTION update_feedback_comment_count();

-- Create trigger for feedback_comments DELETE if not already exists
DROP TRIGGER IF EXISTS trigger_comment_delete ON public.feedback_comments;
CREATE TRIGGER trigger_comment_delete
AFTER DELETE ON public.feedback_comments
FOR EACH ROW
EXECUTE FUNCTION update_feedback_comment_count();
