import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ExamQuestionRenderer from "@/components/exam/ExamQuestionRenderer";

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
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Set timer if exam has time limit
      if (examData.time_limit) {
        setTimeRemaining(examData.time_limit * 60); // Convert minutes to seconds
      }

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
      const { earnedPoints, totalPoints } = calculateScore();
      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = score >= 50; // 50% pass threshold

      const { data: updatedAttempt, error } = await supabase
        .from('exam_attempts')
        .update({
          answers,
          score: Math.round(score * 100) / 100, // Round to 2 decimal places
          total_points: Math.round(totalPoints * 100) / 100, // Round to 2 decimal places
          is_completed: true,
          passed,
          end_time: new Date().toISOString()
        })
        .eq('id', attempt.id)
        .select()
        .single();

      if (error) throw error;

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

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 min-h-screen text-white">
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
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
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
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
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