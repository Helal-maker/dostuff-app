import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  id: string;
  question_type: string;
  question_text: string;
  question_data: any;
  points: number;
  order_index: number;
}

interface Props {
  question: Question;
  answer: any;
  onAnswerChange: (answer: any) => void;
  language: string;
  colorScheme?: any;
}

const ExamQuestionRenderer = ({ question, answer, onAnswerChange, language, colorScheme }: Props) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

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

  const renderMultipleChoice = () => {
    const options = question.question_data.options || [];
    const isPoll = question.question_type === "poll";
    
    return (
      <div className="space-y-3">
        {options.map((option: string, index: number) => {
          const isSelected = answer === index;
          const optionKey = `option-${index}`;
          
          return (
            <label 
              key={index} 
              className={`block relative cursor-pointer group transition-all duration-200 ${
                isPoll ? '' : 'transform hover:scale-[1.02]'
              }`}
            >
              <input
                className="peer sr-only"
                type="radio"
                name="answer"
                value={index.toString()}
                checked={isSelected}
                onChange={() => onAnswerChange(index)}
              />
              <div className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? isPoll
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                    : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md'
              }`}>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300 dark:border-gray-500'
                }`}>
                  {isSelected && (
                    <span className="material-icons-round text-white text-sm">check</span>
                  )}
                </div>
                <span className={`flex-grow text-lg font-medium ${
                  isSelected
                    ? 'text-purple-700 dark:text-purple-200'
                    : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {option}
                </span>
                {isSelected && !isPoll && (
                  <span className="material-icons-round text-purple-600 dark:text-purple-400 text-2xl">check_circle</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  const renderFillBlank = () => {
    return (
      <div className="space-y-4">
        <div className="relative group">
          <label className="sr-only" htmlFor="answer-input">Your Answer</label>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons-round text-gray-400 group-focus-within:text-primary transition-colors">edit</span>
          </div>
          <input
            id="answer-input"
            type="text"
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-lg font-medium text-purple-700 dark:text-purple-200 placeholder-gray-400 focus:border-primary focus:ring-0 focus:bg-white dark:focus:bg-gray-800 transition-all duration-200 outline-none shadow-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
            <span className="text-xs text-gray-400 font-medium">Press Enter</span>
          </div>
        </div>
        <Button 
          type="button" 
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors px-2 bg-transparent hover:bg-transparent"
          onClick={() => {/* Add hint functionality */}}
        >
          <span className="material-icons-round text-base">lightbulb_outline</span>
          <span>Need a hint?</span>
        </Button>
      </div>
    );
  };

  const renderTranslation = () => {
    const direction = question.question_data.direction || "en_to_ar";
    const sourceText = question.question_data.sourceText || question.question_data.text || "Enter text to translate";
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
            {direction === "en_to_ar" ? "English (Source)" : "Arabic (Source)"}
          </label>
          <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full flex-shrink-0">
              <span className="material-icons-round text-blue-600 dark:text-blue-400 text-xl">g_translate</span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-medium text-lg pt-1">
              {sourceText}
            </p>
          </div>
        </div>
        
        <div className="flex justify-center -my-3 relative z-10">
          <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm">
            <span className="material-icons-round text-gray-400 dark:text-gray-500 block transform rotate-90">arrow_right_alt</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
            {direction === "en_to_ar" ? "Arabic (Target)" : "English (Target)"}
          </label>
          <div className="relative group">
            <textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder={direction === "en_to_ar" ? "أدخل الترجمة هنا..." : "Enter your translation here..."}
              dir={direction === "en_to_ar" ? "rtl" : "ltr"}
              className="w-full h-32 p-4 bg-white dark:bg-gray-900 rounded-2xl border-2 border-primary/30 focus:border-primary focus:ring-0 text-lg text-purple-700 dark:text-purple-200 placeholder-gray-400 dark:placeholder-gray-600 resize-none transition-all shadow-sm group-hover:border-primary/50"
            />
            <div className="absolute bottom-3 left-3 flex space-x-2 text-gray-400 dark:text-gray-600">
              <button 
                type="button"
                className="material-icons-round text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => {/* Add bold formatting */}}
              >
                format_bold
              </button>
              <button 
                type="button"
                className="material-icons-round text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => {/* Add italic formatting */}}
              >
                format_italic
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrueFalse = () => {
    return (
      <div className="space-y-4">
        <label className="cursor-pointer group relative block">
          <input
            className="tf-option sr-only"
            name="tf_answer"
            type="radio"
            value="true"
            checked={answer === true}
            onChange={() => onAnswerChange(true)}
          />
          <div className={`flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-200 ${
            answer === true
              ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
              : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                answer === true
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                T
              </div>
              <span className="text-lg font-medium">True</span>
            </div>
            {answer === true && (
              <span className="material-icons-round check-icon text-violet-600 dark:text-violet-400 opacity-100 transform scale-100 transition-all duration-200">check_circle</span>
            )}
          </div>
        </label>

        <label className="cursor-pointer group relative block">
          <input
            className="tf-option sr-only"
            name="tf_answer"
            type="radio"
            value="false"
            checked={answer === false}
            onChange={() => onAnswerChange(false)}
          />
          <div className={`flex items-center justify-between p-5 border-2 rounded-2xl transition-all duration-200 ${
            answer === false
              ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
              : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                answer === false
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                F
              </div>
              <span className="text-lg font-medium">False</span>
            </div>
            {answer === false && (
              <span className="material-icons-round check-icon text-violet-600 dark:text-violet-400 opacity-100 transform scale-100 transition-all duration-200">check_circle</span>
            )}
          </div>
        </label>
      </div>
    );
  };

  const renderParagraph = () => {
    const paragraph = question.question_data.paragraph;
    const subQuestions = question.question_data.subQuestions || [];
    
    return (
      <div className="space-y-6">
        {paragraph && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-primary dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Passage
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">~3 min read</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Reading Comprehension</h3>
            <div className="prose prose-sm prose-purple dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>{paragraph}</p>
            </div>
            <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-6"></div>
          </div>
        )}
        
        <div className="space-y-6">
          {subQuestions.map((subQ: any, index: number) => (
            <div key={index} className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Question {index + 1}
                </span>
                <span className="text-xs font-semibold text-primary dark:text-purple-400">
                  {subQ.points || question.points} Points
                </span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                {subQ.question}
              </h4>
              
              {subQ.type === "multiple_choice" ? (
                <div className="space-y-3">
                  {(subQ.options || []).map((option: string, optIndex: number) => {
                    const subAnswer = answer?.[index];
                    const isSelected = subAnswer === optIndex;
                    
                    return (
                      <label key={optIndex} className="group relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200">
                        <input
                          className="peer sr-only"
                          type="radio"
                          name={`sub-question-${index}`}
                          checked={isSelected}
                          onChange={() => {
                            const newAnswer = [...(answer || [])];
                            newAnswer[index] = optIndex;
                            onAnswerChange(newAnswer);
                          }}
                        />
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'
                        }`}>
                          {isSelected && (
                            <span className="material-icons-round text-sm">check</span>
                          )}
                        </div>
                        <span className={`font-medium flex-1 ${
                          isSelected
                            ? 'text-primary dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <Input
                  value={answer?.[index] || ""}
                  onChange={(e) => {
                    const newAnswer = [...(answer || [])];
                    newAnswer[index] = e.target.value;
                    onAnswerChange(newAnswer);
                  }}
                  placeholder="Enter your answer..."
                  className="text-base text-purple-700 dark:text-purple-200"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMatching = () => {
    const pairs = question.question_data.pairs || [];
    const leftItems = pairs.map((pair: any) => pair.left);
    const rightItemsWithIndex = pairs.map((pair: any, idx: number) => ({ 
      text: pair.right, 
      originalIndex: idx 
    }));
    const matches = answer || {};

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Click an item from Column A, then click its match from Column B
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Column A</h4>
            {leftItems.map((item: string, index: number) => {
              const isSelected = draggedItem === `left-${index}`;
              const isMatched = matches[index] !== undefined;
              const matchedRightText = isMatched ? pairs[matches[index]]?.right : null;
              
              return (
                <Card
                  key={`left-${index}`}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-primary/20 border-primary ring-2 ring-primary' 
                      : isMatched 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => {
                    if (isMatched) {
                      const newMatches = { ...matches };
                      delete newMatches[index];
                      onAnswerChange(newMatches);
                      setDraggedItem(null);
                    } else {
                      setDraggedItem(`left-${index}`);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{item}</span>
                    {isMatched && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        → {matchedRightText}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Column B */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Column B</h4>
            {rightItemsWithIndex.map((item: { text: string; originalIndex: number }) => {
              const isUsed = Object.values(matches).includes(item.originalIndex);
              const isTargetable = draggedItem?.startsWith('left-') && !isUsed;
              
              return (
                <Card
                  key={`right-${item.originalIndex}`}
                  className={`p-3 transition-all ${
                    isUsed 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 opacity-60' 
                      : isTargetable
                      ? 'bg-primary/10 border-primary hover:bg-primary/20 cursor-pointer'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  } ${!isUsed && !isTargetable ? 'opacity-50' : ''}`}
                  onClick={() => {
                    if (isTargetable && draggedItem) {
                      const leftIndex = parseInt(draggedItem.replace('left-', ''));
                      const newMatches = { ...matches, [leftIndex]: item.originalIndex };
                      onAnswerChange(newMatches);
                      setDraggedItem(null);
                    }
                  }}
                >
                  <span className="text-sm">{item.text}</span>
                </Card>
              );
            })}
          </div>
        </div>

        {draggedItem && (
          <p className="text-sm text-primary font-medium text-center">
            Now click an item from Column B to create the match
          </p>
        )}
      </div>
    );
  };

  const renderQuestionInput = () => {
    switch (question.question_type) {
      case "multiple_choice":
      case "poll":
        return renderMultipleChoice();
      
      case "fill_blank":
      case "complete":
        return renderFillBlank();
      
      case "translate":
        return renderTranslation();
      
      case "true_false":
        return renderTrueFalse();
      
      case "paragraph":
        return renderParagraph();
      
      case "matching":
        return renderMatching();
      
      case "written":
        return (
          <Textarea
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your answer here..."
            rows={6}
            className="text-base text-purple-700 dark:text-purple-200"
          />
        );
      
      default:
        return (
          <Textarea
            value={answer || ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Enter your answer..."
            rows={4}
            className="text-base text-purple-700 dark:text-purple-200"
          />
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-2xl transition-colors duration-300 relative overflow-hidden">
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
      
      {/* Question header */}
      <div className="flex justify-between items-center mb-6">
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider rounded-lg">
          {getQuestionTypeLabel(question.question_type)}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {question.points} Points
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-snug">
        {question.question_text}
      </h2>

      {/* Question input */}
      <div className="mb-6">
        {renderQuestionInput()}
      </div>

      {/* Answer status */}
      {answer !== undefined && answer !== null && answer !== "" && (
        <div className="flex items-center text-emerald-500 dark:text-emerald-400 text-sm font-medium animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2"></span>
          Answer Saved
        </div>
      )}
    </div>
  );
};

export default ExamQuestionRenderer;