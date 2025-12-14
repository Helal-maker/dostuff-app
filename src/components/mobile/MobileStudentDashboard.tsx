import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MobileLayout } from "./MobileLayout";
import { MobileBottomNav } from "./MobileNavigation";
import { MobileCard, MobileStatCard, MobileExamCard } from "./MobileCards";
import { MobileButton, MobileSearchInput, MobileFormCard, MobileInput } from "./MobileForms";
import {
  BookOpen,
  Trophy,
  Clock,
  LogOut,
  Search,
  Calendar,
  Target,
  TrendingUp,
  User,
  Users,
  Plus,
  Play,
  BarChart3,
  Settings
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileStudentDashboardProps {
  user: AuthUser;
}

interface ExamAttempt {
  id: string;
  exam: {
    id: string;
    title: string;
    language: string;
  };
  score: number;
  total_points: number;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  passed: boolean;
}

export const MobileStudentDashboard: React.FC<MobileStudentDashboardProps> = ({ user }) => {
  const [examLink, setExamLink] = useState("");
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinExamLoading, setJoinExamLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams(id, title, language)
        `)
        .eq('student_id', user.id)
        .eq('is_completed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAttempts = data.map(attempt => ({
        ...attempt,
        exam: attempt.exams
      }));

      setAttempts(formattedAttempts);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      toast({
        title: "Error",
        description: "Failed to load exam history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Import signOut dynamically to avoid circular dependency
      const { signOut } = await import("@/lib/auth");
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

  const joinExam = async () => {
    if (!examLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exam link",
        variant: "destructive",
      });
      return;
    }

    setJoinExamLoading(true);
    
    try {
      // Extract share link from URL
      let shareLink = examLink.trim();
      if (shareLink.includes('/exam/')) {
        shareLink = shareLink.split('/exam/')[1];
      }

      navigate(`/exam/${shareLink}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join exam",
        variant: "destructive",
      });
    } finally {
      setJoinExamLoading(false);
    }
  };

  const getTimeTaken = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const getAverageScore = () => {
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
    return Math.round((total / attempts.length) * 100) / 100;
  };

  const getBestScore = () => {
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map(a => a.score || 0));
  };

  return (
    <MobileLayout 
      showBottomNav={true}
      headerTitle="Dashboard"
      headerAction={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <Settings className="w-5 h-5" />
        </Button>
      }
    >
      <div className="p-4 space-y-6">
        {/* Welcome Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {user.profile?.full_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Ready to take on new challenges?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <MobileStatCard
            title="Exams Taken"
            value={attempts.length}
            icon={<BookOpen className="w-6 h-6 text-primary" />}
          />
          <MobileStatCard
            title="Average Score"
            value={`${getAverageScore()}%`}
            icon={<Trophy className="w-6 h-6 text-success" />}
          />
        </div>

        {/* Join Exam Section */}
        <MobileFormCard
          title="Join an Exam"
          description="Enter the exam link provided by your teacher"
        >
          <div className="space-y-4">
            <MobileInput
              placeholder="Paste exam link here..."
              value={examLink}
              onChange={setExamLink}
              icon={<Search className="w-5 h-5" />}
            />
            <MobileButton
              onClick={joinExam}
              variant="hero"
              size="full"
              loading={joinExamLoading}
              leftIcon={<Play className="w-5 h-5" />}
            >
              Join Exam
            </MobileButton>
          </div>
        </MobileFormCard>

        {/* Recent Exam History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recent Exams</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              View All
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <MobileCard key={i} className="animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : attempts.length === 0 ? (
            <MobileCard className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No exams yet</h3>
              <p className="text-muted-foreground mb-4">
                Join your first exam using the link above
              </p>
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 3).map((attempt) => (
                <MobileExamCard
                  key={attempt.id}
                  title={attempt.exam.title}
                  status="published"
                  score={attempt.score}
                  date={attempt.start_time}
                  language={attempt.exam.language}
                  onClick={() => navigate(`/exam-results/${attempt.id}`)}
                  actionLabel="View"
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <MobileBottomNav userRole="student" />
    </MobileLayout>
  );
};

export default MobileStudentDashboard;