import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Star, ArrowLeft } from 'lucide-react';

interface Feedback {
  title: string;
  message: string;
  rating: number;
}

const SettingsFeedback = () => {
  const { user, isTeacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback>({ title: '', message: '', rating: 5 });
  const [loading, setLoading] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('feedbacks')
      .insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || 'Anonymous',
        role: isTeacher ? 'teacher' : 'student',
        title: feedback.title,
        message: feedback.message,
        rating: feedback.rating,
        created_at: new Date().toISOString(),
      });

    setLoading(false);
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });
      setFeedback({ title: '', message: '', rating: 5 });
    }
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/settings')}
            className="mb-6 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              <span className="text-foreground">Share Your</span>{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Feedback
              </span>
            </h1>
            <p className="text-lg text-primary-foreground">
              Help us improve by sharing your thoughts and suggestions
            </p>
          </div>

          <Card className="bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Feedback Form</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your feedback helps us make Do Stuff better for everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <Input
                    value={feedback.title}
                    onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
                    placeholder="Brief title for your feedback"
                    required
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <Textarea
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    placeholder="Describe your feedback, suggestions, or report bugs"
                    rows={6}
                    required
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Rate the app</label>
                  <StarRating
                    rating={feedback.rating}
                    onRatingChange={(rating) => setFeedback({ ...feedback, rating })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full text-lg py-6" size="lg">
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsFeedback;