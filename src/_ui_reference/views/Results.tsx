
import React from 'react';
import * as Router from 'react-router-dom';
import { 
  Trophy, Clock, CheckCircle2, XCircle, 
  Share2, Printer, ArrowRight, Award, Zap, Star, ShieldCheck
} from 'lucide-react';

const { useNavigate } = Router;

const Results: React.FC = () => {
  const navigate = useNavigate();
  const score = 92;

  const questions = [
    { 
      id: 1, 
      text: "What is the primary function of neurotransmitters in the synaptic gap?", 
      isCorrect: true, 
      category: "BIOLOGICAL BASIS" 
    },
    { 
      id: 2, 
      text: "Calculate the equilibrium constant for the provided chemical reaction.", 
      isCorrect: false, 
      category: "STOICHIOMETRY" 
    },
    { 
      id: 3, 
      text: "Which philosophical movement focused on 'existence preceding essence'?", 
      isCorrect: true, 
      category: "EXISTENTIALISM" 
    },
    { 
      id: 4, 
      text: "Identify the primary source of carbon emissions in heavy industrial sectors.", 
      isCorrect: true, 
      category: "SUSTAINABILITY" 
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#FDFDFF] min-h-screen pb-32 md:pb-10 overflow-x-hidden">
      {/* Dynamic Header Banner */}
      <div className="relative w-full bg-[#10B981] pt-16 pb-32 px-6 text-center text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl backdrop-blur-md mb-6 shadow-lg border border-white/30">
            <Trophy size={32} className="text-white drop-shadow-sm" />
          </div>
          <h2 className="text-4xl md:text-6xl font-[1000] mb-4 tracking-tight leading-none">Congratulations!</h2>
          <p className="text-white/80 font-semibold text-base md:text-xl max-w-sm mx-auto">
            You have officially passed the assessment with honors.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 -mt-24 relative z-20 flex flex-col md:flex-row items-start gap-6 lg:gap-8">
        
        {/* Left Column: The Achievement Hub */}
        <div className="w-full md:w-[340px] lg:w-[400px] shrink-0 flex flex-col">
          <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative flex-1 flex flex-col justify-between">
             
             {/* Header */}
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2.5">
                   <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Evaluation Score</span>
                </div>
                <div className="bg-[#DCFCE7] text-[#166534] px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                   <Star size={10} fill="currentColor" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Elite Tier</span>
                </div>
             </div>

             {/* Score Heat Map Chart - Perfectly responsive grid */}
             <div className="flex flex-col items-center justify-center flex-1 py-4">
                {/* 10x10 Heatmap Grid Container */}
                <div className="p-4 md:p-5 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8 shadow-inner relative overflow-hidden group">
                  {/* Subtle Glow Effect behind active area */}
                  <div className="absolute inset-0 bg-emerald-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                  
                  {/* Grid - Adjusted sizes for Tablet (md) vs Desktop (lg/xl) */}
                  <div className="grid grid-cols-10 gap-2 md:gap-1.5 lg:gap-2 xl:gap-2.5">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`
                          w-3 h-3 
                          sm:w-4 sm:h-4 
                          md:w-3.5 md:h-3.5 
                          lg:w-4 lg:h-4 
                          xl:w-5 xl:h-5 
                          rounded-[3px] lg:rounded-[4px] 
                          transition-all duration-700 ease-out 
                          ${i < score 
                            ? 'bg-[#10B981] shadow-[0_1px_2px_rgba(16,185,129,0.3)]' 
                            : 'bg-slate-200'}
                        `}
                        style={{ 
                          opacity: i < score ? 0.3 + (i / 100) * 0.7 : 0.5,
                          transform: i < score ? 'scale(1)' : 'scale(0.85)'
                        }}
                        title={`Point ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Score Text Overlay */}
                <div className="flex flex-col items-center">
                    <div className="flex items-baseline -mr-2 mb-3">
                        <span className="text-6xl lg:text-7xl font-[1000] text-gray-900 tracking-tighter">{score}</span>
                        <span className="text-2xl lg:text-3xl font-black text-gray-300 ml-1">%</span>
                    </div>
                    <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center space-x-2 hover:scale-105 transition-transform cursor-default">
                        <Zap size={14} className="text-[#10B981]" fill="currentColor" />
                        <span>Mastery Level</span>
                    </div>
                </div>
             </div>

             {/* Stats Footer */}
             <div className="grid grid-cols-2 gap-3 mt-8 pt-8 border-t border-gray-50">
                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center border border-gray-100 group hover:border-[#10B981]/20 transition-colors">
                   <Clock size={18} className="text-gray-400 mb-1 group-hover:text-[#10B981] transition-colors" />
                   <span className="text-lg font-[900] text-gray-900">42m</span>
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                </div>
                 <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center border border-gray-100 group hover:border-[#10B981]/20 transition-colors">
                   <ShieldCheck size={18} className="text-[#10B981] mb-1" />
                   <span className="text-lg font-[900] text-gray-900">Pass</span>
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Result</span>
                </div>
             </div>
             
             {/* Action Buttons */}
             <div className="flex gap-3 mt-4">
                <button className="flex-1 py-4 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center space-x-2">
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 transition-all flex items-center justify-center space-x-2">
                  <Printer size={14} />
                  <span>Print</span>
                </button>
             </div>

          </div>
        </div>

        {/* Right Column: Detailed Section Review */}
        <div className="flex-1 w-full min-w-0 bg-white rounded-[2.5rem] p-6 lg:p-12 shadow-2xl shadow-gray-200/40 border border-gray-100 flex flex-col mb-24 md:mb-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-emerald-50 text-[#10B981] rounded-2xl">
                  <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tight leading-none">Insight Panel</h3>
              </div>
              <p className="text-gray-400 font-bold text-sm ml-[3.25rem]">Granular response analysis & feedback</p>
            </div>
            <div className="flex flex-col items-end">
               <div className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl flex items-center space-x-3 shadow-sm">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Modules Verified</span>
                 <span className="text-xl font-[900] text-gray-900">34</span>
               </div>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {questions.map((q) => (
              <div 
                key={q.id} 
                className="group flex flex-col lg:flex-row items-stretch justify-between bg-[#F8FAFC] rounded-[2rem] border-2 border-transparent hover:border-[#10B981]/10 hover:bg-white transition-all duration-300 p-2 shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center space-x-6 p-4 md:p-6 flex-1 min-w-0">
                  <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${q.isCorrect ? 'text-[#10B981] bg-[#10B981]/10 shadow-inner' : 'text-[#F43F5E] bg-[#F43F5E]/10 shadow-inner'}`}>
                    {q.isCorrect ? <CheckCircle2 size={24} strokeWidth={2.5} /> : <XCircle size={24} strokeWidth={2.5} />}
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <p className="text-[16px] font-[800] text-gray-800 leading-[1.4] group-hover:text-gray-900 transition-colors break-words">
                      {q.text}
                    </p>
                    <div className="flex items-center space-x-3">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white border border-gray-100 px-3 py-1 rounded-lg group-hover:bg-gray-50 transition-colors">
                        {q.category}
                      </span>
                      {q.isCorrect && <span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest">+10 PTS</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center p-6 border-t lg:border-t-0 lg:border-l border-gray-100 group-hover:border-[#10B981]/10 transition-colors">
                  <button className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#10B981] group-hover:scale-110 transition-all active:scale-95">
                    <ArrowRight size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-10 bg-[#0F172A] rounded-[2.5rem] relative overflow-hidden text-center flex flex-col items-center border border-white/5">
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-[#10B981]/20 text-[#10B981] p-3 rounded-2xl mb-6 shadow-xl backdrop-blur-sm">
                 <Zap size={28} fill="currentColor" />
              </div>
              <h4 className="text-2xl font-[1000] text-white mb-3 tracking-tight">Ready for the Next Tier?</h4>
              <p className="text-slate-400 font-medium text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                We've curated specialized modules that align with your current 92% mastery proficiency.
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-10 py-4 bg-white text-gray-900 font-[1000] rounded-2xl shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-[#10B981] hover:text-white hover:shadow-[#10B981]/30 active:scale-95 transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.2em] text-[10px]"
              >
                <span>Advance to Next Level</span>
                <ArrowRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
