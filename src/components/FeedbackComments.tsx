import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Trash2, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  user_id?: string;
  user_name: string;
  comment_text?: string;
  reply_text?: string;
  created_at: string;
  is_admin_reply?: boolean;
  admin_email?: string;
}

interface AdminReply {
  id: string;
  admin_id: string;
  admin_email: string;
  reply_text: string;
  created_at: string;
}

interface FeedbackCommentsProps {
  feedbackId: string;
  onCommentAdded?: () => void;
}

const FeedbackComments: React.FC<FeedbackCommentsProps> = ({ feedbackId, onCommentAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Fetch user comments
      const { data: userComments, error: commentsError } = await supabase
        .from('feedback_comments')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching user comments:', commentsError);
        throw commentsError;
      }

      // Fetch admin replies
      const { data: adminReplies, error: repliesError } = await supabase
        .from('admin_replies')
        .select('*')
        .eq('feedback_id', feedbackId)
        .order('created_at', { ascending: true });

      if (repliesError) {
        console.error('Error fetching admin replies:', repliesError);
        throw repliesError;
      }

      console.log(`Loaded ${userComments?.length || 0} user comments and ${adminReplies?.length || 0} admin replies for feedback ${feedbackId}`);

      // Combine and sort both
      const combined: Comment[] = [
        ...(userComments || []).map(c => ({
          id: c.id,
          user_id: c.user_id,
          user_name: c.user_name,
          comment_text: c.comment_text,
          created_at: c.created_at,
          is_admin_reply: false
        })),
        ...(adminReplies || []).map(r => ({
          id: r.id,
          user_name: 'Do Stuff Team',
          reply_text: r.reply_text,
          created_at: r.created_at,
          is_admin_reply: true,
          admin_email: r.admin_email
        }))
      ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      console.log(`Combined comments: ${combined.length}`);
      setComments(combined);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [feedbackId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to comment',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('feedback_comments').insert({
        feedback_id: feedbackId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || 'Anonymous',
        comment_text: newComment.trim(),
      });

      if (error) throw error;

      // Update comment count to include both user comments and admin replies
      const { count: userCommentsCount } = await supabase
        .from('feedback_comments')
        .select('id', { count: 'exact', head: true })
        .eq('feedback_id', feedbackId);
      
      const { count: adminRepliesCount } = await supabase
        .from('admin_replies')
        .select('id', { count: 'exact', head: true })
        .eq('feedback_id', feedbackId);

      const totalCommentCount = (userCommentsCount || 0) + (adminRepliesCount || 0);
      await supabase
        .from('feedbacks')
        .update({ comment_count: totalCommentCount })
        .eq('id', feedbackId);

      setNewComment('');
      await loadComments();
      onCommentAdded?.();

      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Update comment count to include both user comments and admin replies
      const { count: userCommentsCount } = await supabase
        .from('feedback_comments')
        .select('id', { count: 'exact', head: true })
        .eq('feedback_id', feedbackId);
      
      const { count: adminRepliesCount } = await supabase
        .from('admin_replies')
        .select('id', { count: 'exact', head: true })
        .eq('feedback_id', feedbackId);

      const totalCommentCount = (userCommentsCount || 0) + (adminRepliesCount || 0);
      await supabase
        .from('feedbacks')
        .update({ comment_count: Math.max(0, totalCommentCount) })
        .eq('id', feedbackId);

      await loadComments();
      onCommentAdded?.();

      toast({
        title: 'Success',
        description: 'Comment deleted',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-6">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6 pb-6 border-b border-border/50">
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts and ideas..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              disabled={submitting}
              className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setNewComment('')}
                disabled={submitting}
                className="hover:bg-accent/10 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="gap-2 shadow-soft hover:shadow-glow transition-all duration-300"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className={`flex gap-3 pb-4 border-b border-border/30 last:border-0 animate-in fade-in slide-in-from-top-2 duration-300 ${
                comment.is_admin_reply ? 'bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 p-3 rounded-lg border border-emerald-500/20' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Avatar className={`w-9 h-9 flex-shrink-0 border ${
                comment.is_admin_reply ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-primary/10'
              }`}>
                <AvatarFallback className={`text-xs font-semibold ${
                  comment.is_admin_reply ? 'bg-emerald-500/20 text-emerald-600' : 'bg-primary/10'
                }`}>
                  {getUserInitials(comment.user_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${
                        comment.is_admin_reply ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                      }`}>
                        {comment.user_name}
                      </p>
                      {comment.is_admin_reply && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/30 dark:text-emerald-400 border border-emerald-500/30">
                          ✓ Official Response
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                  {user?.id === comment.user_id && !comment.is_admin_reply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 h-auto p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className={`text-sm mt-2 break-words leading-relaxed ${
                  comment.is_admin_reply 
                    ? 'text-emerald-700 dark:text-emerald-300' 
                    : 'text-foreground hover:text-primary/80 transition-colors'
                }`}>
                  {comment.comment_text || comment.reply_text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackComments;
