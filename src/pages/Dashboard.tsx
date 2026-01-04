import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Settings, Trophy, FileText, CheckCircle, Award, Clock, Search, Filter, Plus, Activity, User, Book, LogOut, BarChart3, Share2, HelpCircle, MessageSquare, Calendar, Target, TrendingUp, AlertCircle, XCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useRealTimeFlaggedAttempts, useRealTimeSecurityEvents } from "@/hooks/useRealTimeExam";
import { AuthUser, signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardStatsGrid, { createExamStats, createStudentStats } from "@/components/dashboard/DashboardStatsGrid";

const Dashboard = () => {
  const { user, loading, isAuthenticated, isTeacher, needsOnboarding } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Preserved existing state for both teacher and student functionality
  const [exams, setExams] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [flaggedAttempts, setFlaggedAttempts] = useState<any[]>([]);
  const [examLink, setExamLink] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // Preserved existing useEffect hooks
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

  useEffect(() => {
    if (isAuthenticated && user) {
      if (isTeacher) {
        fetchExams();
        fetchFlaggedAttempts();
      } else {
        fetchAttempts();
      }
    }
  }, [isAuthenticated, user, isTeacher]);

  // Memoized handler for real-time flagged attempts (preserved from TeacherDashboard)
  const handleNewFlaggedAttempt = useCallback((newFlaggedAttempt: any) => {
    setFlaggedAttempts(prev => {
      if (prev.some(a => a.id === newFlaggedAttempt.id)) {
        return prev.map(a => a.id === newFlaggedAttempt.id ? newFlaggedAttempt : a);
      }
      return [newFlaggedAttempt, ...prev];
    });

    toast({
      title: '🚨 New Flagged Attempt',
      description: `A new suspicious attempt has been detected and flagged for review.`,
      variant: 'destructive'
    });
  }, [toast]);

  // Subscribe to real-time flagged attempts (preserved from TeacherDashboard)
  useRealTimeFlaggedAttempts(handleNewFlaggedAttempt);

  // Preserved existing data fetching functions
  const fetchExams = async () => {
    try {
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('teacher_id', user!.id)
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;

      if (!examsData || examsData.length === 0) {
        setExams([]);
        return;
      }

      const examIds = examsData.map(exam => exam.id);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('exam_id')
        .in('exam_id', examIds);

      if (questionsError) throw questionsError;

      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('exam_id')
        .in('exam_id', examIds);

      if (attemptsError) throw attemptsError;

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
      setLoadingData(false);
    }
  };

  const fetchFlaggedAttempts = async () => {
    try {
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('id')
        .eq('teacher_id', user!.id);

      if (examsError) throw examsError;
      if (!examsData || examsData.length === 0) return;

      const examIds = examsData.map(e => e.id);

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

  const fetchAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams(id, title, language)
        `)
        .eq('student_id', user!.id)
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
      setLoadingData(false);
    }
  };

  // Preserved existing event handlers
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

  const joinExam = () => {
    if (!examLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exam link",
        variant: "destructive",
      });
      return;
    }

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

  // Sample data for charts (mapped from real data where possible)
  const chartData = [
    { name: 'Mon', score: isTeacher ? 75 : (attempts[0]?.score || 45), classAvg: 40 },
    { name: 'Tue', score: isTeacher ? 82 : (attempts[1]?.score || 52), classAvg: 45 },
    { name: 'Wed', score: isTeacher ? 68 : (attempts[2]?.score || 38), classAvg: 42 },
    { name: 'Thu', score: isTeacher ? 90 : (attempts[3]?.score || 65), classAvg: 40 },
    { name: 'Fri', score: isTeacher ? 78 : (attempts[4]?.score || 48), classAvg: 48 },
    { name: 'Sat', score: isTeacher ? 95 : (attempts[5]?.score || 85), classAvg: 50 },
    { name: 'Sun', score: isTeacher ? 88 : (attempts[6]?.score || 92), classAvg: 52 },
  ];

  // Computed stats mapped to reference UI structure
  const stats = isTeacher ? [
    { label: "Total Students", value: "1,240", icon: User, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Exams", value: exams.length.toString(), icon: Book, color: "text-green-500", bg: "bg-green-50" },
    { label: "Published", value: exams.filter(exam => exam.is_published).length.toString(), icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Attempts", value: exams.reduce((acc, exam) => acc + (exam._count?.attempts || 0), 0).toString(), icon: Target, color: "text-yellow-500", bg: "bg-yellow-50" }
  ] : [
    { label: "Active Exams", value: attempts.length.toString(), icon: Book, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Completed", value: `${getAverageScore()}%`, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { label: "Best Score", value: attempts.length > 0 ? `${Math.max(...attempts.map(a => a.score || 0))}%` : "0%", icon: Award, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Study Time", value: "24h", icon: Clock, color: "text-pink-500", bg: "bg-pink-50" }
  ];

  // Recent activity data mapped from real data
  const recentActivity = isTeacher 
    ? exams.slice(0, 3).map(exam => ({
        title: exam.title,
        date: new Date(exam.created_at).toLocaleDateString(),
        score: exam._count?.attempts || 0,
        status: exam.is_published ? "Published" : "Draft"
      }))
    : attempts.slice(0, 3).map(attempt => ({
        title: attempt.exam.title,
        date: new Date(attempt.start_time).toLocaleDateString(),
        score: attempt.score || 0,
        status: (attempt.score || 0) >= 80 ? "Distinction" : (attempt.score || 0) >= 60 ? "Pass" : "Failed"
      }));

  if (loading || loadingData) {
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
    <div className="flex-1 flex flex-col p-4 md:p-10 max-w-7xl mx-auto w-full space-y-10 pb-24 md:pb-10">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-1">Academic Pulse</h1>
          <p className="text-gray-500 font-medium">
            Welcome back, {user.profile?.full_name}! 
            Monitoring {isTeacher ? 'class performance' : 'your progress'} in real-time.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative group flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#7C3AED] transition-colors" size={18} />
             <input 
               type="text" 
               placeholder="Search assessments..." 
               className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] outline-none transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          {isTeacher && (
            <button 
              onClick={() => navigate('/create-exam')}
              className="bg-[#7C3AED] text-white p-3 md:px-6 md:py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl shadow-[#7C3AED]/20 hover:scale-[1.05] transition-all"
            >
              <Plus size={20} />
              <span className="hidden md:block">Create New</span>
            </button>
          )}
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="lg"
            className="hidden md:flex"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Performance Trend Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} className="text-[#7C3AED]" />
          </div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black text-gray-900">Performance Trend</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Track your performance progression over time</p>
            </div>
            <div className="flex space-x-2">
               <button className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] transition-all">Last 7 Days</button>
               <button className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] transition-all">Last Month</button>
            </div>
          </div>

          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/>
                    <stop offset="50%" stopColor="#EAB308" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={1}/>
                  </linearGradient>
                  
                  <linearGradient id="performanceFill" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="50%" stopColor="#EAB308" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#cbd5e1'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#cbd5e1'}} />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '5px', color: '#1e293b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="url(#performanceGradient)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#performanceFill)" 
                  dot={{ r: 6, fill: 'url(#performanceGradient)', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 4 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center relative z-10">
            <p className="text-sm text-gray-600">
              {chartData.length >= 2 && (
                <>
                  {chartData[chartData.length - 1].score > chartData[0].score ? (
                    <span className="text-green-600 font-medium">
                      ↗ Improved by {chartData[chartData.length - 1].score - chartData[0].score} points
                    </span>
                  ) : chartData[chartData.length - 1].score < chartData[0].score ? (
                    <span className="text-red-600 font-medium">
                      ↘ Declined by {chartData[0].score - chartData[chartData.length - 1].score} points
                    </span>
                  ) : (
                    <span className="text-blue-600 font-medium">
                      → Consistent performance
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Insight Panel */}
        <div className="bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-10 -translate-y-10"></div>
           <div className="relative z-10">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
               <Trophy size={24} />
             </div>
             <h4 className="text-2xl font-black mb-2">Achievement Unlocked!</h4>
             <p className="text-white/70 font-medium text-sm leading-relaxed mb-8">
               {isTeacher 
                ? `${flaggedAttempts.length} students have been flagged for review today.` 
                : "You've maintained a 90%+ score for 3 weeks straight. Keep it up!"}
             </p>
           </div>
           
           <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#7C3AED] bg-indigo-200"></div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">+{recentActivity.length} more events</span>
           </div>
        </div>
      </section>

      {/* Interactive Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 p-6 rounded-[2rem] flex flex-col items-center text-center group hover:scale-[1.05] transition-all cursor-default shadow-sm hover:shadow-md">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <span className="text-2xl font-black text-gray-900 leading-none mb-1">{stat.value}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Recently Viewed / Action List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">Recent Activity</h3>
          <button className="text-[#7C3AED] text-sm font-black hover:underline">View History</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentActivity.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 p-5 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-lg transition-all group border-l-4 border-l-[#7C3AED]">
              <div>
                <h5 className="font-bold text-gray-900 group-hover:text-[#7C3AED] transition-colors">{item.title}</h5>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{item.date}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${item.score >= 50 ? 'text-green-500' : 'text-red-500'}`}>{item.score}%</span>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Exam Section for Students */}
      {!isTeacher && (
        <section className="space-y-6">
          <Card className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join an Exam</h2>
              <p className="text-gray-500">Enter the exam link provided by your teacher</p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <Input
                type="text"
                placeholder="Paste exam link here..."
                value={examLink}
                onChange={(e) => setExamLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinExam()}
                className="rounded-2xl border-gray-100 focus:border-[#7C3AED] focus:ring-[#7C3AED]/10"
              />
              <Button
                onClick={joinExam}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl font-bold"
                size="lg"
              >
                <Book className="w-5 h-5 mr-2" />
                Join Exam
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* Flagged Attempts Section for Teachers */}
      {isTeacher && flaggedAttempts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900">Flagged Attempts ({flaggedAttempts.length})</h3>
            <span className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-full">
              Requires Review
            </span>
          </div>

          <div className="space-y-3">
            {flaggedAttempts.slice(0, 3).map((attempt) => (
              <Card key={attempt.id} className="p-4 bg-red-50 border border-red-200 shadow-none">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-red-900">
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
                    <p className="text-sm text-red-700 mb-2">
                      {attempt.analysis?.reason || attempt.analysis?.message || "Suspicious behavior detected"}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/exam-results/${attempt.attempt_id}`)}
                    variant="outline"
                    size="sm"
                    className="border-red-300"
                  >
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;