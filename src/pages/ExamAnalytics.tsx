import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  TrendingUp,
  Loader2,
  BarChart3
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

  // Enhanced Calendar Heatmap Component for Analytics
  const AnalyticsHeatmap = ({ attempts, className }: { attempts: StudentAttempt[], className?: string }) => {
    const generateHeatmapData = () => {
      const today = new Date();
      const calendarData = [];
      
      // Generate 12 weeks of data
      for (let week = 0; week < 12; week++) {
        const weekData = [];
        for (let day = 0; day < 7; day++) {
          const date = new Date(today);
          date.setDate(date.getDate() - (week * 7 + day));
          
          // Find attempts for this specific date
          const dateStr = date.toISOString().split('T')[0];
          const dayAttempts = attempts.filter(attempt => {
            const attemptDate = new Date(attempt.start_time).toISOString().split('T')[0];
            return attemptDate === dateStr;
          });
          
          const avgScore = dayAttempts.length > 0
            ? dayAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / dayAttempts.length
            : 0;
          
          weekData.push({
            date: dateStr,
            score: Math.round(avgScore),
            attemptCount: dayAttempts.length,
            isToday: date.toDateString() === today.toDateString(),
            dayOfWeek: day,
            hasData: dayAttempts.length > 0
          });
        }
        calendarData.push(weekData);
      }
      
      return calendarData.reverse();
    };

    const calendarData = generateHeatmapData();
    
    const getIntensityLevel = (score: number, hasData: boolean) => {
      if (!hasData) return 0;
      if (score < 20) return 1;
      if (score < 40) return 2;
      if (score < 60) return 3;
      if (score < 80) return 4;
      return 5;
    };

    const getIntensityColor = (level: number, hasData: boolean) => {
      if (!hasData) return 'bg-gray-100 dark:bg-gray-800';
      
      // More satisfying and pleasing color palette
      const colors = [
        'bg-slate-200 dark:bg-slate-700',      // 0 - No data
        'bg-rose-200 dark:bg-rose-800/40',    // 1 - Poor (0-20%) - Soft rose
        'bg-amber-200 dark:bg-amber-800/40',  // 2 - Below Average (20-40%) - Warm amber
        'bg-lime-200 dark:bg-lime-800/40',    // 3 - Average (40-60%) - Fresh lime
        'bg-emerald-200 dark:bg-emerald-800/40', // 4 - Good (60-80%) - Rich emerald
        'bg-violet-200 dark:bg-violet-800/40' // 5 - Excellent (80-100%) - Royal violet
      ];
      return colors[level] || colors[0];
    };

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Timeline
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Daily average scores over the last 12 weeks</p>
          </div>
        </div>
        
        <Card className="p-6 bg-gradient-card border-0 shadow-medium">
          <div className="flex flex-col lg:flex-row">
            {/* Day labels - Responsive visibility */}
            <div className="flex flex-row lg:flex-col mr-0 lg:mr-3 mt-0 lg:mt-8 mb-2 lg:mb-0">
              {dayLabels.map((day, index) => (
                <div key={day} className={cn(
                  "text-xs text-muted-foreground mb-1 flex items-center justify-center",
                  "h-4 w-8 lg:w-auto lg:h-4 lg:mb-1",
                  "hidden sm:flex" // Hide on very small screens, show on small and up
                )}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid - Fully responsive */}
            <div className="flex-1 min-w-0">
              {/* Month labels - Responsive */}
              <div className="flex mb-2 ml-1 overflow-x-auto pb-1">
                {calendarData.map((week, weekIndex) => {
                  const weekStart = new Date(week[0].date);
                  const showMonth = weekStart.getDate() <= 7;
                  return (
                    <div key={weekIndex} className={cn(
                      "flex-shrink-0 flex justify-center",
                      "w-12 sm:w-16 md:w-20 lg:w-24" // Responsive week width
                    )}>
                      {showMonth && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {monthLabels[weekStart.getMonth()]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Day squares - Responsive sizing */}
              <div className="flex overflow-x-auto pb-2">
                {calendarData.map((week, weekIndex) => (
                  <div key={weekIndex} className={cn(
                    "flex-shrink-0 flex flex-col",
                    "w-12 sm:w-16 md:w-20 lg:w-24 mr-1" // Responsive week width
                  )}>
                    {week.map((day, dayIndex) => {
                      const intensity = getIntensityLevel(day.score, day.hasData);
                      const colorClass = getIntensityColor(intensity, day.hasData);
                      
                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={cn(
                            "rounded-md mb-1 transition-all duration-300 hover:scale-110 cursor-pointer relative group shadow-sm hover:shadow-md",
                            "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6", // Responsive square size
                            colorClass,
                            day.isToday && "ring-1 sm:ring-2 ring-primary ring-offset-1 sm:ring-offset-2 ring-offset-background",
                            day.hasData && "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
                          )}
                        >
                          {/* Enhanced Tooltip */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                            <div className="font-semibold">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="mt-1 space-y-1">
                              <div>Avg Score: <span className="font-semibold">{day.score}%</span></div>
                              {day.attemptCount > 0 && (
                                <div>Attempts: <span className="font-semibold">{day.attemptCount}</span></div>
                              )}
                              {day.attemptCount === 0 && (
                                <div>No activity</div>
                              )}
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
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
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">Less Activity</span>
            <div className="flex items-center gap-1">
              <div className="text-xs text-muted-foreground mr-2">No Data</div>
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-md", // Responsive legend squares
                    getIntensityColor(level, true)
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">More Activity</span>
          </div>
        </Card>
      </div>
    );
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
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/exams')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exams
            </Button>
          </div>
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

        {/* Performance Timeline Heatmap */}
        {attempts.length > 0 && (
          <AnalyticsHeatmap attempts={attempts} className="mb-8" />
        )}

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
