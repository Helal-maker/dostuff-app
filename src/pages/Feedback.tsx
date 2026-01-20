import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageSquare, ThumbsUp, Plus, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SubmitFeedbackModal from '@/components/SubmitFeedbackModal';
import FeedbackPostCard from '@/components/FeedbackPostCard';

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
  has_voted?: boolean;
}

const FeedbackBoard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'trending' | 'newest'>('trending');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('feedbacks')
        .select('*');

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const orderColumn = sortBy === 'trending' ? 'upvote_count' : 'created_at';
      query = query.order(orderColumn, { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Fetch vote status for current user
      if (user && data) {
        const { data: votes } = await supabase
          .from('feedback_votes')
          .select('feedback_id')
          .eq('user_id', user.id);

        const votedIds = votes?.map(v => v.feedback_id) || [];
        const feedbacksWithVotes = data.map(f => ({
          ...f,
          has_voted: votedIds.includes(f.id),
        }));
        setFeedbacks(feedbacksWithVotes);
      } else {
        setFeedbacks(data || []);
      }
    } catch (error) {
      console.error('Error loading feedbacks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feedback',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [sortBy, filterStatus, filterCategory, user]);

  const handleUpvote = async (feedbackId: string, hasVoted: boolean) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to vote',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (hasVoted) {
        const { error } = await supabase
          .from('feedback_votes')
          .delete()
          .eq('feedback_id', feedbackId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Get current count and decrement
        const { data: feedback } = await supabase
          .from('feedbacks')
          .select('upvote_count')
          .eq('id', feedbackId)
          .single();

        await supabase
          .from('feedbacks')
          .update({ upvote_count: Math.max(0, (feedback?.upvote_count || 1) - 1) })
          .eq('id', feedbackId);
      } else {
        const { error } = await supabase
          .from('feedback_votes')
          .insert({ feedback_id: feedbackId, user_id: user.id });

        if (error) throw error;

        // Get current count and increment
        const { data: feedback } = await supabase
          .from('feedbacks')
          .select('upvote_count')
          .eq('id', feedbackId)
          .single();

        await supabase
          .from('feedbacks')
          .update({ upvote_count: (feedback?.upvote_count || 0) + 1 })
          .eq('id', feedbackId);
      }

      await loadFeedbacks();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vote',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden pt-20">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary rounded-full blur-3xl"></div>
      </div>

      <SubmitFeedbackModal
        isOpen={isSubmitOpen}
        onClose={() => {
          setIsSubmitOpen(false);
          loadFeedbacks();
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header - Modern Style */}
          <div className="mb-16 text-center lg:text-left animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft mb-6">
              <Sparkles className="text-primary h-5 w-5" />
              <span className="font-medium text-foreground">Community Feedback</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-foreground">Shape the </span>
              <span className="text-primary">
                Future
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-primary-foreground max-w-2xl mb-8 leading-relaxed font-medium">
              Share your ideas, report bugs, and help us build the best exam platform. Your voice matters!
            </p>

            <Button
              onClick={() => setIsSubmitOpen(true)}
              className="gap-2 text-lg px-8 py-6 shadow-soft hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Share Feedback
            </Button>
          </div>

          {/* Controls - Modern Cards */}
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/20 transition-all duration-300 animate-fade-in animation-delay-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'trending' | 'newest')}
                  className="w-full px-3 py-2.5 bg-background/80 border border-border rounded-lg text-sm font-medium hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="trending">🔥 Most Upvoted</option>
                  <option value="newest">✨ Newest</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background/80 border border-border rounded-lg text-sm font-medium hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Status</option>
                  <option value="pending">🟡 Pending</option>
                  <option value="in-review">🔵 In Review</option>
                  <option value="planned">🟣 Planned</option>
                  <option value="in-progress">🟠 In Progress</option>
                  <option value="completed">🟢 Completed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background/80 border border-border rounded-lg text-sm font-medium hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">✨ Feature Request</option>
                  <option value="improvement">📈 Improvement</option>
                  <option value="general">💬 General</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSortBy('trending');
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }}
                  className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Feedbacks List - Modern Cards with Animations */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : feedbacks.length === 0 ? (
            <Card className="text-center py-16 bg-card/50 backdrop-blur-sm border-border/50 shadow-soft">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">No feedback yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Be the first to share your ideas and help us improve!
              </p>
              <Button onClick={() => setIsSubmitOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Submit Feedback
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <div
                  key={feedback.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <FeedbackPostCard
                    feedback={feedback}
                    onUpvote={() => handleUpvote(feedback.id, feedback.has_voted || false)}
                    onRefresh={loadFeedbacks}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackBoard;
