import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowUp, MessageCircle, ChevronDown, ChevronUp, Sparkles, Bug, Zap, TrendingUp, MessageSquare, AlertCircle, CheckCircle2, Clock, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeedbackComments from '@/components/FeedbackComments';
import { PremiumUpvoteIcon } from '@/components/PremiumUpvoteIcon';

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

interface FeedbackPostCardProps {
  feedback: Feedback;
  onUpvote: () => void;
  onRefresh: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    case 'in-review':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    case 'planned':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
    case 'in-progress':
      return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
    case 'completed':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    default:
      return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'bug':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
    case 'feature':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    case 'improvement':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    default:
      return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
  }
};

const FeedbackPostCard: React.FC<FeedbackPostCardProps> = ({ feedback, onUpvote, onRefresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to vote',
        variant: 'destructive',
      });
      return;
    }

    setIsVoting(true);
    try {
      await onUpvote();
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const userInitials = feedback.user_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-xl border border-border/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30">
        <div className="p-6">
          <div className="flex gap-4">
            {/* Left Side - Vote Button */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                disabled={isVoting}
                className={`flex flex-col gap-1 h-auto py-2 px-2 rounded-lg transition-all duration-300 ${
                  feedback.has_voted
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800'
                    : 'text-muted-foreground hover:bg-accent/10'
                }`}
              >
                <PremiumUpvoteIcon className="w-5 h-5" filled={feedback.has_voted} />
                <span className="text-xs font-bold">{feedback.upvote_count}</span>
              </Button>
            </div>

            {/* Center - Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {feedback.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition-all duration-300 flex items-center gap-1 ${getCategoryColor(
                        feedback.category
                      )}`}
                    >
                      {getCategoryIcon(feedback.category)} {feedback.category.charAt(0).toUpperCase() +
                        feedback.category.slice(1)}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full transition-all duration-300 flex items-center gap-1 ${getStatusColor(
                        feedback.status
                      )}`}
                    >
                      {getStatusIcon(feedback.status)} {feedback.status
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                {feedback.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-7 h-7 border border-primary/10">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {feedback.user_name}
                    </span>
                    {' '} • <span className="hover:text-primary transition-colors">{formatDate(feedback.created_at)}</span>
                  </div>
                </div>

                {/* Comments Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className={`text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-300 ${
                    showComments ? 'bg-accent/10 text-primary' : ''
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-semibold">{feedback.comment_count}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section - Smooth Animation */}
        {showComments && (
          <div className="border-t border-border/50 bg-background/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <FeedbackComments
              feedbackId={feedback.id}
              onCommentAdded={onRefresh}
            />
          </div>
        )}
      </Card>
    </>
  );
};

function getCategoryIcon(category: string) {
  switch (category) {
    case 'bug':
      return <Bug className="w-4 h-4" />;
    case 'feature':
      return <Zap className="w-4 h-4" />;
    case 'improvement':
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'in-review':
      return <AlertCircle className="w-4 h-4" />;
    case 'planned':
      return <Sparkles className="w-4 h-4" />;
    case 'in-progress':
      return <Play className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
}

export default FeedbackPostCard;
