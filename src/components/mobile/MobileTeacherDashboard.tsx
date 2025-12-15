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
import { MobileButton, MobileFormCard } from "./MobileForms";
import {
  Plus,
  Book,
  Users,
  LogOut,
  Share2,
  User,
  Settings,
  Calendar,
  Target,
  Edit,
  MoreVertical
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileTeacherDashboardProps {
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

export const MobileTeacherDashboard: React.FC<MobileTeacherDashboardProps> = ({ user }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const copyShareLink = (shareLink: string) => {
    const fullLink = `${window.location.origin}/exam/${shareLink}`;
    navigator.clipboard.writeText(fullLink);
    toast({
      title: "Success",
      description: "Exam link copied to clipboard!",
    });
  };

  const getTotalAttempts = () => {
    return exams.reduce((acc, exam) => acc + (exam._count?.attempts || 0), 0);
  };

  const getPublishedExamsCount = () => {
    return exams.filter(exam => exam.is_published).length;
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
            Manage your exams and track progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <MobileStatCard
            title="Total Exams"
            value={exams.length}
            icon={<Book className="w-6 h-6 text-primary" />}
          />
          <MobileStatCard
            title="Attempts"
            value={getTotalAttempts()}
            icon={<Users className="w-6 h-6 text-success" />}
          />
          <MobileStatCard
            title="Published"
            value={getPublishedExamsCount()}
            icon={<Target className="w-6 h-6 text-warning" />}
          />
        </div>

        {/* Quick Actions Removed as per user request */}

        {/* Recent Exams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Exams</h2>
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
          ) : exams.length === 0 ? (
            <MobileCard className="text-center py-8">
              <Book className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No exams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first exam to get started
              </p>
              <MobileButton
                onClick={() => navigate('/create-exam')}
                variant="hero"
                size="full"
                leftIcon={<Plus className="w-5 h-5" />}
              >
                Create Your First Exam
              </MobileButton>
            </MobileCard>
          ) : (
            <div className="space-y-3">
              {exams.slice(0, 4).map((exam) => (
                <MobileExamCard
                  key={exam.id}
                  title={exam.title}
                  description={exam.description || undefined}
                  status={exam.is_published ? 'published' : 'draft'}
                  date={exam.created_at}
                  language={exam.language}
                  attempts={exam._count?.attempts || 0}
                  questions={exam._count?.questions || 0}
                  onClick={() => {
                    if (exam._count?.attempts > 0) {
                      navigate(`/exam-analytics/${exam.id}`);
                    }
                  }}
                  onActionClick={() => {
                    if (exam.share_link) {
                      copyShareLink(exam.share_link);
                    }
                  }}
                  actionLabel="Share"
                />
              ))}
            </div>
          )}
        </div>

        {/* Performance Overview section removed as per user request */}
      </div>
      
      <MobileBottomNav userRole="teacher" />
    </MobileLayout>
  );
};

export default MobileTeacherDashboard;