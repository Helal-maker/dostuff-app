
import React, { useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  ChevronLeft, Plus, Trash2, GripVertical, Settings, 
  HelpCircle, Eye, CheckCircle2, ListChecks, Type, 
  MessageSquare, Layout, RefreshCw, Layers, Languages, FileText,
  Save, Circle, CheckCircle, MoreVertical, Menu
} from 'lucide-react';
import { QuestionType, Question } from '../types';

const { useNavigate } = Router;

const TYPE_CONFIG: Record<QuestionType, { label: string; icon: any; color: string; desc: string }> = {
  multiple_choice: { label: "Multiple Choice", icon: ListChecks, color: "text-blue-500", desc: "Choose one correct answer" },
  fill_blank: { label: "Fill in the Blank", icon: Type, color: "text-purple-500", desc: "Type the exact answer" },
  written: { label: "Written Response", icon: MessageSquare, color: "text-orange-500", desc: "Longer manual answers" },
  poll: { label: "Poll/Survey", icon: Layers, color: "text-green-500", desc: "Gather survey opinions" },
  true_false: { label: "True / False", icon: CheckCircle2, color: "text-indigo-500", desc: "Binary choice question" },
  complete: { label: "Complete Text", icon: FileText, color: "text-yellow-500", desc: "Fill in missing gaps" },
  matching: { label: "Matching Pair", icon: RefreshCw, color: "text-teal-500", desc: "Match items in columns" },
  translate: { label: "Translation", icon: Languages, color: "text-red-500", desc: "Translate text correctly" },
  paragraph: { label: "Paragraph Analysis", icon: Layout, color: "text-pink-500", desc: "Analyze specific text" }
};

const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState('My Final Assessment');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text: '',
      points: 10,
      options: type === 'multiple_choice' || type === 'poll' ? ['Option 1', 'Option 2'] : undefined,
      correctAnswer: type === 'true_false' ? 'true' : ''
    };
    setQuestions([...questions, newQ]);
    setIsSidebarOpen(false);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (qId: string) => {
    const q = questions.find(item => item.id === qId);
    if (q && q.options) {
      updateQuestion(qId, { options: [...q.options, `Option ${q.options.length + 1}`] });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#F8FAFC] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between z-30 shadow-sm shrink-0">
        <div className="flex items-center space-x-3 md:space-x-6 overflow-hidden">
          <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <div className="hidden sm:block h-10 w-px bg-gray-100"></div>
          <div className="flex-1 min-w-0">
            <input 
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              className="text-base md:text-xl font-black text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full md:w-64 truncate"
            />
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate">Live Cloud Sync</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="hidden sm:flex items-center space-x-2 px-4 py-2.5 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition-all">
            <Eye size={16} />
            <span>Preview</span>
          </button>
          <button className="bg-[#7C3AED] text-white px-4 md:px-8 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#7C3AED]/20 hover:scale-[1.02] active:scale-95 transition-all">
            Publish
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2.5 bg-gray-50 text-gray-600 rounded-xl"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Component Picker */}
        <aside className={`fixed inset-y-0 left-0 w-[300px] bg-white border-r border-gray-100 flex flex-col z-[70] lg:static lg:z-20 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 lg:hidden">
              <h3 className="text-sm font-black text-gray-900">Add Element</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-50 rounded-lg">
                <ChevronLeft size={20} />
              </button>
            </div>
            <h3 className="hidden lg:block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Question Types</h3>
            <div className="space-y-2">
              {(Object.keys(TYPE_CONFIG) as QuestionType[]).map((type) => {
                const config = TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="w-full flex items-center space-x-4 p-4 rounded-[1.25rem] border border-transparent hover:border-[#7C3AED]/20 hover:bg-[#F9FAFB] transition-all text-left group"
                  >
                    <div className={`${config.color} bg-gray-50 p-2.5 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all`}>
                      <config.icon size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-gray-900 block leading-tight">{config.label}</span>
                      <span className="text-[10px] font-medium text-gray-400 leading-tight block mt-1">{config.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Builder Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-12 bg-gray-50/50 pb-32">
          <div className="max-w-3xl mx-auto space-y-8">
            {questions.length === 0 ? (
              <div className="text-center py-20 md:py-32 flex flex-col items-center">
                <div className="w-24 h-24 bg-[#7C3AED]/5 rounded-full flex items-center justify-center mb-8">
                  <HelpCircle size={48} className="text-[#7C3AED] opacity-20" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight">Your Canvas is Empty</h2>
                <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10 text-sm">
                  Select a question type from the left sidebar to begin building your professional assessment.
                </p>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-white border-2 border-dashed border-[#7C3AED]/30 text-[#7C3AED] px-10 py-4 rounded-3xl font-black text-sm hover:bg-[#7C3AED]/5 transition-all shadow-sm active:scale-95"
                >
                  + Add First Element
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, idx) => {
                  const config = TYPE_CONFIG[q.type];
                  return (
                    <div key={q.id} className="group relative bg-white border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm hover:shadow-2xl hover:border-[#7C3AED]/30 transition-all duration-500">
                      
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#7C3AED] rounded-l-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs md:text-sm font-black">
                            {idx + 1}
                          </span>
                          <div className={`${config.color} bg-gray-50 px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest`}>
                            {config.label}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button onClick={() => removeQuestion(q.id)} className="p-2 text-gray-300 hover:text-red-500 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <textarea
                          placeholder="What is the question prompt?"
                          value={q.text}
                          onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                          className="w-full text-xl md:text-2xl font-black text-gray-900 placeholder:text-gray-200 bg-transparent border-none focus:ring-0 resize-none min-h-[60px]"
                        />

                        {/* Options Section */}
                        {q.options && (
                          <div className="space-y-3">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center">
                                <button 
                                  onClick={() => updateQuestion(q.id, { correctAnswer: opt })}
                                  className={`p-1.5 rounded-full transition-colors ${q.correctAnswer === opt ? 'text-[#10B981]' : 'text-gray-200'}`}
                                >
                                  {q.correctAnswer === opt ? <CheckCircle size={22} /> : <Circle size={22} />}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const next = [...(q.options || [])];
                                    next[oIdx] = e.target.value;
                                    updateQuestion(q.id, { options: next });
                                  }}
                                  className={`flex-1 mx-3 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${q.correctAnswer === opt ? 'border-[#10B981]/40 bg-[#10B981]/5 text-[#10B981]' : 'border-transparent bg-gray-50'}`}
                                />
                              </div>
                            ))}
                            <button 
                              onClick={() => addOption(q.id)}
                              className="ml-10 text-[10px] font-black text-[#7C3AED] uppercase tracking-widest flex items-center space-x-1"
                            >
                              <Plus size={14} />
                              <span>Add Answer Option</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">Weight</span>
                          <input 
                            type="number" 
                            value={q.points}
                            onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 0 })}
                            className="w-10 bg-transparent border-none text-center font-black text-gray-900 p-0 text-sm focus:ring-0"
                          />
                        </div>
                        <GripVertical size={20} className="text-gray-300 cursor-grab" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Save Bar - Fixed for Mobile */}
      <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 bg-white border border-gray-100 px-6 py-4 rounded-[2rem] shadow-2xl flex items-center space-x-6 z-50 whitespace-nowrap">
         <div className="hidden sm:flex flex-col items-center border-r border-gray-100 pr-6">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Questions</span>
            <span className="text-lg font-black text-gray-900">{questions.length}</span>
         </div>
         <button className="flex items-center space-x-2 px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
            <Save size={16} />
            <span>Save Draft</span>
         </button>
      </div>
    </div>
  );
};

export default CreateExam;
