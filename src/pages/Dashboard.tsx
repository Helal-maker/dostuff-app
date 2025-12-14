import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import MobileTeacherDashboard from "@/components/mobile/MobileTeacherDashboard";
import MobileStudentDashboard from "@/components/mobile/MobileStudentDashboard";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user, loading, isAuthenticated, isTeacher, needsOnboarding } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  // Render mobile or desktop dashboard based on device type
  const renderDashboard = () => {
    if (isMobile) {
      return isTeacher ? (
        <MobileTeacherDashboard user={user} />
      ) : (
        <MobileStudentDashboard user={user} />
      );
    }
    
    return isTeacher ? (
      <TeacherDashboard user={user} />
    ) : (
      <StudentDashboard user={user} />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;