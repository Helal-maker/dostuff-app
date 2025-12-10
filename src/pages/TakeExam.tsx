import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
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
  const { user } = useAuth();

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
    if (!user) {
      navigate('/auth');
      return;
    }
    loadExam();
  }, [shareLink, user]);

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

      // Check if user has reached attempt limit
      if (attemptsData && attemptsData.length >= (examData.max_attempts || 1)) {
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
          // Add more scoring logic for other question types
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

      const { error } = await supabase
        .from('exam_attempts')
        .update({
          answers,
          score,
          total_points: totalPoints,
          is_completed: true,
          passed,
          end_time: new Date().toISOString()
        })
        .eq('id', attempt.id);

      if (error) throw error;

      toast({
        title: passed ? "Congratulations!" : "Exam Submitted",
        description: passed 
          ? `You passed with ${score.toFixed(1)}%!` 
          : `Your score: ${score.toFixed(1)}%. You need 50% to pass.`,
        variant: passed ? "default" : "destructive",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam",
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
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 bg-gradient-card border-0 shadow-medium text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 bg-gradient-card border-0 shadow-medium text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')} variant="hero">
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
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{exam.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
              <span className={`font-mono font-semibold ${timeRemaining < 300 ? 'text-destructive' : 'text-foreground'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Progress: {Math.round(progress)}%</span>
            <span>{questions.length - currentQuestionIndex - 1} questions remaining</span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 bg-gradient-card border-0 shadow-medium mb-8">
          <ExamQuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={(answer) => updateAnswer(currentQuestion.id, answer)}
            language={exam.language}
          />
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="lg"
          >
            Previous
          </Button>

          <div className="flex gap-3">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={submitExam}
                disabled={isSubmitting}
                variant="hero"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Exam"}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                variant="hero"
                size="lg"
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="flex justify-center mt-8 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary'
                  : answers[questions[index].id] !== undefined
                  ? 'bg-success'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;