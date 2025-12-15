import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SecureAvatar from "@/components/ui/secure-avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { 
  ArrowLeft, 
  Camera, 
  Loader2, 
  School, 
  Users, 
  UserPlus,
  LogOut,
  BarChart3,
  MoreVertical
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ExamStats {
  totalExams: number;
  passedExams: number;
  failedExams: number;
  averageScore: number;
}

interface PerformanceTrendData {
  date: string;
  score: number;
  count: number;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrendData[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, isTeacher } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchExamStats();
      fetchPerformanceTrend();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfileData(data);
      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url);
    }
  };

  const fetchExamStats = async () => {
    if (!user?.id) return;

    if (isTeacher) {
      // Fetch teacher's exam stats
      const { data: exams } = await supabase
        .from('exams')
        .select('id')
        .eq('teacher_id', user.id);

      const examIds = exams?.map(e => e.id) || [];
      
      if (examIds.length > 0) {
        const { data: attempts } = await supabase
          .from('exam_attempts')
          .select('score, passed, is_completed')
          .in('exam_id', examIds)
          .eq('is_completed', true);

        const completedAttempts = attempts || [];
        const passedCount = completedAttempts.filter(a => a.passed).length;
        const avgScore = completedAttempts.length > 0
          ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
          : 0;

        setExamStats({
          totalExams: examIds.length,
          passedExams: passedCount,
          failedExams: completedAttempts.length - passedCount,
          averageScore: Math.round(avgScore)
        });
      }
    } else {
      // Fetch student's exam stats
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('score, passed, is_completed')
        .eq('student_id', user.id)
        .eq('is_completed', true);

      const completedAttempts = attempts || [];
      const passedCount = completedAttempts.filter(a => a.passed).length;
      const avgScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
        : 0;

      setExamStats({
        totalExams: completedAttempts.length,
        passedExams: passedCount,
        failedExams: completedAttempts.length - passedCount,
        averageScore: Math.round(avgScore)
      });
    }
  };

  const fetchPerformanceTrend = async () => {
    if (!user?.id) return;
    
    setLoadingTrend(true);
    try {
      let attempts: any[] = [];
      
      if (isTeacher) {
        // For teachers, get performance from their students' attempts on their exams
        const { data: exams } = await supabase
          .from('exams')
          .select('id')
          .eq('teacher_id', user.id);
        
        const examIds = exams?.map(e => e.id) || [];
        
        if (examIds.length > 0) {
          const { data: attemptsData } = await supabase
            .from('exam_attempts')
            .select(`
              score,
              end_time,
              is_completed,
              passed
            `)
            .in('exam_id', examIds)
            .eq('is_completed', true)
            .order('end_time', { ascending: true });
          
          attempts = attemptsData || [];
        }
      } else {
        // For students, get their own attempts
        const { data: attemptsData } = await supabase
          .from('exam_attempts')
          .select(`
            score,
            end_time,
            is_completed,
            passed
          `)
          .eq('student_id', user.id)
          .eq('is_completed', true)
          .order('end_time', { ascending: true });
        
        attempts = attemptsData || [];
      }
      
      // Group attempts by day for the GitHub-style heatmap
      const dailyData: { [key: string]: { score: number, count: number } } = {};
      
      attempts.forEach(attempt => {
        const date = new Date(attempt.end_time);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { score: 0, count: 0 };
        }
        
        dailyData[dateKey].score += attempt.score || 0;
        dailyData[dateKey].count++;
      });
      
      // Convert to the format expected by the heatmap
      const trendData = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          score: Math.round(data.score / data.count), // Average score for the day
          count: data.count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setPerformanceTrend(trendData);
    } catch (error) {
      console.error('Error fetching performance trend:', error);
      setPerformanceTrend([]);
    } finally {
      setLoadingTrend(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture updated!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Dynamic performance data is now fetched via fetchPerformanceTrend
  // The performanceTrend state contains the real user data
  const performanceData = loadingTrend ? [] : performanceTrend;

  // Calendar Heatmap Component with Day Numbers and Month Labels
  const GitHubCalendarHeatmap = ({ data, className }: { data: PerformanceTrendData[], className?: string }) => {
    // Generate calendar data for exactly 30 days
    const generateCalendarData = () => {
      const today = new Date();
      const calendarData = [];
      const dataMap = new Map(data.map(d => [d.date, d]));
      
      // Start from 30 days ago
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // 30 days total
      
      // Generate 30 consecutive days
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        
        const dayData = dataMap.get(dateKey);
        const score = dayData?.score || 0;
        const count = dayData?.count || 0;
        
        calendarData.push({
          date: dateKey,
          dayNumber: date.getDate(),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          score,
          count,
          isToday: date.toDateString() === today.toDateString(),
          isFuture: date > today
        });
      }
      
      return calendarData;
    };

    const calendarData = generateCalendarData();
    
    // Group data by weeks (7 days each)
    const weeksData = [];
    for (let week = 0; week < 5; week++) { // 5 weeks for 30 days
      const weekStart = week * 7;
      const weekEnd = Math.min(weekStart + 7, calendarData.length);
      weeksData.push(calendarData.slice(weekStart, weekEnd));
    }
    
    // Get unique months for labels
    const uniqueMonths = [...new Set(calendarData.map(d => d.month))];
    
    // Responsive sizing
    const squareSize = isMobile ? 'w-12 h-12' : 'w-10 h-10'; // Larger squares for day numbers
    const weekWidth = isMobile ? 'w-12' : 'w-10';
    const weekMargin = isMobile ? 'mr-2' : 'mr-1.5';
    const padding = isMobile ? 'p-4' : 'p-4';
    
    const getIntensityLevel = (score: number) => {
      if (score === 0) return 0;
      if (score <= 20) return 1;
      if (score <= 40) return 2;
      if (score <= 60) return 3;
      if (score <= 80) return 4;
      return 5;
    };

    const getIntensityColor = (level: number, isFuture: boolean = false) => {
      if (isFuture) return 'bg-gray-100 dark:bg-gray-800';
      
      const colors = [
        'bg-gray-100 dark:bg-gray-800',     // 0 - No activity
        'bg-green-100 dark:bg-green-900/30', // 1 - Light green
        'bg-green-200 dark:bg-green-800/40', // 2 - Medium green
        'bg-green-300 dark:bg-green-700/50', // 3 - Darker green
        'bg-green-400 dark:bg-green-600/60', // 4 - Dark green
        'bg-green-500 dark:bg-green-500'     // 5 - Darkest green
      ];
      return colors[level] || colors[0];
    };

    const getScoreLabel = (score: number) => {
      if (score === 0) return 'No exams';
      if (score <= 20) return 'Poor performance';
      if (score <= 40) return 'Below average';
      if (score <= 60) return 'Average';
      if (score <= 80) return 'Good';
      return 'Excellent';
    };

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h5 className={cn(
              "font-medium text-gray-900 dark:text-gray-100",
              isMobile ? "text-sm" : "text-sm"
            )}>
              Exam Performance (30 days)
            </h5>
            <p className={cn(
              "text-gray-500 dark:text-gray-400 mt-1",
              isMobile ? "text-xs" : "text-xs"
            )}>
              Daily exam scores over the last 30 days
            </p>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className={cn(
          "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700",
          padding
        )}>
          <div className="flex">
            {/* Day labels */}
            <div className={cn(
              "flex flex-col mr-3",
              isMobile ? "mt-8" : "mt-8"
            )}>
              {dayLabels.map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "text-gray-500 dark:text-gray-400 flex items-center justify-center font-medium",
                    isMobile
                      ? "text-sm h-12 mb-1"
                      : "text-sm h-10 mb-1"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="flex-1 overflow-x-auto">
              {/* Month labels */}
              <div className={cn("flex mb-2", isMobile ? "ml-1" : "ml-1")}>
                {weeksData.map((week, weekIndex) => {
                  const hasData = week.length > 0;
                  const monthLabel = hasData ? week[0].month : '';
                  
                  return (
                    <div key={weekIndex} className={cn(weekWidth, weekMargin, "flex justify-center")}>
                      {monthLabel && (
                        <span className={cn(
                          "text-gray-500 dark:text-gray-400 font-medium",
                          isMobile ? "text-sm" : "text-sm"
                        )}>
                          {monthLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Day squares with numbers */}
              <div className="flex">
                {weeksData.map((week, weekIndex) => (
                  <div key={weekIndex} className={cn(weekWidth, weekMargin, "flex flex-col")}>
                    {week.map((day, dayIndex) => {
                      const intensity = getIntensityLevel(day.score);
                      const colorClass = getIntensityColor(intensity, day.isFuture);
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={cn(
                            squareSize,
                            "rounded-lg mb-1 transition-all duration-200 hover:scale-105 cursor-pointer relative group touch-manipulation border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center",
                            colorClass,
                            day.isToday && "ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-900"
                          )}
                        >
                          {/* Day number */}
                          <span className={cn(
                            "font-bold",
                            day.score > 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400",
                            isMobile ? "text-lg" : "text-base"
                          )}>
                            {day.dayNumber}
                          </span>
                          
                          {/* Score indicator (small dot) */}
                          {day.score > 0 && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full mt-0.5",
                              intensity >= 4 ? "bg-white" : "bg-gray-600"
                            )} />
                          )}
                          
                          {/* Mobile-friendly Tooltip */}
                          <div className={cn(
                            "absolute bg-gray-900 dark:bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap",
                            isMobile
                              ? "-top-16 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1"
                              : "-top-12 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1"
                          )}>
                            <div className="font-medium">
                              {day.score > 0 ? `${day.score}%` : 'No exams'}
                            </div>
                            <div className="text-gray-300">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            {/* Tooltip arrow */}
                            <div className={cn(
                              "absolute w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent",
                              isMobile
                                ? "top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700"
                                : "top-full left-1/2 transform -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700"
                            )}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className={cn(
            "flex items-center justify-between border-t border-gray-200 dark:border-gray-600 mt-4 pt-3"
          )}>
            <span className={cn(
              "text-gray-500 dark:text-gray-400",
              isMobile ? "text-xs" : "text-xs"
            )}>Less</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "rounded-sm",
                    isMobile ? "w-3 h-3" : "w-3 h-3",
                    getIntensityColor(level)
                  )}
                  title={getScoreLabel(level * 20)}
                />
              ))}
            </div>
            <span className={cn(
              "text-gray-500 dark:text-gray-400",
              isMobile ? "text-xs" : "text-xs"
            )}>More</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileLayout = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200">
      {/* Gradient background */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-br from-violet-600 via-cyan-400 to-amber-200 z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-6 pt-12 pb-6 text-white">
          <a 
            className="inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity mb-4" 
            href="#"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="text-lg mr-1" />
            Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        </div>
        
        <div className="flex-1 px-4 pb-8 space-y-4">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center transition-colors duration-200">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                <SecureAvatar
                  src={avatarUrl}
                  alt="Profile Picture"
                  fallback={getInitials(fullName || user?.email || 'U')}
                  size="xl"
                  className="w-full h-full border-0"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-violet-500 text-white p-1.5 rounded-full shadow-lg hover:bg-violet-600 transition-colors flex items-center justify-center border-2 border-white dark:border-gray-800 cursor-pointer">
                <Camera className="text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName || 'User'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3 break-all px-4">{user?.email}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
              <School className="text-sm mr-1" />
              {isTeacher ? "Teacher" : "Student"}
            </span>
          </div>

          {/* Profile Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-200">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              Profile Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="fullName">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm py-3 transition-colors duration-200"
                />
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {/* Exam Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="mr-2 text-gray-400" />
                Exam Performance
              </h3>
              <select className="text-xs border-none bg-gray-50 dark:bg-gray-800 rounded-lg py-1 pl-2 pr-6 text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-violet-600 dark:text-violet-300">{examStats?.totalExams || 0}</span>
                <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70 mt-1">
                  {isTeacher ? "Exams Created" : "Exams Taken"}
                </span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">{examStats?.passedExams || 0}</span>
                <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-300/70 mt-1">Passed</span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-rose-600 dark:text-rose-300">{examStats?.failedExams || 0}</span>
                <span className="text-xs font-medium text-rose-600/70 dark:text-rose-300/70 mt-1">Failed</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-300">{examStats?.averageScore || 0}%</span>
                <span className="text-xs font-medium text-amber-600/70 dark:text-amber-300/70 mt-1">Average Score</span>
              </div>
            </div>
            
            {/* Performance Heatmap */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Performance Heatmap</h4>
              <GitHubCalendarHeatmap data={performanceData} />
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex gap-4 pt-2 px-4 pb-4">
          <Button
            onClick={() => window.open('https://t.me/+P-Vu76yybMA5MjBk', '_blank')}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UserPlus className="text-lg mr-2 text-gray-500 dark:text-gray-400" />
            Join Community
          </Button>
          <Button
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="text-lg mr-2 text-gray-500 dark:text-gray-400" />
            Sign Out
          </Button>
        </div>
        
        <div className="h-4"></div>
      </div>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Gradient background */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-br from-violet-600 via-cyan-400 to-amber-200 z-0"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="px-6 pt-12 pb-6 text-white">
          <a 
            className="inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity mb-4" 
            href="#"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="text-lg mr-1" />
            Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        </div>
        
        <div className="flex-1 px-4 pb-8 space-y-4 max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center transition-colors duration-200">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                <SecureAvatar
                  src={avatarUrl}
                  alt="Profile Picture"
                  fallback={getInitials(fullName || user?.email || 'U')}
                  size="xl"
                  className="w-full h-full border-0"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-violet-500 text-white p-1.5 rounded-full shadow-lg hover:bg-violet-600 transition-colors flex items-center justify-center border-2 border-white dark:border-gray-800 cursor-pointer">
                <Camera className="text-sm" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName || 'User'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3 break-all px-4">{user?.email}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
              <School className="text-sm mr-1" />
              {isTeacher ? "Teacher" : "Student"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-200">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                Profile Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="fullName">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm py-3 transition-colors duration-200"
                  />
                </div>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>

            {/* Exam Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <BarChart3 className="mr-2 text-gray-400" />
                  Exam Performance
                </h3>
                <select className="text-xs border-none bg-gray-50 dark:bg-gray-800 rounded-lg py-1 pl-2 pr-6 text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer">
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-violet-600 dark:text-violet-300">{examStats?.totalExams || 0}</span>
                  <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70 mt-1">
                    {isTeacher ? "Exams Created" : "Exams Taken"}
                  </span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">{examStats?.passedExams || 0}</span>
                  <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-300/70 mt-1">Passed</span>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-rose-600 dark:text-rose-300">{examStats?.failedExams || 0}</span>
                  <span className="text-xs font-medium text-rose-600/70 dark:text-rose-300/70 mt-1">Failed</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-amber-600 dark:text-amber-300">{examStats?.averageScore || 0}%</span>
                  <span className="text-xs font-medium text-amber-600/70 dark:text-amber-300/70 mt-1">Average Score</span>
                </div>
              </div>
              
              {/* Performance Heatmap */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Performance Heatmap</h4>
                <GitHubCalendarHeatmap data={performanceData} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex gap-4 pt-2 px-4 pb-4 max-w-4xl mx-auto">
          <Button
            onClick={() => window.open('https://t.me/+P-Vu76yybMA5MjBk', '_blank')}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <UserPlus className="text-lg mr-2 text-gray-500 dark:text-gray-400" />
            Join Community
          </Button>
          <Button
            onClick={handleSignOut}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="text-lg mr-2 text-gray-500 dark:text-gray-400" />
            Sign Out
          </Button>
        </div>
        
        <div className="h-4"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Return mobile layout for mobile devices, desktop layout for desktop
  return isMobile ? renderMobileLayout() : renderDesktopLayout();
};

export default Profile;