-- Create admin access logs table for security auditing
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin replies table for feedback responses
CREATE TABLE IF NOT EXISTS public.admin_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  admin_email TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  is_html BOOLEAN DEFAULT false, -- For rich-text editor support
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin audit log table for tracking all admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('status_update', 'reply_created', 'reply_deleted', 'feedback_viewed', 'export')),
  feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE SET NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin access logs policies (only admins can view)
CREATE POLICY "Admins can view all access logs"
ON public.admin_access_logs
FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM auth.users 
  WHERE id = auth.uid() AND email IN ('albhyrytwamrwhybusiness@gmail.com', 'oryno80@gmail.com')
));

CREATE POLICY "System can insert access logs"
ON public.admin_access_logs
FOR INSERT
WITH CHECK (true);

-- Admin replies policies
CREATE POLICY "Anyone can view admin replies"
ON public.admin_replies
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert replies"
ON public.admin_replies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('albhyrytwamrwhybusiness@gmail.com', 'oryno80@gmail.com')
  )
);

CREATE POLICY "Only admins can update their own replies"
ON public.admin_replies
FOR UPDATE
USING (
  auth.uid() = admin_id
)
WITH CHECK (
  auth.uid() = admin_id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('albhyrytwamrwhybusiness@gmail.com', 'oryno80@gmail.com')
  )
);

CREATE POLICY "Only admins can delete their own replies"
ON public.admin_replies
FOR DELETE
USING (
  auth.uid() = admin_id AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('albhyrytwamrwhybusiness@gmail.com', 'oryno80@gmail.com')
  )
);

-- Admin audit log policies
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email IN ('albhyrytwamrwhybusiness@gmail.com', 'oryno80@gmail.com')));

CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);

-- Modify feedbacks table to add admin status update capability
-- Add admin_notes column if not exists
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_email ON public.admin_access_logs(email);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_attempted_at ON public.admin_access_logs(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_status ON public.admin_access_logs(status);
CREATE INDEX IF NOT EXISTS idx_admin_replies_feedback_id ON public.admin_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_admin_replies_admin_id ON public.admin_replies(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_replies_created_at ON public.admin_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_type ON public.admin_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
