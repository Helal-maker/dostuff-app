import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Calendar,
  Users,
  Search,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  BookOpen,
  Link,
  MessageSquare,
  ArrowUpDown,
  Loader2,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  GraduationCap,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  language: string;
  created_at: string;
  is_published: boolean;
  share_link: string | null;
  teacher_id: string;
  _count?: {
    attempts: number;
    questions: number;
  };
  average_score?: number;
  pass_rate?: number;
  teacher_profile?: {
    full_name: string;
    subject: string;
  };
}

interface StudentResult {
  id: string;
  student_id: string;
  student_name: string;
  score: number;
  passed: boolean;
  completed_at: string;
  distinction?: boolean;
}

type SortOption = "date-newest" | "date-oldest" | "students-high" | "students-low" | "score-high" | "score-low" | "title-asc" | "title-desc";
type FilterStatus = "all" | "published" | "draft";

const Exams = () => {
  const { user, loading: authLoading, isAuthenticated, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<SortOption>(searchParams.get("sort") as SortOption || "date-newest");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(searchParams.get("status") as FilterStatus || "all");

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (!isTeacher) {
      navigate('/dashboard');
      return;
    }
    
    fetchExams();
  }, [authLoading, isAuthenticated, isTeacher, user]);

  useEffect(() => {
    // Update URL with filter/sort params
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (sortBy) params.set("sort", sortBy);
    if (statusFilter !== "all") params.set("status", statusFilter);
    
    setSearchParams(params, { replace: true });
    
    // Apply filters
    applyFilters();
  }, [searchTerm, sortBy, statusFilter, exams]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      
      // First get the exams (without join since foreign key doesn't exist)
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;

      if (!examsData || examsData.length === 0) {
        setExams([]);
        setFilteredExams([]);
        return;
      }

      // Get exam IDs for batch queries
      const examIds = examsData.map(exam => exam.id);

      // Get questions count for each exam
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('exam_id')
        .in('exam_id', examIds);

      if (questionsError) throw questionsError;

      // Get exam attempts with scores
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('exam_id, score, passed')
        .in('exam_id', examIds);

      if (attemptsError) throw attemptsError;

      // Get the teacher's profile for subject info
      const { data: teacherProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, subject')
        .eq('user_id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // Log warning but don't fail - profile might not exist
        console.warn('Could not fetch teacher profile:', profileError);
      }

      // Process data to add metrics
      const examsWithMetrics = examsData.map(exam => {
        const examQuestions = questionsData?.filter(q => q.exam_id === exam.id) || [];
        const examAttempts = attemptsData?.filter(a => a.exam_id === exam.id) || [];
        
        const scores = examAttempts.map((a: any) => a.score).filter((s: any) => s !== null);
        const passedCount = examAttempts.filter((a: any) => a.passed).length;
        
        return {
          ...exam,
          _count: {
            questions: examQuestions.length,
            attempts: examAttempts.length
          },
          average_score: scores.length > 0
            ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10
            : 0,
          pass_rate: examAttempts.length > 0
            ? Math.round((passedCount / examAttempts.length) * 100)
            : 0,
          teacher_profile: teacherProfile ? {
            full_name: teacherProfile.full_name || '',
            subject: teacherProfile.subject || ''
          } : undefined
        };
      });

      setExams(examsWithMetrics);
      setFilteredExams(examsWithMetrics);
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

  const applyFilters = () => {
    let filtered = [...exams];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.teacher_profile?.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(exam => {
        if (statusFilter === "published") return exam.is_published;
        if (statusFilter === "draft") return !exam.is_published;
        return true;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "date-oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "students-high":
          return (b._count?.attempts || 0) - (a._count?.attempts || 0);
        case "students-low":
          return (a._count?.attempts || 0) - (b._count?.attempts || 0);
        case "score-high":
          return (b.average_score || 0) - (a.average_score || 0);
        case "score-low":
          return (a.average_score || 0) - (b.average_score || 0);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    setFilteredExams(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("date-newest");
    setSearchParams({});
  };

  const copyShareLink = (shareLink: string) => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Success",
      description: "Exam code copied to clipboard!",
    });
  };

  const getStatusIcon = (exam: Exam) => {
    if (exam.is_published) {
      return <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />;
    } else {
      return <XCircle className="w-4 h-4 text-gray-400" aria-hidden="true" />;
    }
  };

  const getStatusText = (exam: Exam) => {
    return exam.is_published ? "Published" : "Draft";
  };

  const getStatusClass = (exam: Exam) => {
    return exam.is_published 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: string } = {
      'mathematics': '📐',
      'math': '📐',
      'physics': '⚛️',
      'chemistry': '🧪',
      'biology': '🧬',
      'english': '📚',
      'literature': '📖',
      'history': '🏛️',
      'geography': '🌍',
      'computer science': '💻',
      'programming': '💻',
      'art': '🎨',
      'music': '🎵',
      'physical education': '⚽',
      'sports': '⚽',
    };
    
    const lowerSubject = subject.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerSubject.includes(key)) {
        return icon;
      }
    }
    return '📖'; // default icon
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-slate-900/60 backdrop-blur-sm"
          >
            ← Back to Dashboard
          </Button>
        </div>
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            Exams Overview
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Manage your exams and track student performance
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search exams by title, description, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/30 rounded-xl shadow-sm focus:shadow-md transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/30 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <span>Filter</span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                  <DropdownMenuRadioItem value="all">All Exams</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="draft">Draft</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={resetFilters}>
                  Reset Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-white/20 dark:border-slate-700/30 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <span>Sort</span>
                  <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <DropdownMenuRadioItem value="date-newest">Date (Newest First)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="date-oldest">Date (Oldest First)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="students-high">Students (High to Low)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="students-low">Students (Low to High)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="score-high">Avg Score (High to Low)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="score-low">Avg Score (Low to High)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title-asc">Title (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title-desc">Title (Z-A)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Exams Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 dark:border-slate-700/30 inline-block">
            Showing {filteredExams.length} {filteredExams.length === 1 ? 'exam' : 'exams'}
            {filteredExams.length !== exams.length && ` (filtered from ${exams.length})`}
          </p>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden border border-white/20 dark:border-slate-700/30 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl">
                <CardHeader className="p-6">
                  <Skeleton className="h-7 w-3/4 mb-3" />
                  <Skeleton className="h-5 w-1/2" />
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <Card className="p-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-700/30 shadow-lg text-center rounded-3xl">
            <BookOpen className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-3">No exams found</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              {exams.length > 0 
                ? "Try adjusting your filters to see more exams" 
                : "Create your first exam to get started"}
            </p>
            {exams.length > 0 ? (
              <Button onClick={resetFilters} variant="outline" size="lg" className="px-8 py-3 rounded-xl">
                Reset Filters
              </Button>
            ) : (
              <Button onClick={() => navigate('/create-exam')} size="lg" className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Create Exam
              </Button>
            )}
          </Card>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="region"
            aria-label="Exams list"
          >
            {filteredExams.map((exam) => (
              <Card 
                key={exam.id} 
                className={cn(
                  "overflow-hidden border border-white/20 dark:border-slate-700/30 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all duration-300",
                  "hover:shadow-lg hover:bg-white/80 dark:hover:bg-slate-800/80 hover:-translate-y-1",
                  "rounded-2xl relative group"
                )}
                tabIndex={0}
              >
                {/* Accent Top Border */}
                <div className="h-1 bg-gradient-to-r from-primary to-primary/60"></div>
                
                <CardHeader className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-foreground line-clamp-2 leading-tight">
                        {exam.title}
                      </CardTitle>
                      {/* Subject Badge */}
                      {exam.teacher_profile?.subject && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg">{getSubjectIcon(exam.teacher_profile.subject)}</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                            {exam.teacher_profile.subject}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className={`ml-3 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 border ${getStatusClass(exam)}`}>
                      {getStatusIcon(exam)}
                      <span>{getStatusText(exam)}</span>
                    </div>
                  </div>
                  
                  {exam.description && (
                    <CardDescription className="text-muted-foreground line-clamp-3 leading-relaxed">
                      {exam.description}
                    </CardDescription>
                  )}
                  
                  {/* Teacher Info */}
                  {exam.teacher_profile?.full_name && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-primary/5 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-primary/60" />
                      <span className="text-sm text-foreground font-medium">
                        {exam.teacher_profile.full_name}
                      </span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="p-6 pt-0">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 transition-all hover:bg-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">Students</span>
                      </div>
                      <span className="text-2xl font-bold text-foreground">{exam._count?.attempts || 0}</span>
                    </div>
                    
                    <div className="bg-success/5 p-4 rounded-xl border border-success/10 transition-all hover:bg-success/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-success" />
                        <span className="text-xs font-medium text-muted-foreground">Avg Score</span>
                      </div>
                      <span className={cn("text-2xl font-bold", getScoreColor(exam.average_score || 0))}>
                        {exam.average_score || 0}%
                      </span>
                    </div>
                    
                    <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 transition-all hover:bg-accent/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-accent" />
                        <span className="text-xs font-medium text-muted-foreground">Pass Rate</span>
                      </div>
                      <span className={cn("text-2xl font-bold", getPassRateColor(exam.pass_rate || 0))}>
                        {exam.pass_rate || 0}%
                      </span>
                    </div>
                    
                    <div className="bg-warning/5 p-4 rounded-xl border border-warning/10 transition-all hover:bg-warning/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-xs font-medium text-muted-foreground">Created</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {new Date(exam.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/exam-analytics/${exam.id}`)}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-xl shadow-md hover:shadow-lg transition-all"
                      size="sm"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                    <Button
                      onClick={() => copyShareLink(exam.share_link!)}
                      variant="outline"
                      size="sm"
                      disabled={!exam.share_link}
                      title="Copy share link"
                      className="border-white/20 dark:border-slate-700/30 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl backdrop-blur-sm"
                    >
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;