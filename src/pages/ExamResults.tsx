import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getAttemptAnalytics } from "@/lib/anti-cheating";

interface ExamResult {
  id: string;
  score: number | null;
  total_points: number | null;
  passed: boolean | null;
  start_time: string;
  end_time: string | null;
  answers?: any;
  is_terminated?: boolean;
  termination_reason?: string;
  violation_details?: any;
  failure_reason?: string;
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
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);

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
          answers,
          is_terminated,
          termination_reason,
          violation_details,
          failure_reason,
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

      // Load attempt analytics (security events)
      const analyticsData = await getAttemptAnalytics(attemptId!);
      setSecurityEvents(analyticsData.securityEvents || []);

      // Fetch questions for review
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
      case 'paragraph': {
        const subQuestions = qdata.subQuestions || [];
        if (!Array.isArray(userAnswer)) return false;
        
        let allCorrect = true;
        subQuestions.forEach((subQ: any, idx: number) => {
          const subAnswer = userAnswer[idx];
          if (subAnswer === undefined || subAnswer === null || subAnswer === "") {
            allCorrect = false;
            return;
          }
          
          if (subQ.type === "multiple_choice") {
            if (subAnswer !== subQ.correctOptionIndex) {
              allCorrect = false;
            }
          } else {
            const correctAns = (subQ.answer || "").toLowerCase().trim();
            const userAns = (subAnswer || "").toString().toLowerCase().trim();
            if (correctAns !== userAns) {
              allCorrect = false;
            }
          }
        });
        return allCorrect;
      }
      default:
        return false;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const score = result.score || 0;
  const passed = result.passed;
  const userAnswers = (result as any).answers || {};

  // Count correct and incorrect answers
  const correctCount = questions.filter(q => isCorrect(q, userAnswers[q.id])).length;
  const incorrectCount = questions.length - correctCount;
  const timeTaken = getTimeTaken();

  // Calculate circle progress (circumference = 2 * PI * 84 ≈ 527)
  const circumference = 2 * Math.PI * 84;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mx-auto">
        
        {/* Left Column - Results Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main Congratulations Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-soft-green dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              {/* Trophy Icon */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-glow mb-6 transform transition hover:scale-105 duration-300 ${
                passed 
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                  : 'bg-gradient-to-br from-orange-400 to-red-500'
              }`}>
                <span className="material-icons-round text-white text-4xl">
                  {passed ? 'emoji_events' : 'school'}
                </span>
              </div>
              
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                {passed ? 'Congratulations!' : 'Exam Completed'}
              </h1>
              <p className="text-text-muted-light dark:text-text-muted-dark mb-6 text-sm leading-relaxed max-w-xs mx-auto">
                {passed 
                  ? 'You have successfully passed the exam! Great job on your performance.'
                  : 'Keep practicing to improve your score. Every attempt is a learning opportunity!'}
              </p>
              
              {/* Exam Badge */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-8 border border-gray-200 dark:border-gray-700">
                {result.exam.title}
              </div>
              
              {/* Score Circle */}
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full blur-2xl transform scale-110 ${
                  passed ? 'bg-emerald-500/10' : 'bg-orange-500/10'
                }`}></div>
                <svg className="transform -rotate-90 w-full h-full drop-shadow-sm" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: passed ? '#34d399' : '#fb923c', stopOpacity: 1 }}></stop>
                      <stop offset="100%" style={{ stopColor: passed ? '#059669' : '#dc2626', stopOpacity: 1 }}></stop>
                    </linearGradient>
                  </defs>
                  <circle 
                    className="dark:stroke-gray-800" 
                    cx="100" cy="100" 
                    fill="none" r="84" 
                    stroke="#f1f5f9" 
                    strokeWidth="10"
                  ></circle>
                  <circle 
                    cx="100" cy="100" 
                    fill="none" r="84" 
                    stroke="url(#scoreGradient)" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" 
                    strokeWidth="14"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0px 4px 6px rgba(${passed ? '16, 185, 129' : '249, 115, 22'}, 0.25))` }}
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center pb-2">
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                    {score.toFixed(0)}
                  </span>
                  <span className={`text-xl font-bold -mt-1 ${
                    passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'
                  }`}>%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full max-w-xs mb-2">
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      passed 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                        : 'bg-gradient-to-r from-orange-400 to-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium text-text-muted-light dark:text-text-muted-dark">
                  <span>Score</span>
                  <span>Passing: {result.exam.pass_threshold}%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-soft text-center border-b-4 border-emerald-500">
              <div className="mb-2 inline-flex p-2 rounded-full bg-soft-green dark:bg-emerald-900/30">
                <span className="material-icons-round text-emerald-600 dark:text-emerald-400 text-lg">check_circle</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{correctCount}</div>
              <div className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wide">Correct</div>
            </div>
            
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-soft text-center border-b-4 border-red-400">
              <div className="mb-2 inline-flex p-2 rounded-full bg-soft-red dark:bg-red-900/30">
                <span className="material-icons-round text-red-500 dark:text-red-400 text-lg">cancel</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{incorrectCount}</div>
              <div className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wide">Wrong</div>
            </div>
            
            <div className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-soft text-center border-b-4 border-blue-400">
              <div className="mb-2 inline-flex p-2 rounded-full bg-soft-blue dark:bg-blue-900/30">
                <span className="material-icons-round text-blue-500 dark:text-blue-400 text-lg">timer</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white pt-1">{timeTaken}</div>
              <div className="text-xs font-bold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wide mt-1">Time</div>
            </div>
          </div>
          
          {/* Continue Button */}
          <button 
            onClick={() => navigate('/dashboard')}
            className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group ${
              passed 
                ? 'bg-primary hover:bg-emerald-600 text-white hover:shadow-emerald-500/30'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/30'
            }`}
          >
            Continue to Dashboard
            <span className="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
        
        {/* Right Column - Security Events & Review */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">
          
          {/* Security Events Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-icons-round text-blue-500">security</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Security Events ({securityEvents.length})
              </h3>
            </div>
            
            {securityEvents.length > 0 ? (
              <div className="space-y-3">
                {securityEvents.map((event: any, idx: number) => (
                  <div 
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex justify-between items-center border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                        {event.event_type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        Triggered during exam
                      </span>
                    </div>
                    <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-md">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
                <span className="material-icons-round text-emerald-500 text-2xl mb-2">verified</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No security violations detected during your exam.
                </p>
              </div>
            )}
          </div>
          
          {/* Termination/Violation Notice */}
          {result?.is_terminated && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-soft p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="material-icons-round text-red-500 mt-1">warning</span>
                <div className="flex-1">
                  <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Exam Terminated</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {result.termination_reason || "Exam was terminated due to rule violations"}
                  </p>
                  {result.violation_details?.rules_broken && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 mt-2">
                      <p className="text-xs font-semibold text-red-500 mb-2">Rules Broken:</p>
                      <ul className="space-y-1">
                        {result.violation_details.rules_broken.map((rule: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <span className="material-icons-round text-sm mr-2 text-red-500">close</span>
                            {rule.replace(/-/g, ' ').toUpperCase()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Review Questions Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft p-6 flex-grow flex flex-col border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <span className="material-icons-round">library_books</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Review Questions <span className="text-text-muted-light font-normal text-sm ml-1">({questions.length})</span>
                </h3>
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-[400px] lg:max-h-none lg:flex-grow">
              {questions.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                  <span className="material-icons-round text-gray-400 text-3xl mb-2">quiz</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No questions available for review.
                  </p>
                </div>
              ) : (
                questions.map((q, idx) => {
                  const userAnswer = userAnswers[q.id];
                  const correct = isCorrect(q, userAnswer);
                  return (
                    <div 
                      key={q.id}
                      className={`p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <span className={`material-icons-round text-xl ${
                            correct ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                            {correct ? 'check_circle' : 'cancel'}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {idx + 1}. {q.question_text}
                          </p>
                          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                            correct 
                              ? 'bg-soft-green dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                              : 'bg-soft-red dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'
                          }`}>
                            <span className="material-icons-round text-xs">
                              {correct ? 'done' : 'close'}
                            </span>
                            {correct ? 'Correct' : 'Incorrect'}
                          </div>
                          {!correct && q.question_data?.correctAnswer && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Correct answer:</span> {q.question_data.correctAnswer}
                            </div>
                          )}
                        </div>
                        <span className="material-icons-round text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors cursor-pointer">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
