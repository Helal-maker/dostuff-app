import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRealTimeExamAttempts } from "@/hooks/useRealTimeExam";
import { AuthUser, signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardStatsGrid, { createStudentStats } from "./DashboardStatsGrid";
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
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface StudentDashboardProps {
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
  is_terminated?: boolean;
  termination_reason?: string;
  failure_reason?: string;
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const [examLink, setExamLink] = useState("");
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAttempts();
  }, []);

  // Subscribe to real-time updates
  useRealTimeExamAttempts((updatedAttempt) => {
    // Update attempts list when an attempt is updated
    setAttempts(prev => {
      const index = prev.findIndex(a => a.id === updatedAttempt.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...updatedAttempt };
        return updated;
      }
      return prev;
    });
  }, { student_id: user.id });

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

  const joinExam = () => {
    if (!examLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exam link",
        variant: "destructive",
      });
      return;
    }

    // Extract share link from URL
    let shareLink = examLink.trim();
    if (shareLink.includes('/exam/')) {
      shareLink = shareLink.split('/exam/')[1];
    }

    navigate(`/exam/${shareLink}`);
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

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.profile?.full_name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Join exams and track your progress
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
            onClick={handleSignOut}
            variant="outline"
            size="lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Join Exam Section */}
      <Card className="p-8 bg-gradient-card border-0 shadow-strong mb-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Join an Exam</h2>
          <p className="text-muted-foreground">Enter the exam link provided by your teacher</p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-link">Exam Link</Label>
            <Input
              id="exam-link"
              type="text"
              placeholder="Paste exam link here..."
              value={examLink}
              onChange={(e) => setExamLink(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && joinExam()}
            />
          </div>
          <Button
            onClick={joinExam}
            variant="hero"
            size="lg"
            className="w-full"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Join Exam
          </Button>
        </div>
      </Card>

      {/* Responsive Stats Grid */}
      <DashboardStatsGrid
        stats={createStudentStats({
          examsTaken: attempts.length,
          averageScore: getAverageScore(),
          bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0,
          currentStreak: 0, // This would need to be calculated from attempt dates
          totalTimeSpent: "0h 0m" // This would need to be calculated from actual time data
        })}
        layout="two-up-one-down"
        className="mb-8"
      />

      {/* Exam History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Exam History</h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6 bg-gradient-card border-0 shadow-strong animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <Card className="p-12 bg-gradient-card border-0 shadow-strong text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No exams taken yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by joining your first exam using the link above
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card
                key={attempt.id}
                className={cn(
                  "p-6 bg-gradient-card border-0 shadow-strong",
                  "hover:shadow-glow transition-all duration-300",
                  // Always show hover effects on mobile for better card distinction
                  isMobile && "shadow-glow",
                  attempt.is_terminated && "border-l-4 border-red-500"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {attempt.exam.title}
                      </h3>
                      {/* Status icon based on score or termination */}
                      <div className="flex items-center gap-1">
                        {attempt.is_terminated ? (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        ) : (attempt.score || 0) >= 80 ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (attempt.score || 0) >= 60 ? (
                          <Target className="w-4 h-4 text-warning" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(attempt.start_time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getTimeTaken(attempt.start_time, attempt.end_time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {attempt.exam.language}
                      </div>
                    </div>

                    {/* Termination Status */}
                    {attempt.is_terminated && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Exam Terminated
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300">
                          {attempt.termination_reason || "Terminated due to rule violations"}
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1 italic">
                          Under review by teacher
                        </p>
                      </div>
                    )}

                    {/* Failure Reason - Wrong Answers */}
                    {!attempt.is_terminated && attempt.failure_reason === 'wrong_answers' && !attempt.passed && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                          Score Below Passing Threshold
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                          Review and retake to improve your score
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          attempt.is_terminated ? 'bg-destructive' :
                          (attempt.score || 0) >= 80 ? 'bg-success' :
                          (attempt.score || 0) >= 60 ? 'bg-warning' : 'bg-destructive'
                        }`}></div>
                        <p className="text-lg font-bold text-foreground">
                          {attempt.is_terminated ? '0' : attempt.score}%
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/exam-results/${attempt.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;