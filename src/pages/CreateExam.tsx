import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Plus, Settings, Eye, Clock, Users } from "lucide-react";
import ExamQuestionBuilder from "@/components/exam/ExamQuestionBuilder";

interface ExamForm {
  title: string;
  description: string;
  language: "english" | "arabic";
  timeLimit: number | null;
  maxAttempts: number;
  isPublished: boolean;
}

interface Question {
  id: string;
  type: "multiple_choice" | "fill_blank" | "written" | "poll" | "true_false" | "complete" | "matching" | "translate" | "paragraph";
  text: string;
  data: any;
  points: number;
  orderIndex: number;
}

const CreateExam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<ExamForm>({
    title: "",
    description: "",
    language: "english",
    timeLimit: null,
    maxAttempts: 1,
    isPublished: true
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleFormChange = (field: keyof ExamForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: "multiple_choice",
      text: "",
      data: {},
      points: 1,
      orderIndex: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const createExam = async () => {
    if (!user) return;
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exam title",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one question",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Generate unique share link
      const shareLink = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

      // Create exam
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          title: formData.title,
          description: formData.description,
          language: formData.language,
          time_limit: formData.timeLimit,
          max_attempts: formData.maxAttempts,
          is_published: formData.isPublished,
          share_link: shareLink,
          teacher_id: user.id
        })
        .select()
        .single();

      if (examError) throw examError;

      // Create questions
      const questionsToInsert = questions.map(q => ({
        exam_id: examData.id,
        question_type: q.type,
        question_text: q.text,
        question_data: q.data,
        points: q.points,
        order_index: q.orderIndex
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: "Success",
        description: "Exam created successfully!",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Exam</h1>
            <p className="text-muted-foreground">Build an engaging assessment for your students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6 bg-gradient-card border-0 shadow-medium">
              <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Enter exam title..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Brief description of the exam..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: "english" | "arabic") => handleFormChange('language', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Questions Section */}
            <Card className="p-6 bg-gradient-card border-0 shadow-medium">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Questions</h2>
                <Button onClick={addQuestion} variant="hero" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No questions yet</p>
                    <p className="text-sm">Click "Add Question" to start building your exam</p>
                  </div>
                ) : (
                  questions.map((question) => (
                    <ExamQuestionBuilder
                      key={question.id}
                      question={question}
                      onUpdate={(updates) => updateQuestion(question.id, updates)}
                      onRemove={() => removeQuestion(question.id)}
                      language={formData.language}
                    />
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card className="p-6 bg-gradient-card border-0 shadow-medium">
              <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit || ""}
                    onChange={(e) => handleFormChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="No limit"
                    className="mt-1"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty for no time limit</p>
                </div>

                <div>
                  <Label htmlFor="maxAttempts">Attempt Limit</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) => handleFormChange('maxAttempts', parseInt(e.target.value) || 1)}
                    className="mt-1"
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublished">Publish Exam</Label>
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleFormChange('isPublished', checked)}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-card border-0 shadow-medium">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Questions</span>
                  </div>
                  <span className="font-medium text-foreground">{questions.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Time Limit</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {formData.timeLimit ? `${formData.timeLimit}m` : "No limit"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Attempts</span>
                  </div>
                  <span className="font-medium text-foreground">{formData.maxAttempts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status</span>
                  </div>
                  <span className={`font-medium ${formData.isPublished ? 'text-success' : 'text-muted-foreground'}`}>
                    {formData.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={createExam}
                disabled={isCreating}
                variant="hero"
                size="lg"
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Exam"}
              </Button>
              
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;