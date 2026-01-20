-- Drop existing feedback table if it exists
DROP TABLE IF EXISTS public.feedback_comments CASCADE;
DROP TABLE IF EXISTS public.feedback_votes CASCADE;
DROP TABLE IF EXISTS public.feedbacks CASCADE;

-- Create feedbacks table
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('bug', 'feature', 'improvement', 'general')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'planned', 'in-progress', 'completed')),
  upvote_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback votes table (upvotes)
CREATE TABLE public.feedback_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- Create feedback comments table
CREATE TABLE public.feedback_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

-- Feedbacks policies
CREATE POLICY "Anyone can view feedbacks"
ON public.feedbacks
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own feedback"
ON public.feedbacks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.feedbacks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.feedbacks
FOR DELETE
USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes"
ON public.feedback_votes
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own votes"
ON public.feedback_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.feedback_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments"
ON public.feedback_comments
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own comments"
ON public.feedback_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.feedback_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.feedback_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_feedbacks_status ON public.feedbacks(status);
CREATE INDEX idx_feedbacks_category ON public.feedbacks(category);
CREATE INDEX idx_feedbacks_created_at ON public.feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_upvote_count ON public.feedbacks(upvote_count DESC);
CREATE INDEX idx_feedback_votes_feedback_id ON public.feedback_votes(feedback_id);
CREATE INDEX idx_feedback_votes_user_id ON public.feedback_votes(user_id);
CREATE INDEX idx_feedback_comments_feedback_id ON public.feedback_comments(feedback_id);
CREATE INDEX idx_feedback_comments_user_id ON public.feedback_comments(user_id);
