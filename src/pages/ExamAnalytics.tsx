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

  // Enhanced Calendar Heatmap Component for Analytics - Week View Only
  const AnalyticsHeatmap = ({ attempts, className }: { attempts: StudentAttempt[], className?: string }) => {
    const generateHeatmapData = () => {
      // Find the date range when exams were taken
      const attemptDates = attempts
        .map(a => new Date(a.start_time))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (attemptDates.length === 0) return [];
      
      const minDate = attemptDates[0];
      
      // Find the start of the week (Sunday) for the week containing the first exam
      const startDate = new Date(minDate);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Go to Sunday of that week
      
      // End date is 6 days after start (full week = 7 days)
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      const calendarData = [];
      const currentDate = new Date(startDate);
      
      // Generate exactly 7 days (1 week)
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayAttempts = attempts.filter(attempt => {
          const attemptDate = new Date(attempt.start_time).toISOString().split('T')[0];
          return attemptDate === dateStr;
        });
        
        const avgScore = dayAttempts.length > 0
          ? dayAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / dayAttempts.length
          : 0;
        
        calendarData.push({
          date: dateStr,
          score: Math.round(avgScore),
          attemptCount: dayAttempts.length,
          isToday: currentDate.toDateString() === new Date().toDateString(),
          dayOfWeek: currentDate.getDay(),
          hasData: dayAttempts.length > 0
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return calendarData;
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
      if (!hasData) return 'bg-slate-200 dark:bg-slate-700';
      
      // Modern gradient color palette
      const colors = [
        'bg-slate-200 dark:bg-slate-700',           // 0 - No data
        'bg-red-300 dark:bg-red-900/60',            // 1 - Poor (0-20%)
        'bg-orange-300 dark:bg-orange-900/60',      // 2 - Below Average (20-40%)
        'bg-yellow-300 dark:bg-yellow-900/60',      // 3 - Average (40-60%)
        'bg-green-300 dark:bg-green-900/60',        // 4 - Good (60-80%)
        'bg-emerald-400 dark:bg-emerald-800'        // 5 - Excellent (80-100%)
      ];
      return colors[level] || colors[0];
    };

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance Timeline
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {calendarData.length > 0 && (
                <>
                  Daily activity heatmap for the week ({calendarData[0].date} to {calendarData[calendarData.length - 1].date})
                </>
              )}
            </p>
          </div>
        </div>
        
        <Card className="p-6 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="space-y-6">
            {/* Week header with date range */}
            <div className="flex items-center gap-3 pb-4 border-b border-border/30">
              <span className="text-sm font-bold text-white px-4 py-2 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-lg">
                {calendarData.length > 0 && (
                  <>
                    Week of {new Date(calendarData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </>
                )}
              </span>
            </div>
            
            {/* Day squares grid - Modern heatmap style */}
            <div className="space-y-3">
              <div className="flex flex-col items-start gap-3">
                {/* Heatmap grid */}
                <div className="flex gap-2">
                  {calendarData.map((day, dayIndex) => {
                    const intensity = getIntensityLevel(day.score, day.hasData);
                    const colorClass = getIntensityColor(intensity, day.hasData);
                    
                    return (
                      <div
                        key={`day-${dayIndex}`}
                        className="group relative flex-shrink-0"
                      >
                        <div
                          className={cn(
                            "rounded-xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:scale-125",
                            "w-12 h-12",
                            colorClass,
                            day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                            day.hasData && "hover:ring-2 hover:ring-primary/70 dark:hover:ring-primary/50"
                          )}
                        />
                        
                        {/* Modern tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                          <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/50 px-4 py-3 min-w-max backdrop-blur-sm">
                            {/* Date */}
                            <div className="font-semibold text-sm text-white mb-2">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            
                            {/* Content */}
                            {day.hasData ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-300">Score:</span>
                                  <span className="font-bold text-lg text-emerald-400">{day.score}%</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-300">Attempts:</span>
                                  <span className="font-semibold text-blue-400">{day.attemptCount}</span>
                                </div>
                                {day.score >= 80 && (
                                  <div className="text-xs text-emerald-400 font-medium mt-2 pt-2 border-t border-slate-700/50">
                                    ✨ Excellent Performance!
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-slate-400 italic text-sm">No activity</div>
                            )}
                            
                            {/* Arrow */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-slate-950 dark:border-t-slate-900"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Day labels - Bottom */}
                <div className="flex gap-2 pt-2">
                  {dayLabels.map((day) => (
                    <div key={day} className="text-xs font-semibold text-muted-foreground w-12 text-center">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend - Modern horizontal layout */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 mt-6 border-t border-border/30">
            <div className="text-xs font-semibold text-muted-foreground">Performance Scale:</div>
            <div className="flex items-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <div key={level} className="flex items-center gap-2 group cursor-help">
                  <div
                    className={cn(
                      "rounded-lg shadow-sm transition-transform hover:scale-125 duration-200", 
                      "w-6 h-6", 
                      getIntensityColor(level, level !== 0)
                    )}
                    title={['No Data', '0-20%', '20-40%', '40-60%', '60-80%', '80-100%'][level]}
                  />
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {['No Data', '0-20%', '20-40%', '40-60%', '60-80%', '80-100%'][level]}
                  </span>
                </div>
              ))}
            </div>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-medium">
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
      <div className="bg-primary text-primary-foreground py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <span className="text-primary-foreground/50">/</span>
            <Button
              variant="ghost"
              onClick={() => navigate('/exams')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exams
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <p className="text-primary-foreground/80 mt-2">Analytics & Student Performance Overview</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-md hover:shadow-lg transition-all hover:bg-white/80 dark:hover:bg-slate-800/80">
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

          <Card className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-md hover:shadow-lg transition-all hover:bg-white/80 dark:hover:bg-slate-800/80">
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

          <Card className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-md hover:shadow-lg transition-all hover:bg-white/80 dark:hover:bg-slate-800/80">
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

          <Card className="p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-md hover:shadow-lg transition-all hover:bg-white/80 dark:hover:bg-slate-800/80">
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
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-md overflow-hidden">
          <div className="p-6 border-b border-white/10 dark:border-slate-700/30">
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
                <thead className="bg-primary/5 border-b border-white/10 dark:border-slate-700/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Time Taken</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 dark:divide-slate-700/30">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-primary/5 transition-colors">
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
