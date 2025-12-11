import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, 
  XCircle, 
  Clock, 
  Target, 
  ArrowRight,
  CheckCircle,
  Loader2
} from "lucide-react";

interface ExamResult {
  id: string;
  score: number | null;
  total_points: number | null;
  passed: boolean | null;
  start_time: string;
  end_time: string | null;
  answers?: any;
  exam: {
    title: string;
    description: string | null;
    pass_threshold: number;
  };
}

const ExamResults = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadResult();
  }, [attemptId, user, authLoading]);

  const loadResult = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          id,
          score,
          total_points,
          passed,
          start_time,
          end_time,
          exam:exams (
            title,
            description,
            pass_threshold
          )
        `)
        .eq('id', attemptId)
        .eq('student_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        navigate('/dashboard');
        return;
      }

      setResult(data as unknown as ExamResult);
      // fetch questions for review
      try {
        const { data: qData, error: qError } = await supabase
          .from('questions')
          .select('*')
          .eq('exam_id', data.exam.id)
          .order('order_index');

        if (qError) throw qError;
        setQuestions((qData || []) as any[]);
      } catch (err) {
        console.error('Error loading questions for review:', err);
      }
    } catch (error) {
      console.error('Error loading result:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTimeTaken = () => {
    if (!result?.start_time || !result?.end_time) return "N/A";
    const diff = new Date(result.end_time).getTime() - new Date(result.start_time).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const isCorrect = (question: any, userAnswer: any) => {
    if (userAnswer === undefined || userAnswer === null || userAnswer === "") return false;

    const qdata = question.question_data || {};
    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer === qdata.correctAnswer;
      case 'fill_blank':
      case 'complete': {
        const correct = (qdata.correctAnswer || '').toString();
        const ua = (userAnswer || '').toString();
        if (qdata.caseSensitive) return ua === correct;
        return ua.toLowerCase() === correct.toLowerCase();
      }
      case 'matching': {
        const pairs = qdata.pairs || [];
        if (!pairs.length || typeof userAnswer !== 'object') return false;
        let correctMatches = 0;
        Object.entries(userAnswer).forEach(([leftIdx, rightIdx]) => {
          if (parseInt(leftIdx as string) === rightIdx) correctMatches++;
        });
        return correctMatches === pairs.length;
      }
      case 'translate': {
        const correct = (qdata.correctAnswer || '').toString().trim().toLowerCase();
        const ua = (userAnswer || '').toString().trim().toLowerCase();
        return ua === correct;
      }
      default:
        return false;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 bg-gradient-card border-0 shadow-medium">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const score = result.score || 0;
  const passed = result.passed;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8 bg-gradient-card border-0 shadow-medium text-center">
        {/* Result Icon */}
        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
          passed ? 'bg-success/20' : 'bg-destructive/20'
        }`}>
          {passed ? (
            <Trophy className="w-12 h-12 text-success" />
          ) : (
            <XCircle className="w-12 h-12 text-destructive" />
          )}
        </div>

        {/* Title */}
        <h1 className={`text-3xl font-bold mb-2 ${
          passed ? 'text-success' : 'text-destructive'
        }`}>
          {passed ? 'Congratulations!' : 'Better Luck Next Time'}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {passed 
            ? 'You have successfully passed the exam!' 
            : 'You did not reach the passing score.'}
        </p>

        {/* Exam Title */}
        <p className="text-lg font-medium text-foreground mb-8">
          {result.exam.title}
        </p>

        {/* Score Display */}
        <div className="mb-8">
          <div className="text-5xl font-bold text-foreground mb-2">
            {score.toFixed(1)}%
          </div>
          <Progress 
            value={score} 
            className={`h-3 ${passed ? '[&>div]:bg-success' : '[&>div]:bg-destructive'}`} 
          />
          <p className="text-sm text-muted-foreground mt-2">
            Passing score: {result.exam.pass_threshold}%
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-muted/50 border-0">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time Taken</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{getTimeTaken()}</p>
          </Card>
          
          <Card className="p-4 bg-muted/50 border-0">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status</span>
            </div>
            <p className={`text-lg font-semibold ${passed ? 'text-success' : 'text-destructive'}`}>
              {passed ? 'Passed' : 'Failed'}
            </p>
          </Card>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => navigate('/dashboard')}
          variant="hero"
          size="lg"
          className="w-full"
        >
          Continue to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        {/* Review Section */}
        <div className="mt-8 text-left">
          <h2 className="text-xl font-semibold mb-4">Review Questions</h2>
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions available for review.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => {
                const userAnswer = (result as any).answers?.[q.id];
                const correct = isCorrect(q, userAnswer);
                return (
                  <Card key={q.id} className="p-4 bg-muted/30 border-0">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {correct ? (
                          <CheckCircle className="w-6 h-6 text-success" />
                        ) : (
                          <XCircle className="w-6 h-6 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-1">{q.question_text}</p>
                        <div className="text-sm text-muted-foreground mb-2">
                          <p><strong>Your answer:</strong> {typeof userAnswer === 'object' ? JSON.stringify(userAnswer) : (userAnswer ?? '—')}</p>
                          <p><strong>Correct answer:</strong> {q.question_data?.correctAnswer ?? '—'}</p>
                        </div>
                        <p className={`text-sm ${correct ? 'text-success' : 'text-destructive'}`}>
                          {correct ? 'Correct — good job!' : 'Incorrect — review this topic and try similar questions to improve.'}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExamResults;
