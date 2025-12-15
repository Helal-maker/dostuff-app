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
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Plus, Settings, Eye, Clock, Users, Timer, ChevronDown, GripVertical, Trash2, FileText, HelpCircle, Timer as TimerIcon, Users as UsersIcon, CheckCircle as CheckCircleIcon } from "lucide-react";
import ExamQuestionBuilder from "@/components/exam/ExamQuestionBuilder";
import PreviewExam from "@/components/exam/PreviewExam";

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
  const isMobile = useIsMobile();
  
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
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);

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

  const StepIndicator = () => (
    <div className="max-w-sm mx-auto mb-4">
      <div className="flex items-center justify-between relative w-full px-2">
        <div className="absolute left-4 right-4 top-5 -translate-y-1/2 h-[3px] bg-purple-900/20 rounded-full"></div>
        <div className="absolute left-4 top-5 -translate-y-1/2 h-[3px] w-0 bg-white transition-all duration-500 rounded-full"></div>
        
        {[
          { number: 1, label: "Info", active: currentStep === 1 },
          { number: 2, label: "Questions", active: currentStep === 2 },
          { number: 3, label: "Settings", active: currentStep === 3 },
          { number: 4, label: "Review", active: currentStep === 4 }
        ].map((step, index) => (
          <div
            key={step.number}
            className={`flex flex-col items-center gap-2 relative z-10 group cursor-pointer ${
              step.active ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            } transition-opacity`}
            onClick={() => setCurrentStep(step.number)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all duration-300 ${
              step.active
                ? 'bg-white text-primary ring-4 ring-white/20 transform scale-105 shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                : 'bg-primary border-2 border-white/30 text-white group-hover:border-white/60 group-hover:bg-primary/80'
            }`}>
              {step.number}
            </div>
            <span className={`text-xs font-medium tracking-wide ${
              step.active ? 'font-semibold text-white' : 'text-white/80'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMobileLayout = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-200 pb-32">
      {/* Purple gradient header */}
      <div className="relative bg-gradient-to-r from-violet-500 via-purple-600 to-purple-700 pt-12 pb-36 px-4 rounded-b-[2.5rem] shadow-xl overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[70%] bg-white/10 rounded-full blur-[80px]"></div>
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[60px]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-all border border-white/10 active:scale-95"
          >
            <ArrowLeft className="text-lg" />
            <span>Dashboard</span>
          </button>
          <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors cursor-pointer active:scale-95">
            <Settings className="text-white text-xl" />
          </div>
        </div>
        
        <div className="relative z-10 text-white text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Create New Exam</h1>
          <p className="text-purple-100 text-sm leading-relaxed max-w-sm mx-auto opacity-90">
            Follow the steps below to build a comprehensive assessment for your students.
          </p>
        </div>
        
        <StepIndicator />
      </div>

      <div className="px-4 -mt-16 space-y-6 max-w-lg mx-auto relative z-20">
        {/* Basic Information Section */}
        {currentStep === 1 && (
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 transition-colors border-t-4 border-transparent hover:border-violet-500 duration-300">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
              <FileText className="text-violet-500 bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Exam Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="e.g. Mid-term Biology Review"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white shadow-sm"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Brief description of the exam..."
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white shadow-sm"
                />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Language
                </Label>
                <div className="relative">
                  <Select
                    value={formData.language}
                    onValueChange={(value: "english" | "arabic") => handleFormChange('language', value)}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none appearance-none transition-all text-gray-900 dark:text-white pr-10 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English (US)</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Questions Section */}
        {currentStep === 2 && (
          <section className="space-y-6">
            {/* Header with enhanced styling */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-violet-100 dark:border-violet-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Questions Builder</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create engaging questions for your exam • {questions.length} question{questions.length !== 1 ? 's' : ''} added
                  </p>
                </div>
                <Button
                  onClick={addQuestion}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/30 active:scale-95 transition-all hover:shadow-xl hover:from-violet-600 hover:to-purple-700"
                >
                  <Plus className="text-lg" />
                  Add Question
                </Button>
              </div>
            </div>
            
            {questions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-violet-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to create your first question?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Start building your exam by adding your first question. You can choose from multiple question types including multiple choice, fill-in-the-blank, and more.
                </p>
                <Button
                  onClick={addQuestion}
                  className="flex items-center gap-2 bg-violet-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-violet-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Questions list with enhanced styling */}
                {questions.map((question, index) => (
                  <div key={question.id} className="relative">
                    {/* Question number badge */}
                    <div className="absolute -left-3 top-6 z-10">
                      <div className="w-8 h-8 bg-violet-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Question builder component */}
                    <div className="ml-6">
                      <ExamQuestionBuilder
                        question={question}
                        onUpdate={(updates) => updateQuestion(question.id, updates)}
                        onRemove={() => removeQuestion(question.id)}
                        language={formData.language}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Add question button at the bottom */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="flex items-center gap-2 border-2 border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/20 px-6 py-4 rounded-xl font-semibold transition-all hover:border-solid"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Question
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Settings Section */}
        {currentStep === 3 && (
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 transition-colors">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
              <Settings className="text-violet-500 bg-violet-50 dark:bg-violet-900/20 p-2 rounded-lg" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Exam Settings</h2>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time Limit (minutes)
                  </Label>
                  <span className="text-xs text-gray-400">Leave empty for no limit</span>
                </div>
                <div className="relative">
                  <Timer className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <Input
                    type="number"
                    value={formData.timeLimit || ""}
                    onChange={(e) => handleFormChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="No limit"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Max Attempts
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.maxAttempts}
                    onChange={(e) => handleFormChange('maxAttempts', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-violet-500"
                  />
                  <span className="bg-violet-500/10 text-violet-600 font-bold px-3 py-1 rounded-md text-sm min-w-[2.5rem] text-center">
                    {formData.maxAttempts}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Publish Immediately</span>
                  <span className="text-xs text-gray-500">Students can see this exam once saved</span>
                </div>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleFormChange('isPublished', checked)}
                />
              </div>
            </div>
          </section>
        )}

        {/* Review Section */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <section className="bg-orange-50 dark:bg-yellow-900/10 border border-orange-100 dark:border-yellow-900/30 rounded-xl p-4 flex flex-col gap-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <HelpCircle className="text-base" /> Questions
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">{questions.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <TimerIcon className="text-base" /> Time
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formData.timeLimit ? `${formData.timeLimit}m` : "No limit"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <UsersIcon className="text-base" /> Attempts
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">{formData.maxAttempts}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CheckCircleIcon className="text-base" /> Status
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formData.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Fixed bottom action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-4 pb-8 z-50 backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 bg-white dark:bg-gray-800 text-violet-600 border-violet-200 font-semibold py-3.5 px-6 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            onClick={() => setShowPreview(true)}
            disabled={!formData.title.trim() || questions.length === 0}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={createExam}
            disabled={isCreating || !formData.title.trim() || questions.length === 0}
            className="flex-[2] bg-violet-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-violet-500/30 hover:bg-violet-600 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Exam"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="sm"
            className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Exam</h1>
            <p className="text-purple-100">Build an engaging assessment for your students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Exam Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Enter exam title..."
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Brief description of the exam..."
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-white">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: "english" | "arabic") => handleFormChange('language', value)}
                  >
                    <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
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
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Questions</h2>
                <Button onClick={addQuestion} variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-white/70">
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
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="timeLimit" className="text-white">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit || ""}
                    onChange={(e) => handleFormChange('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="No limit"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    min="1"
                  />
                  <p className="text-xs text-white/70 mt-1">Leave empty for no time limit</p>
                </div>

                <div>
                  <Label htmlFor="maxAttempts" className="text-white">Attempt Limit</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) => handleFormChange('maxAttempts', parseInt(e.target.value) || 1)}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublished" className="text-white">Publish Exam</Label>
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => handleFormChange('isPublished', checked)}
                  />
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Questions</span>
                  </div>
                  <span className="font-medium text-white">{questions.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Time Limit</span>
                  </div>
                  <span className="font-medium text-white">
                    {formData.timeLimit ? `${formData.timeLimit}m` : "No limit"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Attempts</span>
                  </div>
                  <span className="font-medium text-white">{formData.maxAttempts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">Status</span>
                  </div>
                  <span className={`font-medium ${formData.isPublished ? 'text-green-400' : 'text-white/70'}`}>
                    {formData.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowPreview(true)}
                disabled={!formData.title.trim() || questions.length === 0}
                variant="outline"
                size="lg"
                className="w-full bg-white/10 border-violet-300 text-violet-100 hover:bg-violet-500/20 hover:border-violet-400"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Exam
              </Button>
              
              <Button
                onClick={createExam}
                disabled={isCreating || !formData.title.trim() || questions.length === 0}
                variant="secondary"
                size="lg"
                className="w-full bg-white text-violet-600 hover:bg-gray-50"
              >
                {isCreating ? "Creating..." : "Create Exam"}
              </Button>
              
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="lg"
                className="w-full text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return mobile layout for mobile devices, desktop layout for desktop
  const mainContent = isMobile ? renderMobileLayout() : renderDesktopLayout();

  return (
    <>
      {mainContent}
      {showPreview && (
        <PreviewExam
          exam={formData}
          questions={questions}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default CreateExam;