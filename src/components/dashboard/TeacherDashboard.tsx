import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealTimeFlaggedAttempts, useRealTimeSecurityEvents } from "@/hooks/useRealTimeExam";
import { AuthUser, signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardStatsGrid, { createExamStats } from "./DashboardStatsGrid";
import {
  Plus,
  Book,
  Users,
  BarChart3,
  LogOut,
  Share2,
  User,
  HelpCircle,
  Calendar,
  MessageSquare
} from "lucide-react";

interface TeacherDashboardProps {
  user: AuthUser;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  language: string;
  created_at: string;
  is_published: boolean;
  share_link: string | null;
  _count?: {
    attempts: number;
    questions: number;
  };
}

const TeacherDashboard = ({ user }: TeacherDashboardProps) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedAttempts, setFlaggedAttempts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchExams();
    fetchFlaggedAttempts();
  }, []);

  // Memoized handler for real-time flagged attempts to prevent unsubscribe/resubscribe on every render
  const handleNewFlaggedAttempt = useCallback((newFlaggedAttempt: any) => {
    // Add new flagged attempt to the top of the list
    setFlaggedAttempts(prev => {
      // Check if already exists
      if (prev.some(a => a.id === newFlaggedAttempt.id)) {
        // Update existing
        return prev.map(a => a.id === newFlaggedAttempt.id ? newFlaggedAttempt : a);
      }
      // Add new one at the top
      return [newFlaggedAttempt, ...prev];
    });

    // Show toast notification
    toast({
      title: '🚨 New Flagged Attempt',
      description: `A new suspicious attempt has been detected and flagged for review.`,
      variant: 'destructive'
    });
  }, [toast]);

  // Subscribe to real-time flagged attempts with memoized handler
  useRealTimeFlaggedAttempts(handleNewFlaggedAttempt);

  const fetchExams = async () => {
    try {
      // First get the exams
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;

      if (!examsData || examsData.length === 0) {
        setExams([]);
        return;
      }

      // Get exam IDs for batch queries
      const examIds = examsData.map(exam => exam.id);

      // Get questions count for each exam
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('exam_id')
        .in('exam_id', examIds);

      if (questionsError) throw questionsError;

      // Get exam attempts count
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('exam_id')
        .in('exam_id', examIds);

      if (attemptsError) throw attemptsError;

      // Process data to add counts
      const examsWithCounts = examsData.map(exam => {
        const examQuestions = questionsData?.filter(q => q.exam_id === exam.id) || [];
        const examAttempts = attemptsData?.filter(a => a.exam_id === exam.id) || [];
        
        return {
          ...exam,
          _count: {
            questions: examQuestions.length,
            attempts: examAttempts.length
          }
        };
      });

      setExams(examsWithCounts);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        title: "Error",
        description: "Failed to load exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedAttempts = async () => {
    try {
      // Get all exams for this teacher
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('id')
        .eq('teacher_id', user.id);

      if (examsError) throw examsError;
      if (!examsData || examsData.length === 0) return;

      const examIds = examsData.map(e => e.id);

      // Get flagged attempts for these exams (using profiles instead of auth.users for RLS safety)
      const { data: flaggedData, error: flaggedError } = await supabase
        .from('exam_flagged_attempts')
        .select(`
          *,
          exam:exams(id, title),
          profile:profiles(email)
        `)
        .in('exam_id', examIds)
        .eq('reviewed', false)
        .order('created_at', { ascending: false });

      if (flaggedError) throw flaggedError;
      setFlaggedAttempts(flaggedData || []);
    } catch (error) {
      console.error('Error fetching flagged attempts:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = (shareLink: string) => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Success",
      description: "Exam code copied to clipboard!",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.profile?.full_name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your exams and track student progress
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            size="lg"
          >
            <User className="w-5 h-5 mr-2" />
            Profile
          </Button>
          <Button
            onClick={() => window.open('https://t.me/+P-Vu76yybMA5MjBk', '_blank')}
            variant="outline"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Join Community
          </Button>
          <Button
            onClick={() => navigate('/create-exam')}
            variant="hero"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Exam
          </Button>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Responsive Stats Grid */}
      <DashboardStatsGrid
        stats={createExamStats({
          totalExams: exams.length,
          publishedExams: exams.filter(exam => exam.is_published).length,
          draftExams: exams.filter(exam => !exam.is_published).length,
          totalAttempts: exams.reduce((acc, exam) => acc + (exam._count?.attempts || 0), 0),
          averageScore: exams.length > 0 ? Math.round(
            exams.reduce((acc, exam) => {
              // This would need to be calculated from actual scores
              return acc + (exam._count?.attempts ? 75 : 0); // Placeholder calculation
            }, 0) / exams.length
          ) : undefined
        })}
        layout="two-up-one-down"
        className="mb-8"
      />

      {/* Flagged Attempts Section */}
      {flaggedAttempts.length > 0 && (
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="material-icons-round text-red-500">warning</span>
              Flagged Attempts ({flaggedAttempts.length})
            </h2>
            <span className="text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full">
              Requires Review
            </span>
          </div>

          <div className="space-y-3">
            {flaggedAttempts.slice(0, 5).map((attempt) => (
              <Card key={attempt.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-red-900 dark:text-red-200">
                        {attempt.exam?.title}
                      </h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        attempt.risk_level === 'high' 
                          ? 'bg-red-600 text-white'
                          : 'bg-orange-600 text-white'
                      }`}>
                        {attempt.risk_level.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      {attempt.analysis?.reason || attempt.analysis?.message || "Suspicious behavior detected"}
                    </p>
                    {attempt.flags && attempt.flags.length > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400">
                        <p className="font-medium mb-1">Violations:</p>
                        <ul className="ml-4 space-y-0.5">
                          {attempt.flags.slice(0, 3).map((flag: any, idx: number) => (
                            <li key={idx}>• {flag.type?.replace(/-/g, ' ').toUpperCase()}</li>
                          ))}
                          {attempt.flags.length > 3 && <li>+{attempt.flags.length - 3} more</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => navigate(`/exam-results/${attempt.attempt_id}`)}
                    variant="outline"
                    size="sm"
                    className="border-red-300 dark:border-red-700"
                  >
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          {flaggedAttempts.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                {flaggedAttempts.length - 5} more flagged attempts pending review
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exams List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Exams</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 bg-gradient-card border-0 shadow-strong animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <Card className="p-12 bg-gradient-card border-0 shadow-strong text-center">
            <Book className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No exams yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first exam to get started with engaging assessments
            </p>
            <Button
              onClick={() => navigate('/create-exam')}
              variant="hero"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Exam
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card
                key={exam.id}
                className={cn(
                  "p-6 bg-gradient-card border-0 shadow-strong",
                  "hover:shadow-glow transition-all duration-300 group",
                  // Always show hover effects on mobile for better card distinction
                  isMobile && "shadow-glow"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.is_published
                      ? 'bg-success/10 text-success'
                      : 'bg-muted/10 text-muted-foreground'
                  }`}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      Questions
                    </span>
                    <span className="font-medium text-foreground">{exam._count?.questions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Attempts
                    </span>
                    <span className="font-medium text-foreground">{exam._count?.attempts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      Language
                    </span>
                    <span className="font-medium text-foreground capitalize">{exam.language}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Created
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/exam-analytics/${exam.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    onClick={() => copyShareLink(exam.share_link!)}
                    variant="outline"
                    size="sm"
                    disabled={!exam.share_link}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;