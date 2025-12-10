import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, loading, isAuthenticated, isTeacher, needsOnboarding } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated && needsOnboarding) {
      navigate('/teacher-onboarding');
    }
  }, [loading, isAuthenticated, needsOnboarding, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 bg-card/95 backdrop-blur-sm border-0 shadow-strong">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {isTeacher ? <TeacherDashboard user={user} /> : <StudentDashboard user={user} />}
    </div>
  );
};

export default Dashboard;