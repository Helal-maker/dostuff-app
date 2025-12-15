import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Users, Eye, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import ExamQuestionRenderer from "./ExamQuestionRenderer";

interface Question {
  id: string;
  type: "multiple_choice" | "fill_blank" | "written" | "poll" | "true_false" | "complete" | "matching" | "translate" | "paragraph";
  text: string;
  data: any;
  points: number;
  orderIndex: number;
}

interface ExamForm {
  title: string;
  description: string;
  language: "english" | "arabic";
  timeLimit: number | null;
  maxAttempts: number;
  isPublished: boolean;
}

interface Props {
  exam: ExamForm;
  questions: Question[];
  onClose: () => void;
}

const PreviewExam = ({ exam, questions, onClose }: Props) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Multiple Choice";
      case "fill_blank": return "Fill in the Blank";
      case "translate": return "Translation";
      case "true_false": return "True or False";
      case "paragraph": return "Reading Comprehension";
      case "poll": return "Team Vote";
      case "matching": return "Matching";
      case "complete": return "Complete the Sentence";
      case "written": return "Written Response";
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const renderQuestionForPreview = () => {
    if (!currentQuestion) return null;

    const question = {
      id: currentQuestion.id,
      question_type: currentQuestion.type,
      question_text: currentQuestion.text,
      question_data: currentQuestion.data,
      points: currentQuestion.points,
      order_index: currentQuestion.orderIndex
    };

    const answer = answers[currentQuestion.id];

    return (
      <ExamQuestionRenderer
        question={question}
        answer={answer}
        onAnswerChange={(newAnswer) => handleAnswerChange(currentQuestion.id, newAnswer)}
        language={exam.language}
        colorScheme="preview"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              <Badge className="bg-orange-500 text-white border-orange-400 animate-pulse">
                #Preview
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100">Student Preview Mode</p>
              <p className="text-xs text-purple-200">This is how students will see your exam</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            {exam.description && (
              <p className="text-purple-100">{exam.description}</p>
            )}
          </div>
        </div>

        {/* Exam Stats Bar */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{totalQuestions} Questions</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4" />
                <span>{totalPoints} Points</span>
              </div>
              {exam.timeLimit && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{exam.timeLimit} minutes</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {currentQuestion ? (
              <div className="space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-violet-600 border-violet-200">
                      {getQuestionTypeLabel(currentQuestion.type)}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Question {currentQuestionIndex + 1}
                  </div>
                </div>

                {/* Question Text */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                  {currentQuestion.text}
                </h2>

                {/* Question Renderer */}
                <div className="mt-6">
                  {renderQuestionForPreview()}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No questions found</h3>
                <p className="text-gray-500 dark:text-gray-400">Add some questions to see the preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-violet-500'
                      : index < currentQuestionIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Answered: {Object.keys(answers).length} of {totalQuestions}</span>
              <span>Progress: {Math.round((Object.keys(answers).length / totalQuestions) * 100)}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="text-violet-600 border-violet-200 hover:bg-violet-50"
              >
                Back to Editor
              </Button>
              <Button
                className="bg-violet-500 text-white hover:bg-violet-600"
                disabled={totalQuestions === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewExam;