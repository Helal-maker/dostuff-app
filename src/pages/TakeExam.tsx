import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ExamQuestionRenderer from "@/components/exam/ExamQuestionRenderer";
import {
  initializeAntiCheating,
  disableAntiCheating,
  questionTimeTracker,
  suspiciousBehaviorDetector,
  tabSwitchDetector,
  logExamAttemptDevice,
  randomizeExamQuestions,
  fullScreenProtection
} from "@/lib/anti-cheating";
import { examViolationTracker } from "@/lib/anti-cheating/violation-tracker";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  language: string;
  time_limit: number | null;
  max_attempts: number;
  is_published: boolean;
  share_link: string | null;
  teacher_id: string;
}

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_data: any;
  points: number;
  order_index: number;
}

interface ExamAttempt {
  id: string;
  answers: any;
  is_completed: boolean;
  score: number | null;
  total_points: number | null;
}

const TakeExam = () => {
  const { shareLink } = useParams<{ shareLink: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [randomizedQuestions, setRandomizedQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [lastViolationType, setLastViolationType] = useState<string>('');

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    loadExam();
  }, [shareLink, user, authLoading]);

  useEffect(() => {
    // Initialize anti-cheating features when exam starts
    if (!examStarted || !exam || !user) return;

    initializeAntiCheating({
      copyPasteProtection: true,
      fullScreenMode: true,
      rightClickDisabled: true,
      detectTabSwitch: true,
      browserLock: true
    });

    // Setup violation handlers
    examViolationTracker.config.onFirstViolation = (v) => {
      setLastViolationType(v.type);
      setShowViolationWarning(true);
      toast({
        title: '⚠️ Warning',
        description: `Violation detected: ${v.type}. One more violation will fail the exam.`,
        variant: 'destructive'
      });
    };

    examViolationTracker.config.onSecondViolation = () => {
      handleExamTermination();
    };

    // Fullscreen exit
    fullScreenProtection.config.onExit = () => {
      examViolationTracker.recordViolation('fullscreen-exit', 'Exited full-screen mode');
    };

    // Tab switch
    tabSwitchDetector.config.onViolation = () => {
      examViolationTracker.recordViolation('tab-switch', 'Switched tabs');
    };

    if (randomizedQuestions.length > 0) {
      questionTimeTracker.startQuestion(randomizedQuestions[currentQuestionIndex].id);
    }

    return () => {
      disableAntiCheating();
    };
  }, [examStarted, exam, user]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          submitExam();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const loadExam = async () => {
    try {
      // Find exam by share link
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('share_link', shareLink)
        .eq('is_published', true)
        .single();

      if (examError) {
        setError("Exam not found or inactive");
        return;
      }

      // Get questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examData.id)
        .order('order_index');

      if (questionsError) throw questionsError;

      // Check existing attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examData.id)
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      // Check if user has exceeded attempt limit
      if (attemptsData && attemptsData.length > (examData.max_attempts || 1)) {
        const lastAttempt = attemptsData[0];
        if (lastAttempt.is_completed) {
          setError("You have reached the maximum number of attempts for this exam");
          return;
        }
        setAttempt(lastAttempt as ExamAttempt);
        setAnswers((lastAttempt.answers as { [key: string]: any }) || {});
      } else {
        // Create new attempt
        const { data: newAttempt, error: attemptError } = await supabase
          .from('exam_attempts')
          .insert({
            exam_id: examData.id,
            student_id: user!.id,
            answers: {}
          })
          .select()
          .single();

        if (attemptError) throw attemptError;
        setAttempt(newAttempt as ExamAttempt);
      }

      setExam(examData as Exam);
      setQuestions((questionsData || []) as Question[]);

      // Randomize questions for anti-cheating
      const randomized = randomizeExamQuestions((questionsData || []) as Question[], false);
      setRandomizedQuestions(randomized);

      // Set timer if exam has time limit
      if (examData.time_limit) {
        setTimeRemaining(examData.time_limit * 60); // Convert minutes to seconds
      }

      // Mark exam as started to trigger anti-cheating initialization
      setExamStarted(true);

      // Log device information for anti-cheating
      await logExamAttemptDevice(examData.id, user!.id, supabase);

    } catch (error) {
      console.error('Error loading exam:', error);
      setError("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId: string, answer: any) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Track answer changes for suspicious behavior detection
    questionTimeTracker.recordAnswerChange(questionId);
    
    // Save answer to database
    if (attempt) {
      supabase
        .from('exam_attempts')
        .update({ answers: newAnswers })
        .eq('id', attempt.id)
        .then(({ error }) => {
          if (error) console.error('Error saving answer:', error);
        });
    }
  };

  const handleNavigatePrevious = () => {
    if (currentQuestionIndex > 0) {
      if (randomizedQuestions.length > 0) {
        questionTimeTracker.endQuestion(randomizedQuestions[currentQuestionIndex].id);
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      if (randomizedQuestions.length > 0) {
        questionTimeTracker.startQuestion(randomizedQuestions[currentQuestionIndex - 1].id);
      }
    }
  };

  const handleNavigateNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      if (randomizedQuestions.length > 0) {
        questionTimeTracker.endQuestion(randomizedQuestions[currentQuestionIndex].id);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if (randomizedQuestions.length > 0) {
        questionTimeTracker.startQuestion(randomizedQuestions[currentQuestionIndex + 1].id);
      }
    }
  };

  const handleExamTermination = async () => {
    if (!attempt || !exam) return;

    setIsSubmitting(true);
    const reason = examViolationTracker.getReason();

    try {
      await supabase
        .from('exam_attempts')
        .update({
          is_completed: true,
          score: 0,
          total_points: questions.reduce((sum, q) => sum + q.points, 0),
          passed: false,
          end_time: new Date().toISOString(),
          answers: { __terminated: true, reason }
        })
        .eq('id', attempt.id);

      // Flag as violation
      await supabase
        .from('exam_flagged_attempts')
        .insert({
          exam_id: exam.id,
          user_id: user!.id,
          risk_level: 'high',
          flags: examViolationTracker.getViolations(),
          analysis: { reason, violations: examViolationTracker.getViolations() }
        })
        .catch(err => console.warn('Could not log violation:', err));

      disableAntiCheating();

      toast({
        title: '❌ Exam Terminated',
        description: reason,
        variant: 'destructive'
      });

      navigate(`/exam-results/${attempt.id}`);
    } catch (error) {
      console.error('Error terminating exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      totalPoints += question.points;
      const answer = answers[question.id];
      
      if (answer !== undefined && answer !== null && answer !== "") {
        switch (question.question_type) {
          case "multiple_choice":
            if (answer === question.question_data.correctAnswer) {
              earnedPoints += question.points;
            }
            break;
          case "true_false":
            if (answer === question.question_data.correctAnswer) {
              earnedPoints += question.points;
            }
            break;
          case "fill_blank":
          case "complete":
            const correctAnswer = question.question_data.correctAnswer?.toLowerCase() || "";
            const userAnswer = answer?.toString().toLowerCase() || "";
            if (question.question_data.caseSensitive ? 
                answer === question.question_data.correctAnswer : 
                userAnswer === correctAnswer) {
              earnedPoints += question.points;
            }
            break;
          case "matching":
            // For matching, check each pair
            const pairs = question.question_data.pairs || [];
            let correctMatches = 0;
            if (typeof answer === 'object' && answer !== null) {
              Object.entries(answer).forEach(([leftIdx, rightIdx]) => {
                // Correct match means left index equals right index (original pair)
                if (parseInt(leftIdx as string) === rightIdx) {
                  correctMatches++;
                }
              });
            }
            // Partial credit based on correct matches
            if (pairs.length > 0) {
              earnedPoints += (correctMatches / pairs.length) * question.points;
            }
            break;
          case "translate":
            const correctTranslation = question.question_data.correctAnswer?.toLowerCase().trim() || "";
            const userTranslation = answer?.toString().toLowerCase().trim() || "";
            if (userTranslation === correctTranslation) {
              earnedPoints += question.points;
            }
            break;
        }
      }
    });

    return { earnedPoints, totalPoints };
  };

  const submitExam = async () => {
    if (!attempt || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // End tracking for the last question
      if (randomizedQuestions.length > 0) {
        questionTimeTracker.endQuestion(randomizedQuestions[currentQuestionIndex].id);
      }

      const { earnedPoints, totalPoints } = calculateScore();
      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = score >= 50; // 50% pass threshold

      // Analyze suspicious behavior
      const stats = questionTimeTracker.getStatistics();
      const behaviorAnalysis = suspiciousBehaviorDetector.analyzeBehavior({
        score: earnedPoints,
        totalPoints,
        timeTaken: Math.round((Date.now() - parseInt(attempt.id)) / 1000), // Approximate time
        questionCount: questions.length,
        tabSwitches: tabSwitchDetector.getTabSwitchCount(),
        fullscreenExits: 0, // Would need separate tracking
        copyAttempts: 0, // Copy is blocked but logged in JS console
        rushingCount: stats.rushingQuestions,
        questionPerformance: questions.map(q => ({
          difficulty: q.points > 5 ? 'hard' : 'easy',
          correct: answers[q.id] === q.question_data.correctAnswer
        }))
      });

      // Prepare exam attempt update with anti-cheating data
      const updateData: any = {
        answers,
        score: Math.round(score * 100) / 100,
        total_points: Math.round(totalPoints * 100) / 100,
        is_completed: true,
        passed,
        end_time: new Date().toISOString(),
        // Anti-cheating metadata
        tab_switches: tabSwitchDetector.getTabSwitchCount(),
        time_metrics: JSON.stringify(stats),
        suspicious_behavior_score: behaviorAnalysis.overallScore,
        suspicious_behavior_flags: JSON.stringify(behaviorAnalysis.flags)
      };

      // Update exam attempt
      const { data: updatedAttempt, error } = await supabase
        .from('exam_attempts')
        .update(updateData)
        .eq('id', attempt.id)
        .select()
        .single();

      if (error) throw error;

      // Log flagged attempts for high-risk behavior
      if (behaviorAnalysis.riskLevel === 'high' || behaviorAnalysis.overallScore >= 60) {
        await supabase
          .from('exam_flagged_attempts')
          .insert({
            exam_id: exam!.id,
            user_id: user!.id,
            risk_level: behaviorAnalysis.riskLevel,
            flags: behaviorAnalysis.flags,
            analysis: behaviorAnalysis
          })
          .catch(err => console.warn('Could not log flagged attempt:', err));
      }

      // Console log for testing
      console.log('📊 Exam Completed - Anti-Cheating Analysis:', {
        riskLevel: behaviorAnalysis.riskLevel,
        suspiciousScore: behaviorAnalysis.overallScore,
        tabSwitches: tabSwitchDetector.getTabSwitchCount(),
        rushingQuestions: stats.rushingQuestions,
        recommendation: behaviorAnalysis.recommendation
      });

      toast({
        title: passed ? "Congratulations!" : "Exam Submitted",
        description: passed 
          ? `You passed with ${score.toFixed(1)}%!` 
          : `Your score: ${score.toFixed(1)}%. You need 50% to pass.`,
        variant: passed ? "default" : "destructive",
      });

      // Navigate to results page
      navigate(`/exam-results/${attempt.id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl shadow-2xl text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-32 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 text-red-400 mx-auto mb-4 flex items-center justify-center">
            <span className="material-icons-round text-4xl">error</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/10 text-white font-semibold py-3 px-6 rounded-2xl transition-all active:scale-95"
          >
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!exam || !questions.length || !attempt) {
    return null;
  }

  // Check for termination
  if (examViolationTracker.shouldTerminate() && !isSubmitting) {
    handleExamTermination();
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 rounded-3xl shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 text-red-400 mx-auto mb-4">
            <span className="material-icons-round text-4xl">block</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Exam Terminated</h2>
          <p className="text-white/80 mb-6">{examViolationTracker.getReason()}</p>
          <p className="text-yellow-300 text-sm">Submitting exam...</p>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const displayQuestions = randomizedQuestions.length > 0 ? randomizedQuestions : questions;
  const currentQuestion = displayQuestions[currentQuestionIndex];

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 min-h-screen text-white">
      {/* Violation Warning Modal */}
      {showViolationWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-red-600/95 border-red-400 rounded-3xl shadow-2xl max-w-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-400/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="material-icons-round text-yellow-300 text-4xl">warning</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">⚠️ Warning</h3>
              <p className="text-white/90 mb-6">
                You exited full-screen or switched tabs. <strong>One more violation will terminate your exam.</strong>
              </p>
              <Button
                onClick={() => setShowViolationWarning(false)}
                className="bg-white text-red-600 hover:bg-white/90 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
              >
                Continue Exam
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-md mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 pt-8 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
              <p className="text-white/80 font-medium mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            {timeRemaining !== null && (
              <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 border border-white/10 shadow-sm">
                <span className="material-icons-round text-yellow-300 text-sm">timer</span>
                <span className="font-bold text-sm tracking-wide">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs font-medium text-white/90 mb-2 px-1">
              <span>Progress: {Math.round(progress)}%</span>
              <span>{questions.length - currentQuestionIndex - 1} questions remaining</span>
            </div>
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </header>

        {/* Question */}
        <main className="flex-1 px-4 pb-8 flex flex-col justify-center">
          <ExamQuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={(answer) => updateAnswer(currentQuestion.id, answer)}
            language={exam.language}
          />
        </main>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentQuestionIndex
                  ? 'bg-white shadow-lg scale-110'
                  : answers[questions[index].id] !== undefined
                  ? 'bg-white/70'
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <footer className="px-6 pb-8">
          <div className="flex gap-4">
            <Button
              onClick={handleNavigatePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white font-semibold flex items-center justify-center transition-all active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons-round mr-2 group-hover:-translate-x-1 transition-transform text-lg">arrow_back</span>
              Previous
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={submitExam}
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-2xl bg-white text-purple-600 font-bold flex items-center justify-center shadow-lg transition-all active:scale-95 group hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-icons-round mr-2 animate-spin text-lg">hourglass_empty</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Exam
                    <span className="material-icons-round ml-2 group-hover:translate-x-1 transition-transform text-lg">check_circle</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNavigateNext}
                className="flex-1 py-4 px-6 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white font-semibold flex items-center justify-center shadow-lg transition-all active:scale-95 group"
              >
                Next
                <span className="material-icons-round ml-2 group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TakeExam;