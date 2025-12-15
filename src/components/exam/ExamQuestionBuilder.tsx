import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Trash2, 
  Plus, 
  GripVertical, 
  ChevronDown, 
  ChevronUp, 
  Type, 
  Hash, 
  CheckCircle, 
  AlertCircle,
  Edit3,
  Target,
  Users,
  Shuffle,
  Languages,
  FileText,
  PenTool,
  CheckSquare
} from "lucide-react";

interface Question {
  id: string;
  type: "multiple_choice" | "fill_blank" | "written" | "poll" | "true_false" | "complete" | "matching" | "translate" | "paragraph";
  text: string;
  data: any;
  points: number;
  orderIndex: number;
}

interface Props {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onRemove: () => void;
  language: "english" | "arabic";
  isDragDisabled?: boolean;
}

const ExamQuestionBuilder = ({ question, onUpdate, onRemove, language, isDragDisabled = false }: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const questionTypes = [
    { 
      value: "multiple_choice", 
      label: "Multiple Choice", 
      icon: CheckSquare, 
      description: "Students choose from predefined options",
      color: "bg-blue-500 hover:bg-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-700"
    },
    { 
      value: "fill_blank", 
      label: "Fill in the Blank", 
      icon: Edit3, 
      description: "Students type their answer",
      color: "bg-green-500 hover:bg-green-600",
      bgColor: "bg-green-50 border-green-200",
      textColor: "text-green-700"
    },
    { 
      value: "written", 
      label: "Written Response", 
      icon: PenTool, 
      description: "Students write detailed answers",
      color: "bg-purple-500 hover:bg-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      textColor: "text-purple-700"
    },
    { 
      value: "poll", 
      label: "Team Vote", 
      icon: Users, 
      description: "Group voting and discussion",
      color: "bg-orange-500 hover:bg-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      textColor: "text-orange-700"
    },
    { 
      value: "true_false", 
      label: "True or False", 
      icon: Target, 
      description: "Simple true/false statement",
      color: "bg-red-500 hover:bg-red-600",
      bgColor: "bg-red-50 border-red-200",
      textColor: "text-red-700"
    },
    { 
      value: "complete", 
      label: "Complete Sentence", 
      icon: Type, 
      description: "Students complete the statement",
      color: "bg-yellow-500 hover:bg-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-700"
    },
    { 
      value: "matching", 
      label: "Matching", 
      icon: Shuffle, 
      description: "Connect related items",
      color: "bg-indigo-500 hover:bg-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-200",
      textColor: "text-indigo-700"
    },
    { 
      value: "translate", 
      label: "Translation", 
      icon: Languages, 
      description: "Translate between languages",
      color: "bg-pink-500 hover:bg-pink-600",
      bgColor: "bg-pink-50 border-pink-200",
      textColor: "text-pink-700"
    },
    { 
      value: "paragraph", 
      label: "Reading Comprehension", 
      icon: FileText, 
      description: "Paragraph with sub-questions",
      color: "bg-teal-500 hover:bg-teal-600",
      bgColor: "bg-teal-50 border-teal-200",
      textColor: "text-teal-700"
    }
  ];

  const currentQuestionType = questionTypes.find(type => type.value === question.type) || questionTypes[0];

  const updateQuestionData = (key: string, value: any) => {
    onUpdate({
      data: {
        ...question.data,
        [key]: value
      }
    });
  };

  const isQuestionComplete = () => {
    if (!question.text.trim()) return false;
    
    switch (question.type) {
      case "multiple_choice":
        return (question.data.options || []).length >= 2 && 
               question.data.options?.some((opt: string) => opt.trim()) &&
               question.data.correctAnswer !== undefined;
      case "fill_blank":
        return question.data.correctAnswer?.trim();
      case "true_false":
        return question.data.correctAnswer === true || question.data.correctAnswer === false;
      case "written":
        return true; // Always complete since it's optional
      case "matching":
        return (question.data.pairs || []).length >= 1 &&
               question.data.pairs?.some((pair: any) => pair.left?.trim() && pair.right?.trim());
      case "translate":
        return question.data.correctAnswer?.trim();
      case "complete":
        return question.data.correctAnswer?.trim();
      case "paragraph":
        return question.data.paragraph?.trim() &&
               (question.data.subQuestions || []).length > 0;
      case "poll":
        return (question.data.options || []).length >= 2 &&
               question.data.options?.some((opt: string) => opt.trim());
      default:
        return true;
    }
  };

  const renderQuestionTypeFields = () => {
    switch (question.type) {
      case "multiple_choice":
      case "poll":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Answer Options</Label>
              </div>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                {(question.data.options || []).length} options
              </Badge>
            </div>
            
            <div className="space-y-3">
              {(question.data.options || []).map((option: string, index: number) => (
                <div key={index} className="flex gap-3 items-center group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.data.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestionData('options', newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button
                    onClick={() => {
                      const newOptions = (question.data.options || []).filter((_: any, i: number) => i !== index);
                      updateQuestionData('options', newOptions);
                    }}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={(question.data.options || []).length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => {
                updateQuestionData('options', [...(question.data.options || []), '']);
              }}
              variant="outline"
              size="sm"
              className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
            
            {question.type === "multiple_choice" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 block">
                  <Target className="w-4 h-4 inline mr-2" />
                  Correct Answer
                </Label>
                <Select
                  value={question.data.correctAnswer !== undefined ? question.data.correctAnswer.toString() : ""}
                  onValueChange={(value) => updateQuestionData('correctAnswer', parseInt(value))}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700">
                    <SelectValue placeholder="Select the correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {(question.data.options || []).map((option: string, index: number) => (
                      <SelectItem key={index} value={index.toString()} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option || `Option ${index + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case "fill_blank":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <Label className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3 block">
                <Edit3 className="w-4 h-4 inline mr-2" />
                Correct Answer
              </Label>
              <Input
                value={question.data.correctAnswer || ""}
                onChange={(e) => updateQuestionData('correctAnswer', e.target.value)}
                placeholder="Enter the correct answer..."
                className="bg-white dark:bg-gray-800 border-green-200 dark:border-green-700 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Case Sensitivity</Label>
              <Select
                value={question.data.caseSensitive ? "true" : "false"}
                onValueChange={(value) => updateQuestionData('caseSensitive', value === "true")}
              >
                <SelectTrigger className="w-32 bg-white dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "true_false":
        return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <Label className="text-sm font-semibold text-red-700 dark:text-red-300 mb-3 block">
              <Target className="w-4 h-4 inline mr-2" />
              Correct Answer
            </Label>
            <Select
              value={
                question.data.correctAnswer === true ? "true" : 
                question.data.correctAnswer === false ? "false" : 
                ""
              }
              onValueChange={(value) => updateQuestionData('correctAnswer', value === "true")}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-700">
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">✅ True</SelectItem>
                <SelectItem value="false">❌ False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "matching":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-indigo-500" />
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Matching Pairs</Label>
              </div>
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200">
                {(question.data.pairs || []).length} pairs
              </Badge>
            </div>
            
            <div className="space-y-3">
              {(question.data.pairs || []).map((pair: any, index: number) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="space-y-2">
                    <Label className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Column A</Label>
                    <Input
                      value={pair.left || ""}
                      onChange={(e) => {
                        const newPairs = [...(question.data.pairs || [])];
                        newPairs[index] = { ...newPairs[index], left: e.target.value };
                        updateQuestionData('pairs', newPairs);
                      }}
                      placeholder="Left side item"
                      className="bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Column B</Label>
                    <Input
                      value={pair.right || ""}
                      onChange={(e) => {
                        const newPairs = [...(question.data.pairs || [])];
                        newPairs[index] = { ...newPairs[index], right: e.target.value };
                        updateQuestionData('pairs', newPairs);
                      }}
                      placeholder="Right side item"
                      className="bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-700"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => {
                updateQuestionData('pairs', [...(question.data.pairs || []), { left: '', right: '' }]);
              }}
              variant="outline"
              size="sm"
              className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Pair
            </Button>
          </div>
        );

      case "translate":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
              <Label className="text-sm font-semibold text-pink-700 dark:text-pink-300 mb-3 block">
                <Languages className="w-4 h-4 inline mr-2" />
                Translation Direction
              </Label>
              <Select
                value={question.data.direction || "en_to_ar"}
                onValueChange={(value) => updateQuestionData('direction', value)}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_to_ar">🇺🇸 English → 🇸🇦 Arabic</SelectItem>
                  <SelectItem value="ar_to_en">🇸🇦 Arabic → 🇺🇸 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
              <Label className="text-sm font-semibold text-pink-700 dark:text-pink-300 mb-3 block">
                Correct Translation
              </Label>
              <Input
                value={question.data.correctAnswer || ""}
                onChange={(e) => updateQuestionData('correctAnswer', e.target.value)}
                placeholder="Enter the correct translation..."
                className="bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-700"
              />
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <Label className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-3 block">
              <Type className="w-4 h-4 inline mr-2" />
              Correct Completion
            </Label>
            <Input
              value={question.data.correctAnswer || ""}
              onChange={(e) => updateQuestionData('correctAnswer', e.target.value)}
              placeholder="Enter what completes the sentence..."
              className="bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-700"
            />
          </div>
        );

      case "paragraph":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
              <Label className="text-sm font-semibold text-teal-700 dark:text-teal-300 mb-3 block">
                <FileText className="w-4 h-4 inline mr-2" />
                Paragraph Text
              </Label>
              <Textarea
                value={question.data.paragraph || ""}
                onChange={(e) => updateQuestionData('paragraph', e.target.value)}
                placeholder="Enter the paragraph text that students will read..."
                rows={4}
                className="bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-700"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sub-questions</Label>
                </div>
                <Badge variant="outline" className="text-xs bg-teal-50 text-teal-600 border-teal-200">
                  {(question.data.subQuestions || []).length} questions
                </Badge>
              </div>
              
              <div className="space-y-4">
                {(question.data.subQuestions || []).map((subQ: any, index: number) => (
                  <div key={index} className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                        Question {index + 1}
                      </Label>
                      <Button
                        onClick={() => {
                          const newSubQuestions = (question.data.subQuestions || []).filter((_: any, i: number) => i !== index);
                          updateQuestionData('subQuestions', newSubQuestions);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      value={subQ.question || ""}
                      onChange={(e) => {
                        const newSubQuestions = [...(question.data.subQuestions || [])];
                        newSubQuestions[index] = { ...newSubQuestions[index], question: e.target.value };
                        updateQuestionData('subQuestions', newSubQuestions);
                      }}
                      placeholder="Sub-question text"
                      className="bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-700"
                    />
                    <Input
                      value={subQ.answer || ""}
                      onChange={(e) => {
                        const newSubQuestions = [...(question.data.subQuestions || [])];
                        newSubQuestions[index] = { ...newSubQuestions[index], answer: e.target.value };
                        updateQuestionData('subQuestions', newSubQuestions);
                      }}
                      placeholder="Correct answer"
                      className="bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-700"
                    />
                  </div>
                ))}
                
                <Button
                  onClick={() => {
                    updateQuestionData('subQuestions', [...(question.data.subQuestions || []), { question: '', answer: '' }]);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-teal-300 text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-900/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sub-question
                </Button>
              </div>
            </div>
          </div>
        );

      case "written":
      default:
        return (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3 block">
              <PenTool className="w-4 h-4 inline mr-2" />
              Sample Answer (Optional)
            </Label>
            <Textarea
              value={question.data.sampleAnswer || ""}
              onChange={(e) => updateQuestionData('sampleAnswer', e.target.value)}
              placeholder="Provide a sample answer for reference and grading guidelines..."
              rows={4}
              className="bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700"
            />
          </div>
        );
    }
  };

  const QuestionTypeIcon = currentQuestionType.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={`transition-all duration-300 hover:shadow-lg w-full overflow-hidden ${
        isQuestionComplete() 
          ? 'bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/10 border-green-200 dark:border-green-800' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className={`p-4 border-b cursor-pointer ${
            isQuestionComplete() 
              ? 'border-green-100 dark:border-green-800' 
              : 'border-gray-100 dark:border-gray-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {!isDragDisabled && (
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move hover:text-gray-600 flex-shrink-0" />
                )}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${currentQuestionType.bgColor} flex-shrink-0`}>
                    <QuestionTypeIcon className={`w-5 h-5 ${currentQuestionType.textColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        Question {question.orderIndex + 1}
                      </span>
                      {isQuestionComplete() && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{currentQuestionType.label}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Expand
                    </>
                  )}
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Content */}
        <CollapsibleContent className="p-6 space-y-8">
          {/* Question Type Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {questionTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = question.type === type.value;
                
                return (
                  <button
                    key={type.value}
                    onClick={() => onUpdate({ type: type.value as Question["type"], data: {} })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? `${type.bgColor} ${type.textColor} border-current shadow-md transform scale-[1.02]`
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white/50' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">{type.label}</h3>
                        <p className="text-xs opacity-80">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Points <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                  className="pl-10 border-gray-200 dark:border-gray-600 focus:border-violet-500 focus:ring-violet-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Question Text <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
              className="border-gray-200 dark:border-gray-600 focus:border-violet-500 focus:ring-violet-500 resize-none"
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Be clear and specific with your question</span>
              <span>{question.text.length} characters</span>
            </div>
          </div>

          {/* Question Type Specific Fields */}
          <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-violet-500" />
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question Configuration</Label>
            </div>
            {renderQuestionTypeFields()}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default ExamQuestionBuilder;