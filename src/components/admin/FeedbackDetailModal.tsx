import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, MessageSquare, Send, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

interface AdminReply {
  id: string;
  feedback_id: string;
  admin_id: string;
  admin_email: string;
  reply_text: string;
  is_html: boolean;
  created_at: string;
  updated_at: string;
}

interface FeedbackDetailModalProps {
  feedback: Feedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

/**
 * FeedbackDetailModal Component
 * Displays detailed feedback information, reply history, and admin response interface
 */
const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replies, setReplies] = useState<AdminReply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState(feedback?.status || 'pending');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState(feedback?.admin_notes || '');

  useEffect(() => {
    if (feedback && open) {
      setNewStatus(feedback.status);
      setAdminNotes(feedback.admin_notes || '');
      loadReplies();
    }
  }, [feedback, open]);

  const loadReplies = async () => {
    if (!feedback) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_replies')
        .select('*')
        .eq('feedback_id', feedback.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading replies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load replies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!feedback || !user?.email) return;

    try {
      setSubmitting(true);

      // Update feedback status
      const { error } = await supabase
        .from('feedbacks')
        .update({ status: newStatus, admin_notes: adminNotes })
        .eq('id', feedback.id);

      if (error) throw error;

      // Log to audit trail
      await supabase.from('admin_audit_log').insert([
        {
          admin_id: user.id,
          admin_email: user.email,
          action_type: 'status_update',
          feedback_id: feedback.id,
          action_details: {
            old_status: feedback.status,
            new_status: newStatus,
          },
        },
      ]);

      toast({
        title: 'Success',
        description: 'Feedback status updated successfully',
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!feedback || !user?.email || !replyText.trim()) return;

    try {
      setSubmitting(true);

      // Validate inputs
      if (replyText.length > 5000) {
        toast({
          title: 'Error',
          description: 'Reply text is too long (max 5000 characters)',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Ensure user object has id
      if (!user?.id) {
        toast({
          title: 'Error',
          description: 'User session not properly loaded. Please refresh the page.',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      // Insert reply with explicit column names
      const { data, error } = await supabase
        .from('admin_replies')
        .insert([
          {
            feedback_id: feedback.id,
            admin_id: user.id,
            admin_email: user.email,
            reply_text: replyText.trim(),
            is_html: false,
          }
        ])
        .select();

      if (error) {
        console.error('Reply insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      // Log to audit trail
      const { error: auditError } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: user.id,
          admin_email: user.email,
          action_type: 'reply_created',
          feedback_id: feedback.id,
          action_details: {
            reply_length: replyText.length,
          },
        });

      if (auditError) {
        console.error('Audit log error:', auditError);
        // Don't fail the whole operation if audit logging fails
      }

      // Reload replies
      await loadReplies();
      setReplyText('');

      // Update comment count to include both user comments and admin replies
      const { count: userCommentsCount } = await supabase
        .from('feedback_comments')
        .select('id', { count: 'exact', head: true })
        .eq('feedback_id', feedback.id);
      
      const { count: adminRepliesCount } = await supabase
        .from('admin_replies')
        .select('id', { count: 'exact', head: true })
        .eq('feedback_id', feedback.id);

      const totalCommentCount = (userCommentsCount || 0) + (adminRepliesCount || 0);
      await supabase
        .from('feedbacks')
        .update({ comment_count: totalCommentCount })
        .eq('id', feedback.id);

      if (onUpdate) onUpdate();

      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });
    } catch (error: any) {
      console.error('Error submitting reply:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send reply';
      
      if (error.message?.includes('permission denied')) {
        errorMessage = 'Permission denied. Please ensure you have admin access. Try refreshing the page.';
      } else if (error.message?.includes('foreign key constraint')) {
        errorMessage = 'Invalid feedback ID or admin ID. Please refresh the page.';
      } else if (error.message?.includes('violates unique constraint')) {
        errorMessage = 'Reply already exists. Please check existing replies.';
      } else if (error.code === 'PGRST116') {
        errorMessage = 'Access denied. Check your admin permissions.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      'in-review': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'planned': 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      'in-progress': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      'completed': 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
  };

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/80 border-blue-200/50 glass-effect-light">
        <DialogHeader>
          <DialogTitle className="text-blue-800">Feedback Details</DialogTitle>
          <DialogDescription className="text-blue-500">
            View and manage feedback response from {feedback.user_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Feedback */}
          <Card className="bg-white/60 border-blue-200/50 glass-effect">
            <CardHeader>
              <CardTitle className="text-blue-800">{feedback.title}</CardTitle>
              <CardDescription className="text-blue-500">
                Submitted {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-500">From</p>
                  <p className="text-blue-800 font-medium">{feedback.user_name}</p>
                </div>
                <div>
                  <p className="text-blue-500">Category</p>
                  <Badge className="bg-blue-100/80 text-blue-600">
                    {feedback.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-blue-500 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-blue-600" />
                    Votes
                  </p>
                  <p className="text-blue-800 font-medium">{feedback.upvote_count}</p>
                </div>
                <div>
                  <p className="text-blue-500 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Comments
                  </p>
                  <p className="text-blue-800 font-medium">{feedback.comment_count}</p>
                </div>
              </div>

              <div>
                <p className="text-blue-500 mb-2">Description</p>
                <p className="text-blue-800 bg-white p-3 rounded-md border border-blue-200/50">{feedback.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status & Admin Controls */}
          <Card className="bg-white/60 border-blue-200/50 glass-effect">
            <CardHeader>
              <CardTitle className="text-blue-800">Status & Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Status */}
                <div>
                  <p className="text-blue-500 mb-2">Current Status</p>
                  <Badge className={`text-sm font-semibold px-3 py-1 ${getStatusColor(feedback.status)}`}>
                    {feedback.status.replace('-', ' ')}
                  </Badge>
                </div>

                {/* Update Status */}
                <div>
                  <p className="text-blue-500 mb-2">Update Status</p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-white border-blue-200/50 text-blue-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200/50">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <p className="text-blue-500 mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  className="bg-white border-blue-200/50 text-blue-800 placeholder:text-blue-400"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={submitting || (newStatus === feedback.status && adminNotes === feedback.admin_notes)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Status & Notes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Replies Section */}
          <Card className="bg-white/60 border-blue-200/50 glass-effect">
            <CardHeader>
              <CardTitle className="text-blue-800">Admin Responses</CardTitle>
              <CardDescription className="text-blue-500">
                {replies.length} {replies.length === 1 ? 'response' : 'responses'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Replies */}
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              ) : replies.length === 0 ? (
                <div className="text-center py-4 text-blue-500">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-50" />
                  <p>No responses yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-white p-3 rounded-md border border-blue-200/50 space-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-emerald-600 font-semibold text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Do Stuff Team
                          </p>
                          <p className="text-blue-500 text-xs">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="text-blue-800 text-sm">{reply.reply_text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              <div className="border-t border-blue-200/50 pt-4 space-y-2">
                <p className="text-blue-500 text-sm">Send Response</p>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response as the Do Stuff Team..."
                  className="bg-white border-blue-200/50 text-blue-800 placeholder:text-blue-400"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReply}
                    disabled={submitting || !replyText.trim()}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setReplyText('')}
                    variant="outline"
                    disabled={!replyText.trim()}
                    className="border-blue-200/50 hover:bg-blue-50/50 text-blue-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Response Attribution */}
                <p className="text-blue-500 text-xs mt-2 italic">
                  Response from Do Stuff Team | {new Date().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDetailModal;
