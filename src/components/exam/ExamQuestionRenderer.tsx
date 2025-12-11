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

  const renderQuestionInput = () => {
    switch (question.question_type) {
      case "multiple_choice":
      case "poll":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.toString() || ""}
              onValueChange={(value) => onAnswerChange(parseInt(value))}
            >
              {(question.question_data.options || []).map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "fill_blank":
        return (
          <div>
            <Input
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="text-lg"
            />
          </div>
        );

      case "written":
        return (
          <div>
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Write your answer here..."
              rows={6}
              className="text-base"
            />
          </div>
        );

      case "true_false":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={answer?.toString() || ""}
              onValueChange={(value) => onAnswerChange(value === "true")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">False</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case "complete":
        return (
          <div>
            <Input
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Complete the sentence..."
              className="text-lg"
            />
          </div>
        );

      case "matching":
        const pairs = question.question_data.pairs || [];
        const leftItems = pairs.map((pair: any) => pair.left);
        // Shuffle right items for display but keep track of original indices
        const rightItemsWithIndex = pairs.map((pair: any, idx: number) => ({ 
          text: pair.right, 
          originalIndex: idx 
        }));
        const matches = answer || {};

        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click an item from Column A, then click its match from Column B
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column A - Left items */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Column A</h4>
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
                          ? 'bg-success/10 border-success' 
                          : 'bg-card hover:bg-accent/50'
                      }`}
                      onClick={() => {
                        if (isMatched) {
                          // Remove the match
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
                        <span>{item}</span>
                        {isMatched && (
                          <span className="text-xs text-success font-medium">
                            → {matchedRightText}
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Column B - Right items */}
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Column B</h4>
                {rightItemsWithIndex.map((item: { text: string; originalIndex: number }) => {
                  const isUsed = Object.values(matches).includes(item.originalIndex);
                  const isTargetable = draggedItem?.startsWith('left-') && !isUsed;
                  
                  return (
                    <Card
                      key={`right-${item.originalIndex}`}
                      className={`p-3 transition-all ${
                        isUsed 
                          ? 'bg-success/10 border-success opacity-60' 
                          : isTargetable
                          ? 'bg-primary/10 border-primary hover:bg-primary/20 cursor-pointer'
                          : 'bg-card'
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
                      <span>{item.text}</span>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            {draggedItem && (
              <p className="text-sm text-primary font-medium text-center">
                Now click an item from Column B to create the match
              </p>
            )}
          </div>
        );

      case "translate":
        const direction = question.question_data.direction || "en_to_ar";
        const directionText = direction === "en_to_ar" ? "English to Arabic" : "Arabic to English";
        
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Translate the following text ({directionText}):
            </p>
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your translation..."
              rows={4}
              className="text-base"
            />
          </div>
        );

      case "paragraph":
        return (
          <div className="space-y-6">
            {question.question_data.paragraph && (
              <Card className="p-4 bg-muted/20">
                <p className="text-base leading-relaxed">{question.question_data.paragraph}</p>
              </Card>
            )}
            
            <div className="space-y-4">
              {(question.question_data.subQuestions || []).map((subQ: any, index: number) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm font-medium">
                    {index + 1}. {subQ.question}
                  </Label>
                  <Input
                    value={answer?.[index] || ""}
                    onChange={(e) => {
                      const newAnswer = [...(answer || [])];
                      newAnswer[index] = e.target.value;
                      onAnswerChange(newAnswer);
                    }}
                    placeholder="Enter your answer..."
                  />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div>
            <Textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter your answer..."
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {question.question_text}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Points: {question.points}</span>
            <span className="capitalize">
              {question.question_type.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Question Input */}
      <div className="pt-4">
        {renderQuestionInput()}
      </div>

      {/* Answer Status */}
      {answer !== undefined && answer !== null && answer !== "" && (
        <div className="flex items-center gap-2 text-sm text-success">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>Answered</span>
        </div>
      )}
    </div>
  );
};

export default ExamQuestionRenderer;