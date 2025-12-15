import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ExamResult {
  id: string;
  score: number | null;
  total_points: number | null;
  passed: boolean | null;
  start_time: string;
  end_time: string | null;
  answers?: any;
  exam: {
    id: string;
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
            id,
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
        if (data.exam && typeof data.exam === 'object' && 'id' in data.exam) {
          const { data: qData, error: qError } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', (data.exam as any).id)
            .order('order_index');

          if (qError) throw qError;
          setQuestions((qData || []) as any[]);
        }
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
    if (!result?.start_time || !result?.end_time) return "0m 0s";
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
      <div className="bg-gradient-to-br from-violet-600 via-cyan-400 to-amber-300 min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl shadow-2xl text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-32 mx-auto"></div>
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
    <div className="bg-gradient-to-br from-violet-600 via-cyan-400 to-amber-300 min-h-screen font-display flex items-center justify-center p-4 text-slate-800 antialiased">
      <main className="w-full max-w-[400px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative animate-pop-in flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-violet-500 to-green-500 opacity-50"></div>
        
        <div className="p-8 pb-4 flex flex-col items-center text-center space-y-6 flex-grow">
          {/* Trophy Animation */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2 animate-float">
              <span className="material-icons-round text-5xl text-green-500 drop-shadow-sm">emoji_events</span>
            </div>
            <span className="material-icons-round text-yellow-400 absolute -top-2 -right-2 text-xl animate-pulse" style={{animationDelay: '0.2s'}}>auto_awesome</span>
            <span className="material-icons-round text-yellow-400 absolute bottom-0 -left-2 text-sm animate-pulse" style={{animationDelay: '0.5s'}}>star</span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className={`text-3xl font-bold tracking-tight ${
              passed ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {passed ? 'Congratulations!' : 'Exam Completed'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              {passed 
                ? 'You have successfully passed the exam!' 
                : 'Keep practicing to improve your score!'}
            </p>
          </div>

          {/* Exam Badge */}
          <div className="text-slate-800 dark:text-slate-200 font-semibold tracking-wide uppercase text-xs bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">
            {result.exam.title}
          </div>

          {/* Score Display */}
          <div className="w-full space-y-2">
            <div className="text-6xl font-extrabold text-slate-900 dark:text-white tracking-tighter tabular-nums">
              {score.toFixed(1)}<span className="text-3xl text-slate-400">%</span>
            </div>
            <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000 ${
                  passed ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium pt-1">
              Passing score: {result.exam.pass_threshold}%
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 transition hover:scale-[1.02] cursor-default">
              <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
                <span className="material-icons-round text-sm">schedule</span>
                <span>Time</span>
              </div>
              <span className="text-slate-800 dark:text-white font-bold text-lg">{getTimeTaken()}</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 transition hover:scale-[1.02] cursor-default">
              <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
                <span className="material-icons-round text-sm">check_circle</span>
                <span>Status</span>
              </div>
              <span className={`font-bold text-lg ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {passed ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-violet-500/30 dark:shadow-violet-900/40 transform transition hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center group mt-2"
          >
            <span>Continue to Dashboard</span>
            <span className="material-icons-round ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Button>

          {/* Divider */}
          <div className="w-full h-px bg-slate-100 dark:bg-slate-700/50 my-2"></div>

          {/* Review Section */}
          <div className="w-full text-left pb-4">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2 flex items-center">
              <span className="material-icons-round mr-2 text-violet-600">quiz</span>
              Review Questions
            </h3>
            {questions.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 dark:text-slate-500 text-sm">
                  No questions available for review.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {questions.slice(0, 5).map((q) => {
                  const userAnswer = (result as any).answers?.[q.id];
                  const correct = isCorrect(q, userAnswer);
                  return (
                    <div key={q.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {correct ? (
                            <span className="material-icons-round text-green-500 text-lg">check_circle</span>
                          ) : (
                            <span className="material-icons-round text-red-500 text-lg">cancel</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1 truncate">
                            {q.question_text}
                          </p>
                          <p className={`text-xs ${correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {correct ? 'Correct' : 'Incorrect'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {questions.length > 5 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2">
                    +{questions.length - 5} more questions
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dark Mode Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg text-slate-800 dark:text-white hover:scale-110 transition-transform border-0"
        >
          <span className="material-icons-round dark:hidden">dark_mode</span>
          <span className="hidden dark:block material-icons-round">light_mode</span>
        </Button>
      </div>
    </div>
  );
};

export default ExamResults;
