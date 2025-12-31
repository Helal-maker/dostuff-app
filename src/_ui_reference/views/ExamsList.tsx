
import React from 'react';
import * as Router from 'react-router-dom';
import { Settings, Share2, Plus, ChevronRight } from 'lucide-react';

const { useNavigate } = Router;

const ExamsList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-24">
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 bg-white">
        <button onClick={() => navigate('/settings')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <Settings size={22} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-bold">Dashboard</h1>
        <div className="w-6"></div>
      </div>

      <div className="p-6">
        <h2 className="text-3xl font-extrabold mb-1">Welcome back, Micke!</h2>
        <p className="text-gray-500 font-medium mb-8">Manage your exams and track progress</p>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'Total Exams', value: '2', icon: 'bg-purple-100 text-purple-600' },
            { label: 'Attempts', value: '0', icon: 'bg-blue-100 text-blue-600' },
            { label: 'Published Exams', value: '2', icon: 'bg-indigo-100 text-indigo-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center border border-gray-100/50">
              <div className={`w-10 h-10 rounded-xl ${stat.icon} flex items-center justify-center mb-2`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              </div>
              <span className="text-[10px] font-bold text-gray-400 text-center leading-tight mb-1">{stat.label}</span>
              <span className="text-xl font-black">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Your Exams</h3>
          <button className="text-[#7C3AED] font-bold text-sm">View All</button>
        </div>

        <div className="space-y-4">
          {[
            { title: 'Countries Capitals', desc: 'Simple test for picking countries Capitals', attempts: 0, q: 1, date: '12/30/2025' },
            { title: 'Test 2', desc: 'Just is a test', attempts: 0, q: 2, date: '12/30/2025' },
          ].map((exam, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-lg font-extrabold text-gray-900">{exam.title}</h4>
                <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">Published</span>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-3">{exam.desc}</p>
              
              <div className="flex space-x-6 text-[12px] font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium text-[10px]">Attempts:</span>
                  <span>{exam.attempts}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium text-[10px]">Questions:</span>
                  <span>{exam.q}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-[12px] font-bold text-gray-900">
                  <span>{exam.date}</span>
                  <span className="text-gray-400">English</span>
                </div>
                <button className="px-6 py-2 bg-[#7C3AED] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#7C3AED]/20 flex items-center space-x-2">
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamsList;
