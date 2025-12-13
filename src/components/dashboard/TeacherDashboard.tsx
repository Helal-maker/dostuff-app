import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthUser, signOut } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Book,
  Users,
  BarChart3,
  LogOut,
  Share2,
  User
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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          questions(count),
          exam_attempts(count)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const examsWithCounts = data.map(exam => ({
        ...exam,
        _count: {
          questions: exam.questions?.[0]?.count || 0,
          attempts: exam.exam_attempts?.[0]?.count || 0
        }
      }));

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
    const fullLink = `${window.location.origin}/exam/${shareLink}`;
    navigator.clipboard.writeText(fullLink);
    toast({
      title: "Success",
      description: "Exam link copied to clipboard!",
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Exams</p>
              <p className="text-2xl font-bold text-foreground">{exams.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="text-2xl font-bold text-foreground">
                {exams.reduce((acc, exam) => acc + (exam._count?.attempts || 0), 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Published Exams</p>
              <p className="text-2xl font-bold text-foreground">
                {exams.filter(exam => exam.is_published).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exams List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Exams</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 bg-gradient-card border-0 shadow-medium animate-pulse">
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
          <Card className="p-12 bg-gradient-card border-0 shadow-medium text-center">
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
              <Card key={exam.id} className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-glow transition-all duration-300 group">
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
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium text-foreground">{exam._count?.questions || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Attempts:</span>
                    <span className="font-medium text-foreground">{exam._count?.attempts || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Language:</span>
                    <span className="font-medium text-foreground capitalize">{exam.language}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
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