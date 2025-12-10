import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthUser, signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  LogOut, 
  Search,
  Calendar,
  Target,
  TrendingUp,
  User
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
}

const StudentDashboard = ({ user }: StudentDashboardProps) => {
  const [examLink, setExamLink] = useState("");
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exams Taken</p>
              <p className="text-2xl font-bold text-foreground">{attempts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-foreground">{getAverageScore()}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-2xl font-bold text-foreground">
                {attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exam History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Exam History</h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6 bg-gradient-card border-0 shadow-medium animate-pulse">
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
          <Card className="p-12 bg-gradient-card border-0 shadow-medium text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No exams taken yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by joining your first exam using the link above
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id} className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-glow transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {attempt.exam.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          (attempt.score || 0) >= 80 ? 'bg-success' :
                          (attempt.score || 0) >= 60 ? 'bg-warning' : 'bg-destructive'
                        }`}></div>
                        <p className="text-lg font-bold text-foreground">
                          {attempt.score}%
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/exam-result/${attempt.id}`)}
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