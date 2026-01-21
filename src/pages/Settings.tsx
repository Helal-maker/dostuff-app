import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { isAuthorizedAdminEmail } from '@/lib/admin-auth';
import {
  MessageSquare,
  Globe,
  Shield,
  FileText,
  Info,
  FileEdit,
  Eye,
  Trash2,
  Send,
  Star,
  ChevronRight,
  Lock
} from 'lucide-react';

interface Feedback {
  title: string;
  message: string;
  rating: number;
}

interface ExamDraft {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const Settings = () => {
  const { user, isTeacher } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback>({ title: '', message: '', rating: 5 });
  const [language, setLanguage] = useState('en');
  const [drafts, setDrafts] = useState<ExamDraft[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrafts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('exams')
      .select('id, title, created_at, updated_at')
      .eq('teacher_id', user.id)
      .eq('is_published', false)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load exam drafts',
        variant: 'destructive',
      });
    } else {
      setDrafts(data || []);
    }
  }, [user, toast]);

  useEffect(() => {
    if (isTeacher) {
      fetchDrafts();
    }
  }, [isTeacher, fetchDrafts]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    // Assuming feedbacks table exists or will be created
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

  const handlePublishDraft = async (id: string) => {
    const { error } = await supabase
      .from('exams')
      .update({ is_published: true })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish draft',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Exam published successfully',
      });
      fetchDrafts();
    }
  };

  const handleDeleteDraft = async (id: string) => {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete draft',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Draft deleted successfully',
      });
      fetchDrafts();
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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-warning rounded-full blur-lg animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Settings</span>{" "}
            <span className="text-primary">
              Hub
            </span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 leading-relaxed max-w-2xl mx-auto text-primary-foreground">
            Customize your experience and manage your account preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Feedback Section */}
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group" onClick={() => navigate('/feedback')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">Feedback</CardTitle>
              <CardDescription className="text-muted-foreground">
                Share your thoughts and suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary font-medium">Give feedback</span>
                <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* Language Section */}
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:border-success/30 transition-all duration-300 cursor-pointer group" onClick={() => navigate('/settings/language')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">Language</CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-success font-medium">Change language</span>
                <ChevronRight className="w-5 h-5 text-success group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:border-warning/30 transition-all duration-300 cursor-pointer group" onClick={() => navigate('/privacy-policy')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-warning" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">Privacy</CardTitle>
              <CardDescription className="text-muted-foreground">
                Learn about data protection
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-warning font-medium">View policy</span>
                <ChevronRight className="w-5 h-5 text-warning group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:border-accent/30 transition-all duration-300 cursor-pointer group" onClick={() => navigate('/terms-of-service')}>
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">Terms</CardTitle>
              <CardDescription className="text-muted-foreground">
                Review service conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-accent font-medium">Read terms</span>
                <ChevronRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>



          {/* Saved Exam Drafts - Teachers Only */}
          {isTeacher && (
            <Card className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:border-success/30 transition-all duration-300 cursor-pointer group" onClick={() => navigate('/settings/drafts')}>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <FileEdit className="w-6 h-6 text-success" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Drafts</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage exam drafts
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-success font-medium">View drafts</span>
                  <ChevronRight className="w-5 h-5 text-success group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Dashboard - Authorized Users Only */}
          {user?.email && isAuthorizedAdminEmail(user.email) && (
            <Card 
              className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/50 rounded-3xl shadow-lg p-6 hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 cursor-pointer group" 
              onClick={() => navigate('/admin')}
            >
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl font-bold text-blue-300">Admin Panel</CardTitle>
                  <Badge className="bg-blue-500/30 text-blue-300 border border-blue-500/50">Admin</Badge>
                </div>
                <CardDescription className="text-blue-200/70">
                  Manage feedback and system settings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-300 font-medium">Access dashboard</span>
                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;