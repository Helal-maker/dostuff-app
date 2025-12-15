import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Users, 
  BarChart3, 
  Plus, 
  Share2, 
  Eye, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Trophy,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamData {
  id: string;
  title: string;
  description?: string;
  language: string;
  created_at: string;
  is_published: boolean;
  share_link?: string;
  question_count: number;
  attempt_count: number;
  average_score?: number;
  completion_rate?: number;
  status: 'draft' | 'published' | 'archived';
}

interface ExamOverviewGridProps {
  exams: ExamData[];
  onCreateExam: () => void;
  onViewAnalytics: (examId: string) => void;
  onShareExam: (shareLink: string) => void;
  onViewExam: (examId: string) => void;
  className?: string;
}

const ExamOverviewGrid: React.FC<ExamOverviewGridProps> = ({
  exams,
  onCreateExam,
  onViewAnalytics,
  onShareExam,
  onViewExam,
  className
}) => {
  const totalExams = exams.length;
  const totalAttempts = exams.reduce((acc, exam) => acc + exam.attempt_count, 0);
  const publishedExams = exams.filter(exam => exam.is_published).length;
  const averageScore = exams.length > 0 
    ? Math.round(exams.reduce((acc, exam) => acc + (exam.average_score || 0), 0) / exams.length)
    : 0;

  const getStatusBadge = (exam: ExamData) => {
    if (!exam.is_published) {
      return <Badge variant="secondary" className="text-xs">Draft</Badge>;
    }
    return <Badge variant="default" className="text-xs bg-success/10 text-success">Published</Badge>;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreIcon = (score?: number) => {
    if (!score) return null;
    if (score >= 80) return <Trophy className="w-4 h-4 text-success" />;
    if (score >= 60) return <Target className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Exam Dashboard</h1>
          <p className="text-muted-foreground">Manage your exams and track student progress</p>
        </div>
        <Button
          onClick={onCreateExam}
          variant="hero"
          size="lg"
          className="shrink-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Exam
        </Button>
      </div>

      {/* Responsive Grid Layout: Two-up, one-down configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
        {/* Row 1: Total Exams (prominently displayed - spans 2 columns on large screens) */}
        <Card className="lg:col-span-2 p-6 bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-all duration-300 group">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Book className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Exams</p>
                <p className="text-4xl font-bold text-foreground">{totalExams}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-muted-foreground">{publishedExams} Published</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-xs text-muted-foreground">{totalExams - publishedExams} Drafts</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2">
              <TrendingUp className="w-8 h-8 text-primary/50" />
              <p className="text-xs text-muted-foreground">Overview</p>
            </div>
          </div>
        </Card>

        {/* Row 1: Average Score */}
        <Card className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-all duration-300 group">
          <div className="flex items-center gap-4 h-full">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center group-hover:bg-warning/20 transition-colors">
              <BarChart3 className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Average Score</p>
              <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">Across all exams</p>
            </div>
          </div>
        </Card>

        {/* Row 2: Total Attempts (full width) */}
        <Card className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-all duration-300 group">
          <div className="flex items-center gap-4 h-full">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Total Attempts</p>
              <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
              <p className="text-xs text-muted-foreground mt-1">Student submissions</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exams List with Responsive Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Your Exams</h2>
          <p className="text-sm text-muted-foreground">{exams.length} exam{exams.length !== 1 ? 's' : ''}</p>
        </div>

        {exams.length === 0 ? (
          <Card className="p-12 bg-gradient-card border-0 shadow-medium text-center">
            <Book className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No exams yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first exam to get started with engaging assessments
            </p>
            <Button
              onClick={onCreateExam}
              variant="hero"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Exam
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card
                key={exam.id}
                className={cn(
                  "p-6 bg-gradient-card border-0 shadow-medium",
                  "hover:shadow-strong transition-all duration-300 group",
                  "focus-within:ring-2 focus-within:ring-primary/50"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {exam.title}
                    </h3>
                    {exam.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(exam)}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4" />
                      Questions
                    </span>
                    <span className="font-medium text-foreground">{exam.question_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Attempts
                    </span>
                    <span className="font-medium text-foreground">{exam.attempt_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Created
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {exam.average_score && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        {getScoreIcon(exam.average_score)}
                        Avg. Score
                      </span>
                      <span className={cn("font-medium", getScoreColor(exam.average_score))}>
                        {exam.average_score}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => onViewAnalytics(exam.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    onClick={() => onViewExam(exam.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {exam.share_link && (
                    <Button
                      onClick={() => onShareExam(exam.share_link)}
                      variant="outline"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamOverviewGrid;