import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trophy,
  TrendingUp,
  Loader2
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  pass_threshold: number;
}

interface StudentAttempt {
  id: string;
  student_id: string;
  score: number | null;
  passed: boolean | null;
  is_completed: boolean;
  start_time: string;
  end_time: string | null;
  student_email?: string;
  student_name?: string;
}

const ExamAnalytics = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, isTeacher } = useAuth();

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isTeacher) {
      navigate('/dashboard');
      return;
    }
    
    loadAnalytics();
  }, [examId, user, authLoading, isTeacher]);

  const loadAnalytics = async () => {
    try {
      // Get exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .eq('teacher_id', user!.id)
        .single();

      if (examError) {
        toast({
          title: "Error",
          description: "Exam not found or you don't have access",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      // Get all attempts for this exam
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .order('created_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      // Get student profiles for names
      const studentIds = [...new Set((attemptsData || []).map(a => a.student_id))];
      
      let profilesMap: { [key: string]: { full_name: string | null } } = {};
      
      if (studentIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', studentIds);
        
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.user_id] = { full_name: profile.full_name };
          });
        }
      }

      // Merge student names into attempts
      const attemptsWithNames = (attemptsData || []).map(attempt => ({
        ...attempt,
        student_name: profilesMap[attempt.student_id]?.full_name || 'Unknown Student'
      }));

      setExam(examData as Exam);
      setAttempts(attemptsWithNames as StudentAttempt[]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeTaken = (start: string, end: string | null) => {
    if (!end) return "In progress";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const completedAttempts = attempts.filter(a => a.is_completed);
  const passedCount = completedAttempts.filter(a => a.passed).length;
  const failedCount = completedAttempts.filter(a => !a.passed).length;
  const avgScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
    : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero text-primary-foreground py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="text-primary-foreground/80 mt-2">Exam Analytics & Student Performance</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold text-foreground">{attempts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-foreground">{passedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-foreground">{failedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-foreground">{avgScore.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Student Results Table */}
        <Card className="bg-gradient-card border-0 shadow-medium overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Student Results
            </h2>
          </div>

          {attempts.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No attempts yet</h3>
              <p className="text-muted-foreground">
                Share your exam link with students to start receiving results
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Student Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Time Taken</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">
                          {attempt.student_name || 'Unknown Student'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {attempt.is_completed ? (
                          <span className={`font-semibold ${
                            (attempt.score || 0) >= 50 ? 'text-success' : 'text-destructive'
                          }`}>
                            {attempt.score?.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!attempt.is_completed ? (
                          <Badge variant="secondary" className="bg-warning/10 text-warning border-0">
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                          </Badge>
                        ) : attempt.passed ? (
                          <Badge variant="secondary" className="bg-success/10 text-success border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Passed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {getTimeTaken(attempt.start_time, attempt.end_time)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(attempt.start_time).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ExamAnalytics;
