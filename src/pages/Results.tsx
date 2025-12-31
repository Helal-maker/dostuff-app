import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Calendar,
  Clock,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Loader2,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  Star,
  Users,
  Share2,
  Printer,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface ExamAttempt {
  id: string;
  exam: {
    id: string;
    title: string;
    language: string;
  };
  score: number;
  total_points: number;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  passed: boolean;
  distinction?: boolean;
}

interface PerformanceTrendData {
  date: string;
  score: number;
  exam_title: string;
  status: "pass" | "fail" | "distinction";
}

type SortOption = "date-newest" | "date-oldest" | "score-high" | "score-low" | "title-asc" | "title-desc" | "status";
type FilterStatus = "all" | "distinction" | "pass" | "fail";

const Results = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<ExamAttempt[]>([]);
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<SortOption>(searchParams.get("sort") as SortOption || "date-newest");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(searchParams.get("status") as FilterStatus || "all");
  const [scoreRange, setScoreRange] = useState({
    min: Number(searchParams.get("minScore") || 0),
    max: Number(searchParams.get("maxScore") || 100),
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    fetchAttempts();
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    // Update URL with filter/sort params
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (sortBy) params.set("sort", sortBy);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (scoreRange.min > 0) params.set("minScore", scoreRange.min.toString());
    if (scoreRange.max < 100) params.set("maxScore", scoreRange.max.toString());
    
    setSearchParams(params, { replace: true });
    
    // Apply filters
    applyFilters();
  }, [searchTerm, sortBy, statusFilter, scoreRange, attempts]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exams!inner(id, title, language)
        `)
        .eq('student_id', user?.id)
        .eq('is_completed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data to add distinction flag (score >= 90%)
      const formattedAttempts = data.map(attempt => ({
        ...attempt,
        exam: attempt.exams,
        distinction: (attempt.score || 0) >= 90
      }));

      // Generate performance trend data
      const trendData = formattedAttempts
        .sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime())
        .map(attempt => ({
          date: new Date(attempt.end_time).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }),
          score: attempt.score || 0,
          exam_title: attempt.exam.title,
          status: (attempt.distinction ? "distinction" : attempt.passed ? "pass" : "fail") as "pass" | "fail" | "distinction"
        }));

      setAttempts(formattedAttempts);
      setFilteredAttempts(formattedAttempts);
      setPerformanceTrend(trendData);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      toast({
        title: "Error",
        description: "Failed to load exam results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attempts];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(attempt => 
        attempt.exam.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(attempt => {
        if (statusFilter === "distinction") return attempt.distinction;
        if (statusFilter === "pass") return attempt.passed && !attempt.distinction;
        if (statusFilter === "fail") return !attempt.passed;
        return true;
      });
    }
    
    // Apply score range filter
    filtered = filtered.filter(attempt => 
      attempt.score >= scoreRange.min && attempt.score <= scoreRange.max
    );
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.end_time).getTime() - new Date(a.end_time).getTime();
        case "date-oldest":
          return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
        case "score-high":
          return b.score - a.score;
        case "score-low":
          return a.score - b.score;
        case "title-asc":
          return a.exam.title.localeCompare(b.exam.title);
        case "title-desc":
          return b.exam.title.localeCompare(a.exam.title);
        case "status":
          // Sort by status: distinction first, then pass, then fail
          if (a.distinction && !b.distinction) return -1;
          if (!a.distinction && b.distinction) return 1;
          if (a.passed && !b.passed) return -1;
          if (!a.passed && b.passed) return 1;
          return 0;
        default:
          return 0;
      }
    });
    
    setFilteredAttempts(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setScoreRange({ min: 0, max: 100 });
    setSortBy("date-newest");
    setSearchParams({});
  };

  const getTimeTaken = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  const getStatusIcon = (attempt: ExamAttempt) => {
    if (attempt.distinction) {
      return <Trophy className="w-5 h-5 text-yellow-500" aria-hidden="true" />;
    } else if (attempt.passed) {
      return <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />;
    }
  };

  const getStatusText = (attempt: ExamAttempt) => {
    if (attempt.distinction) return "Distinction";
    if (attempt.passed) return "Pass";
    return "Fail";
  };

  const getStatusClass = (attempt: ExamAttempt) => {
    if (attempt.distinction) return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300";
    if (attempt.passed) return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300";
    return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300";
  };

  const getTrendLineColor = (data: PerformanceTrendData[]) => {
    if (data.length < 2) return "#3b82f6";
    
    const firstScore = data[0].score;
    const lastScore = data[data.length - 1].score;
    
    if (lastScore > firstScore) return "#10b981"; // Green for improvement
    if (lastScore < firstScore) return "#ef4444"; // Red for decline
    return "#3b82f6"; // Blue for stable
  };

  const handleExport = async () => {
    try {
      // Export functionality preserved from original
      const csvContent = [
        ['Exam Title', 'Score', 'Status', 'Date Completed', 'Time Taken'],
        ...filteredAttempts.map(attempt => [
          attempt.exam.title,
          `${attempt.score}%`,
          getStatusText(attempt),
          new Date(attempt.end_time).toLocaleDateString(),
          getTimeTaken(attempt.start_time, attempt.end_time)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Results exported to CSV file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    // Share functionality preserved
    if (navigator.share) {
      navigator.share({
        title: 'My Exam Results',
        text: `I have completed ${attempts.length} exams with an average score of ${averageScore}%`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Results link copied to clipboard",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate statistics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const distinctionAttempts = attempts.filter(a => a.distinction).length;
  const averageScore = attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  const chartConfig = {
    score: {
      label: "Score",
      color: getTrendLineColor(performanceTrend),
    },
  };

  // Get the best attempt for the hero section
  const bestAttempt = attempts.length > 0 
    ? [...attempts].sort((a, b) => b.score - a.score)[0] 
    : null;

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFF] min-h-screen pb-32 md:pb-10 overflow-x-hidden">
      {/* Dynamic Header Banner */}
      <div className="relative w-full bg-[#10B981] pt-16 pb-32 px-6 text-center text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl backdrop-blur-md mb-6 shadow-lg border border-white/30">
            <Trophy size={32} className="text-white drop-shadow-sm" />
          </div>
          <h2 className="text-4xl md:text-6xl font-[1000] mb-4 tracking-tight leading-none">Your Results Dashboard</h2>
          <p className="text-white/80 font-semibold text-base md:text-xl max-w-sm mx-auto">
            Track your academic excellence and achievements
          </p>
          
          {/* Quick Stats in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold">{totalAttempts}</p>
                  <p className="text-white/80 text-sm">Total Exams</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold">{passedAttempts}</p>
                  <p className="text-white/80 text-sm">Passed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold">{distinctionAttempts}</p>
                  <p className="text-white/80 text-sm">Distinction</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white/80" />
                <div>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                  <p className="text-white/80 text-sm">Average</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 -mt-24 relative z-20 flex flex-col md:flex-row items-start gap-6 lg:gap-8">
        
        {/* Left Column: The Achievement Hub */}
        <div className="w-full md:w-[340px] lg:w-[400px] shrink-0 flex flex-col">
          <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative flex-1 flex flex-col justify-between">
             
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2.5">
                   <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Overall Performance</span>
                </div>
                <div className="bg-[#DCFCE7] text-[#166534] px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                   <Star size={10} fill="currentColor" />
                   <span className="text-[9px] font-black uppercase tracking-widest">
                     {averageScore >= 90 ? 'Elite Tier' : averageScore >= 80 ? 'Advanced Tier' : averageScore >= 70 ? 'Proficient Tier' : 'Developing Tier'}
                   </span>
                </div>
             </div>

             {/* Performance Heat Map Chart - Based on average score */}
             <div className="flex flex-col items-center justify-center flex-1 py-4">
                {/* 10x10 Heatmap Grid Container */}
                <div className="p-4 md:p-5 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8 shadow-inner relative overflow-hidden group">
                  {/* Subtle Glow Effect behind active area */}
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                  
                  {/* Grid - Adjusted sizes for Tablet (md) vs Desktop (lg/xl) */}
                  <div className="grid grid-cols-10 gap-2 md:gap-1.5 lg:gap-2 xl:gap-2.5">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`
                          w-3 h-3 
                          sm:w-4 sm:h-4 
                          md:w-3.5 md:h-3.5 
                          lg:w-4 lg:h-4 
                          xl:w-5 xl:h-5 
                          rounded-[3px] lg:rounded-[4px] 
                          transition-all duration-700 ease-out 
                          ${i < averageScore 
                            ? 'bg-[#10B981] shadow-[0_1px_2px_rgba(16,185,129,0.3)]' 
                            : 'bg-slate-200'}
                        `}
                        style={{ 
                          opacity: i < averageScore ? 0.3 + (i / 100) * 0.7 : 0.5,
                          transform: i < averageScore ? 'scale(1)' : 'scale(0.85)'
                        }}
                        title={`Point ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Score Text Overlay */}
                <div className="flex flex-col items-center">
                    <div className="flex items-baseline -mr-2 mb-3">
                        <span className="text-6xl lg:text-7xl font-[1000] text-gray-900 tracking-tighter">{averageScore}</span>
                        <span className="text-2xl lg:text-3xl font-black text-gray-300 ml-1">%</span>
                    </div>
                    <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center space-x-2 hover:scale-105 transition-transform cursor-default">
                        <Zap size={14} className="text-[#10B981]" fill="currentColor" />
                        <span>Mastery Level</span>
                    </div>
                </div>
             </div>

             {/* Stats Footer */}
             <div className="grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-gray-50">
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center border border-gray-100 group hover:border-[#10B981]/20 transition-colors">
                   <Clock size={18} className="text-gray-400 mb-1 group-hover:text-[#10B981] transition-colors" />
                   <span className="text-lg font-[900] text-gray-900">{passRate}%</span>
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pass Rate</span>
                </div>
                 <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center border border-gray-100 group hover:border-[#10B981]/20 transition-colors">
                   <ShieldCheck size={18} className="text-[#10B981] mb-1" />
                   <span className="text-lg font-[900] text-gray-900">{passedAttempts}</span>
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Passed</span>
                 </div>
             </div>
             
             {/* Action Buttons */}
             <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleShare}
                  className="flex-1 py-4 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button 
                  onClick={handleExport}
                  className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 transition-all flex items-center justify-center space-x-2"
                >
                  <Printer size={14} />
                  <span>Export</span>
                </button>
             </div>

          </div>
        </div>

        {/* Right Column: Detailed Section Review and Performance */}
        <div className="flex-1 w-full min-w-0 bg-white rounded-[2.5rem] p-6 lg:p-12 shadow-2xl shadow-gray-200/40 border border-gray-100 flex flex-col mb-24 md:mb-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-emerald-50 text-[#10B981] rounded-2xl">
                  <BarChart3 size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tight leading-none">Analytics & Insights</h3>
              </div>
              <p className="text-gray-400 font-bold text-sm ml-[3.25rem]">Performance analysis & detailed results</p>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-sm">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Results Found</span>
                 <span className="text-xl font-[900] text-gray-900">{filteredAttempts.length}</span>
               </div>
               {/* Filters and Search */}
               <div className="flex gap-2">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     placeholder="Search exams..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-9 w-40 bg-white/70 backdrop-blur-sm border-white/20"
                   />
                 </div>
                 
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-white/20">
                       <SlidersHorizontal className="h-4 w-4" />
                       <span>Filter</span>
                       <ChevronDown className="h-4 w-4 opacity-50" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-56">
                     <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                     <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                       <DropdownMenuRadioItem value="all">All Results</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="distinction">Distinction</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="pass">Pass</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="fail">Fail</DropdownMenuRadioItem>
                     </DropdownMenuRadioGroup>
                     
                     <DropdownMenuSeparator />
                     
                     <DropdownMenuItem onClick={resetFilters}>
                       Reset Filters
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
                 
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="outline" className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-white/20">
                       <ArrowUpDown className="h-4 w-4" />
                       <span>Sort</span>
                       <ChevronDown className="h-4 w-4 opacity-50" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-56">
                     <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                       <DropdownMenuRadioItem value="date-newest">Date (Newest First)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="date-oldest">Date (Oldest First)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="score-high">Score (High to Low)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="score-low">Score (Low to High)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="title-asc">Title (A-Z)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="title-desc">Title (Z-A)</DropdownMenuRadioItem>
                       <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                     </DropdownMenuRadioGroup>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          {performanceTrend.length > 1 && (
            <Card className="mb-8 bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-lg">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  Performance Trend
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Track your performance progression over time
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="h-64 sm:h-72 md:h-80">
                  <ChartContainer config={chartConfig} className="w-full h-full mobile-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceTrend}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 15,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          className="text-muted-foreground"
                          tick={{ fontSize: 10 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={[0, 100]}
                          className="text-muted-foreground"
                          tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload as PerformanceTrendData;
                              return (
                                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold text-gray-800">{data.exam_title}</p>
                                  <p className="text-sm text-gray-600">{label}</p>
                                  <p className="text-sm">
                                    Score: <span className="font-semibold">{data.score}%</span>
                                  </p>
                                  <p className="text-sm">
                                    Status: <span className={`font-semibold ${
                                      data.status === "distinction" ? "text-yellow-600" :
                                      data.status === "pass" ? "text-green-600" : "text-red-600"
                                    }`}>
                                      {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                                    </span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="2 2" />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke={getTrendLineColor(performanceTrend)}
                          strokeWidth={2}
                          dot={{
                            fill: getTrendLineColor(performanceTrend),
                            strokeWidth: 1,
                            r: 3,
                          }}
                          activeDot={{
                            r: 5,
                            stroke: getTrendLineColor(performanceTrend),
                            strokeWidth: 1,
                            fill: "white"
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {performanceTrend.length >= 2 && (
                      <>
                        {performanceTrend[performanceTrend.length - 1].score > performanceTrend[0].score ? (
                          <span className="text-green-600 font-medium">
                            ↗ Improved by {performanceTrend[performanceTrend.length - 1].score - performanceTrend[0].score} points
                          </span>
                        ) : performanceTrend[performanceTrend.length - 1].score < performanceTrend[0].score ? (
                          <span className="text-red-600 font-medium">
                            ↘ Declined by {performanceTrend[0].score - performanceTrend[performanceTrend.length - 1].score} points
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
              </CardContent>
            </Card>
          )}

          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-6">
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="w-20 h-8 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAttempts.length === 0 ? (
              <Card className="p-16 bg-gradient-to-br from-white to-blue-50 border-0 shadow-xl text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                  <div className="relative">
                    <BookOpen className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-3">No results found</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      {attempts.length > 0 
                        ? "Try adjusting your filters to see more results" 
                        : "You haven't completed any exams yet"}
                    </p>
                    {attempts.length > 0 ? (
                      <Button onClick={resetFilters} variant="outline" size="lg" className="bg-white/70 backdrop-blur-sm">
                        Reset Filters
                      </Button>
                    ) : (
                      <Button onClick={() => navigate('/join')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        Join an Exam
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              filteredAttempts.map((attempt) => (
                <div 
                  key={attempt.id} 
                  className="group flex flex-col lg:flex-row items-stretch justify-between bg-[#F8FAFC] rounded-[2rem] border-2 border-transparent hover:border-[#10B981]/10 hover:bg-white transition-all duration-300 p-2 shadow-sm hover:shadow-xl cursor-pointer"
                  onClick={() => navigate(`/exam-results/${attempt.id}`)}
                >
                  <div className="flex items-center space-x-6 p-4 md:p-6 flex-1 min-w-0">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${attempt.distinction ? 'text-yellow-600 bg-yellow-100 shadow-inner' : attempt.passed ? 'text-[#10B981] bg-[#10B981]/10 shadow-inner' : 'text-[#F43F5E] bg-[#F43F5E]/10 shadow-inner'}`}>
                      {attempt.distinction ? <Trophy size={24} strokeWidth={2.5} /> : attempt.passed ? <CheckCircle size={24} strokeWidth={2.5} /> : <XCircle size={24} strokeWidth={2.5} />}
                    </div>
                    <div className="space-y-2 min-w-0 flex-1">
                      <p className="text-[16px] font-[800] text-gray-800 leading-[1.4] group-hover:text-gray-900 transition-colors break-words">
                        {attempt.exam.title}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white border border-gray-100 px-3 py-1 rounded-lg group-hover:bg-gray-50 transition-colors">
                          {attempt.exam.language}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white border border-gray-100 px-3 py-1 rounded-lg group-hover:bg-gray-50 transition-colors">
                          {new Date(attempt.end_time).toLocaleDateString()}
                        </span>
                        {attempt.distinction && <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest">Distinction</span>}
                        {attempt.passed && !attempt.distinction && <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Pass</span>}
                        {!attempt.passed && <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Fail</span>}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`text-lg font-bold ${attempt.distinction ? 'text-yellow-600' : attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.score}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{getTimeTaken(attempt.start_time, attempt.end_time)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center p-6 border-t lg:border-t-0 lg:border-l border-gray-100 group-hover:border-[#10B981]/10 transition-colors">
                    <button className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#10B981] group-hover:scale-110 transition-all active:scale-95">
                      <ArrowRight size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredAttempts.length > 0 && (
            <div className="mt-12 p-10 bg-[#0F172A] rounded-[2.5rem] relative overflow-hidden text-center flex flex-col items-center border border-white/5">
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-[#10B981]/20 text-[#10B981] p-3 rounded-2xl mb-6 shadow-xl backdrop-blur-sm">
                   <Zap size={28} fill="currentColor" />
                </div>
                <h4 className="text-2xl font-[1000] text-white mb-3 tracking-tight">Ready for the Next Challenge?</h4>
                <p className="text-slate-400 font-medium text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                  Continue your learning journey with new exams that match your {averageScore}% proficiency level.
                </p>
                <button 
                  onClick={() => navigate('/exams')}
                  className="px-10 py-4 bg-white text-gray-900 font-[1000] rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-[#10B981] hover:text-white hover:shadow-[#10B981]/30 active:scale-95 transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.2em] text-[10px]"
                >
                  <span>Explore More Exams</span>
                  <ArrowRight size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
