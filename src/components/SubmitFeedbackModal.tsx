import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Send, AlertCircle } from 'lucide-react';

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user, isTeacher } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to submit feedback',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('feedbacks').insert({
        user_id: user.id,
        user_name: user.user_metadata?.full_name || 'Anonymous',
        title: title.trim(),
        description: description.trim(),
        category,
        role: isTeacher ? 'teacher' : 'student',
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Thank you! Your feedback has been submitted.',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('general');
      onClose();
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg border-border/50 bg-card/95 backdrop-blur-xl shadow-glow">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Share Your Feedback
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base mt-2">
            Help us build something amazing. Your ideas matter!
          </DialogDescription>
        </DialogHeader>

        {!user && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 animate-pulse">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              You need to be signed in to submit feedback.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-foreground">
              Title *
            </label>
            <Input
              id="title"
              placeholder="What's your feedback about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!user || loading}
              className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-semibold text-foreground">
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!user || loading}
              className="w-full px-3 py-2.5 bg-background/50 border border-border/50 rounded-lg text-sm font-medium hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="bug">🐛 Bug Report</option>
              <option value="feature">✨ Feature Request</option>
              <option value="improvement">📈 Improvement</option>
              <option value="general">💬 General Feedback</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-foreground">
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Tell us more about your feedback..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              disabled={!user || loading}
              className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-colors resize-none"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!user || loading}
              className="gap-2 shadow-soft hover:shadow-glow transition-all duration-300"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitFeedbackModal;
