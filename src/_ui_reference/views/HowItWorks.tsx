
import React from 'react';
// Use namespace import for react-router-dom
import * as Router from 'react-router-dom';
import { User, GraduationCap, ChevronRight, Book, ClipboardList, Settings, Share2, BarChart2, LogIn, PlayCircle, Edit3, Award } from 'lucide-react';

const { useNavigate } = Router;

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto pb-24">
      <div className="px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-extrabold text-[#7C3AED] mb-2 leading-tight">How it Works / Onboarding</h1>
        <p className="text-gray-500 font-medium px-4">Your guide to creating, taking, and analyzing exams on Do stuff.</p>
      </div>

      <div className="px-6 space-y-6 mb-10">
        {/* For Teachers Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-xl text-[#7C3AED]">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-xl font-extrabold text-[#7C3AED]">For Teachers</h2>
          </div>

          <div className="space-y-4">
            {[
              { icon: Book, title: 'Plan & Prepare', desc: 'Organize your curriculum and materials.' },
              { icon: ClipboardList, title: 'Create Your Exam', desc: 'Build quizzes with various question types.' },
              { icon: Settings, title: 'Configure Settings', desc: 'Customize timers, scoring, and access.' },
              { icon: Share2, title: 'Share & Monitor', desc: 'Distribute tests and track progress in real-time.' },
              { icon: BarChart2, title: 'Review & Grade', desc: 'Analyze performance and provide feedback.' },
            ].map((item, i) => (
              <div key={i} className="flex space-x-4">
                <item.icon className="text-[#4F46E5] mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">{item.title}:</h4>
                  <p className="text-xs text-gray-500 font-medium leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* For Students Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600">
              <User size={24} />
            </div>
            <h2 className="text-xl font-extrabold text-yellow-600">For Students</h2>
          </div>

          <div className="space-y-4">
            {[
              { icon: LogIn, title: 'Join Exam', desc: 'Enter code to start your assessment.' },
              { icon: PlayCircle, title: 'Start Assessment', desc: 'Begin with clear instructions and timer.' },
              { icon: Edit3, title: 'Answer Questions', desc: 'Tackle multiple-choice, fill-in-the-blank, etc.' },
              { icon: Award, title: 'Get Results', desc: 'Receive instant scores and detailed feedback.' },
            ].map((item, i) => (
              <div key={i} className="flex space-x-4">
                <item.icon className="text-yellow-500 mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">{item.title}:</h4>
                  <p className="text-xs text-gray-500 font-medium leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ready to Get Started Section */}
      <div className="px-6 text-center space-y-4 pb-8">
        <h3 className="text-xl font-bold text-gray-600">Ready to Get Started?</h3>
        <button className="w-full py-4 bg-[#4F46E5] text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-2 active:scale-[0.98] transition-all">
          <span>Join First Exam</span>
          <ChevronRight size={18} />
        </button>

        <div className="pt-6 space-y-1">
          <p className="text-[10px] text-gray-400 font-medium">© 2025 Do stuff. All rights reserved.</p>
          <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-bold">
            <span>Made with ❤️</span>
            <span>|</span>
            <button className="hover:text-gray-600">Terms of Service</button>
            <span>|</span>
            <button className="hover:text-gray-600">Privacy Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
