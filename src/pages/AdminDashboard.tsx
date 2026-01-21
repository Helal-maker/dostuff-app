import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { signOut } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, BarChart3, Settings, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeedbackOverviewPanel from '@/components/admin/FeedbackOverviewPanel';
import FeedbackList from '@/components/admin/FeedbackList';
import FeedbackDetailModal from '@/components/admin/FeedbackDetailModal';

interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  upvote_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

/**
 * AdminDashboard Page
 * Main admin control hub for managing feedback system
 * Features: Overview metrics, feedback management, status updates, admin responses
 */
const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Session timeout handler (30 minutes of inactivity)
  React.useEffect(() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    const handleActivity = () => {
      setLastActivity(new Date());
    };

    const checkSessionTimeout = setInterval(() => {
      const now = new Date();
      const timeInactive = now.getTime() - lastActivity.getTime();
      const remainingTime = SESSION_TIMEOUT - timeInactive;

      if (remainingTime <= 0) {
        handleSessionTimeout();
      } else if (remainingTime <= 5 * 60 * 1000) {
        // Show warning when 5 minutes left
        setSessionTimeout(Math.floor(remainingTime / 1000));
      }
    }, 1000);

    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keypress', handleActivity);
    document.addEventListener('click', handleActivity);

    return () => {
      clearInterval(checkSessionTimeout);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keypress', handleActivity);
      document.removeEventListener('click', handleActivity);
    };
  }, [lastActivity]);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;

      toast({
        title: 'Logged Out',
        description: 'You have been signed out successfully',
      });

      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const handleSessionTimeout = async () => {
    toast({
      title: 'Session Expired',
      description: 'Your session has expired due to inactivity. Please log in again.',
      variant: 'destructive',
    });
    await handleLogout();
  };

  const refreshDashboard = () => {
    // Trigger refresh by toggling detail modal
    if (detailModalOpen) {
      setDetailModalOpen(false);
    }
    setLastActivity(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-blue-200/50 glass-effect-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-blue-100 rounded-lg transition"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-blue-600" />}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Do Stuff Admin
                </h1>
                <p className="text-sm text-blue-500">Feedback Management Hub</p>
              </div>
            </div>

            {/* Admin Info & Controls */}
            <div className="flex items-center gap-4">
              {/* Session Timeout Warning */}
              {sessionTimeout && sessionTimeout <= 300 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-100/80 border border-amber-300/50 rounded-lg glass-effect">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    {Math.floor(sessionTimeout / 60)}:{String(sessionTimeout % 60).padStart(2, '0')}
                  </span>
                </div>
              )}

              <div className="hidden sm:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-800">{user?.email}</p>
                  <p className="text-xs text-blue-500">Administrator</p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="bg-red-100/80 hover:bg-red-200/80 text-red-600 border border-red-300/50 glass-effect"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Bar */}
        <Card className="bg-emerald-100/80 border-emerald-300/50 mb-8 glass-effect">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-emerald-800">
                <span className="font-semibold">System Status:</span> Online & Ready
              </p>
              {user?.email && (
                <p className="ml-auto text-sm text-emerald-700/80">
                  Logged in as <span className="font-semibold">{user.email}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overview Panel */}
        <section className="mb-8">
          <FeedbackOverviewPanel />
        </section>

        {/* Feedback Management */}
        <section>
          <FeedbackList
            onSelectFeedback={(feedback) => {
              setSelectedFeedback(feedback);
              setDetailModalOpen(true);
            }}
          />
        </section>
      </div>

      {/* Feedback Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onUpdate={refreshDashboard}
      />

      {/* Footer */}
      <footer className="border-t border-blue-200/50 bg-white/80 mt-12 glass-effect-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-800">Do Stuff Admin Dashboard</p>
              <p className="text-xs text-blue-500 mt-1">Secure feedback management system</p>
            </div>
            <div className="flex justify-center">
              <p className="text-xs text-blue-500">
                © 2026 Do Stuff Team. All rights reserved.
              </p>
            </div>
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Settings
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
