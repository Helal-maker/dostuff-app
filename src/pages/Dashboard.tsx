import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Settings, Trophy, FileText, CheckCircle, Award, Clock, Search, Filter, Plus, Activity, User, Book, LogOut, BarChart3, Share2, HelpCircle, MessageSquare, Calendar, Target, TrendingUp, AlertCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useRealTimeFlaggedAttempts, useRealTimeSecurityEvents } from "@/hooks/useRealTimeExam";
import { AuthUser, signOut } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardStatsGrid, { createExamStats, createStudentStats } from "@/components/dashboard/DashboardStatsGrid";

interface AttemptData {
  id: string;
  created_at: string;
  score: number;
  exam?: { title: string };
}

// Enhanced Exam Activity Calendar Component
const ExamActivityCalendar = ({ 
  attempts, 
  isTeacher 
}: { 
  attempts: AttemptData[], 
  isTeacher: boolean 
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().split('T')[0].substring(0, 7)
  );
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; count: number; avgScore: number } | null>(null);

  // Get unique months from attempts
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    attempts.forEach(attempt => {
      const date = new Date(attempt.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    // Add current month if not present
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
    months.add(currentMonth);
    return Array.from(months).sort().reverse();
  }, [attempts]);

  // Get days data for selected month
  const monthDays = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    
    const days = [];
    const examCountsByDate = new Map<string, { count: number; scores: number[] }>();
    
    // Count attempts by date
    attempts.forEach(attempt => {
      const attemptDate = new Date(attempt.created_at);
      const attemptMonth = `${attemptDate.getFullYear()}-${String(attemptDate.getMonth() + 1).padStart(2, '0')}`;
      if (attemptMonth === selectedMonth) {
        const dateKey = attemptDate.getDate().toString();
        const existing = examCountsByDate.get(dateKey) || { count: 0, scores: [] };
        existing.count += 1;
        if (attempt.score !== null) existing.scores.push(attempt.score);
        examCountsByDate.set(dateKey, existing);
      }
    });
    
    // Calculate max count for intensity scaling
    const maxCount = Math.max(...Array.from(examCountsByDate.values()).map(v => v.count), 1);
    
    // Create day objects
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayData = examCountsByDate.get(day.toString()) || { count: 0, scores: [] };
      days.push({
        day,
        date,
        count: dayData.count,
        avgScore: dayData.scores.length > 0 
          ? Math.round(dayData.scores.reduce((a, b) => a + b, 0) / dayData.scores.length)
          : 0,
        hasActivity: dayData.count > 0,
        opacity: dayData.count > 0 ? 0.4 + (dayData.count / maxCount) * 0.6 : 0.2
      });
    }
    
    return { days, firstDayOfMonth, daysInMonth };
  }, [selectedMonth, attempts]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const [year, monthNum] = selectedMonth.split('-').map(Number);
  const currentMonthName = monthNames[monthNum - 1];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + (direction === 'next' ? 1 : -1);
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    setSelectedMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h3 className="text-xl font-black text-gray-900">{currentMonthName} {year}</h3>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
        
        {/* Month Tabs */}
        <Tabs value={selectedMonth} onValueChange={setSelectedMonth} className="w-auto">
          <TabsList className="bg-gray-50 border border-gray-200 rounded-xl p-1">
            {availableMonths.slice(0, 6).map(month => {
              const [mYear, mMonth] = month.split('-');
              return (
                <TabsTrigger 
                  key={month}
                  value={month}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                >
                  {monthNames[parseInt(mMonth) - 1].substring(0, 3)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthDays.firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {/* Month days */}
          {monthDays.days.map((dayData) => (
            <div
              key={dayData.day}
              className={`relative aspect-square rounded-lg transition-all duration-300 cursor-pointer ${
                dayData.hasActivity 
                  ? 'bg-[#10B981] shadow-md hover:shadow-lg hover:scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={{ opacity: dayData.hasActivity ? dayData.opacity : 0.3 }}
              onMouseEnter={() => setHoveredDay(dayData)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <span className="absolute bottom-1 right-2 text-[10px] font-bold text-gray-500">
                {dayData.day}
              </span>
            </div>
          ))}
        </div>

        {/* Premium Tooltip */}
        {hoveredDay && (
          <div 
            className="absolute z-50 bg-slate-900 text-white text-xs px-3 py-2.5 rounded-xl shadow-xl pointer-events-none"
            style={{ 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              minWidth: '140px'
            }}
          >
            <div className="font-semibold mb-1">
              {new Date(hoveredDay.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-slate-300">
              {hoveredDay.count > 0 
                ? `${hoveredDay.count} exam${hoveredDay.count > 1 ? 's' : ''}`
                : 'No exams'}
            </div>
            {hoveredDay.count > 0 && hoveredDay.avgScore > 0 && (
              <div className="text-slate-300 mt-0.5">
                Avg: {hoveredDay.avgScore}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100"></div>
          <div className="w-4 h-4 rounded bg-[#10B981] opacity-50"></div>
          <div className="w-4 h-4 rounded bg-[#10B981]"></div>
        </div>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">More</span>
      </div>
    </div>
  );
};

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
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Success",
      description: "Exam code copied to clipboard!",
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
  // Generate dynamic dates for the last 7 days based on current date
  const getLast7DaysData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      
      // Find matching attempt for this date
      const matchingAttempt = attempts.find(a => {
        const attemptDate = new Date(a.created_at).toISOString().split('T')[0];
        return attemptDate === dateStr;
      });
      
      data.push({
        name: dayName,
        date: dateStr,
        score: matchingAttempt?.score || 0,
        hasData: !!matchingAttempt,
        classAvg: isTeacher ? 40 + Math.floor(Math.random() * 20) : 45 + Math.floor(Math.random() * 15)
      });
    }
    
    return data;
  };

  const chartData = getLast7DaysData();

  // Computed stats mapped to reference UI structure
  const stats = isTeacher ? [
    { label: "Total Students", value: "1,240", icon: User, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Exams", value: exams.length.toString(), icon: Book, color: "text-green-500", bg: "bg-green-50" },
    { label: "Published", value: exams.filter(exam => exam.is_published).length.toString(), icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Attempts", value: exams.reduce((acc, exam) => acc + (exam._count?.attempts || 0), 0).toString(), icon: Target, color: "text-yellow-500", bg: "bg-yellow-50" }
  ] : [
    { label: "Active Exams", value: attempts.length.toString(), icon: Book, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Completed", value: `${getAverageScore()}%`, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { label: "Best Score", value: attempts.length > 0 ? `${Math.max(...attempts.map(a => a.score || 0))}%` : "0%", icon: Award, color: "text-yellow-500", bg: "bg-yellow-50" }
  ];

  // Recent activity data with search filter
  const filteredRecentActivity = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      return isTeacher 
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
    }
    
    const allActivity = isTeacher 
      ? exams.map(exam => ({
          title: exam.title,
          date: new Date(exam.created_at).toLocaleDateString(),
          score: exam._count?.attempts || 0,
          status: exam.is_published ? "Published" : "Draft"
        }))
      : attempts.map(attempt => ({
          title: attempt.exam.title,
          date: new Date(attempt.start_time).toLocaleDateString(),
          score: attempt.score || 0,
          status: (attempt.score || 0) >= 80 ? "Distinction" : (attempt.score || 0) >= 60 ? "Pass" : "Failed"
        }));
    
    return allActivity.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [searchQuery, isTeacher, exams, attempts]);

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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-1">Do Stuff</h1>
          <p className="text-gray-500 font-medium">
            Welcome back, {user.profile?.full_name}! 
            Monitoring {isTeacher ? 'class performance' : 'your progress'} in real-time.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isTeacher && (
            <button 
              onClick={() => navigate('/create-exam')}
              className="bg-[#7C3AED] text-white p-3 md:px-6 md:py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl shadow-[#7C3AED]/20 hover:scale-[1.05] transition-all"
            >
              <Plus size={20} />
              <span className="hidden md:block">Create New</span>
            </button>
          )}
        </div>
      </header>

      {/* Interactive Stats Grid */}
      <section className={`grid grid-cols-2 ${isTeacher ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
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
          <button 
            onClick={() => navigate(isTeacher ? '/exams' : '/results')}
            className="text-[#7C3AED] text-sm font-black hover:underline"
          >
            View History
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecentActivity.map((item, i) => (
            <div 
              key={i} 
              className="group flex flex-col lg:flex-row items-stretch justify-between bg-[#F8FAFC] rounded-[2rem] border-2 border-transparent hover:border-[#10B981]/10 hover:bg-white transition-all duration-300 p-2 shadow-sm hover:shadow-xl cursor-pointer"
              onClick={() => navigate(isTeacher ? `/exams/${item.title}` : `/results`)}
            >
              <div className="flex items-center space-x-6 p-4 md:p-6 flex-1 min-w-0">
                <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 text-yellow-600 bg-yellow-100 shadow-inner">
                  <Trophy size={24} />
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <p className="text-[16px] font-[800] text-gray-800 leading-[1.4] group-hover:text-gray-900 transition-colors break-words">{item.title}</p>
                  <div className="flex items-center space-x-3">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white border border-gray-100 px-3 py-1 rounded-lg group-hover:bg-gray-50 transition-colors">{item.date}</span>
                    <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className={`text-lg font-bold ${item.score >= 80 ? 'text-yellow-600' : item.score >= 60 ? 'text-green-500' : 'text-red-500'}`}>{item.score}%</span>
                    </div>
                  </div>
                </div>
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
