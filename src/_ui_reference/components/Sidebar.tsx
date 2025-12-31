
import React, { useContext } from 'react';
import * as Router from 'react-router-dom';
import { Home, HelpCircle, PlusCircle, BookOpen, BarChart2, GraduationCap, LogOut, Settings } from 'lucide-react';
import { AuthContext } from '../types';

const { NavLink } = Router;

const Sidebar: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/how-it-works', label: 'How it Works', icon: HelpCircle },
    { to: '/exams', label: 'Exams', icon: BookOpen },
    { to: '/results', label: 'Results', icon: BarChart2 },
  ];

  if (user?.role === 'teacher') {
    navItems.splice(2, 0, { to: '/create-exam', label: 'Create Exam', icon: PlusCircle });
  }

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0">
      {/* Brand Section */}
      <div className="p-8 flex items-center space-x-4">
        <div className="bg-[#7C3AED] w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/20">
          <GraduationCap size={28} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-[#7C3AED]">ExamPro</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${
                isActive 
                  ? 'bg-[#7C3AED] text-white shadow-xl shadow-[#7C3AED]/20 translate-x-1' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={22} />
            <span className="text-[15px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Actions Footer - Matches Screenshot */}
      <div className="p-6 mt-auto">
        <div className="bg-[#F8FAFC] rounded-[2rem] p-5 mb-4 border border-gray-50 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white font-black text-lg shadow-sm">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-black text-gray-900 truncate leading-tight">{user?.name || 'Academic'}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{user?.role || 'Guest'}</p>
          </div>
        </div>
        
        <NavLink 
          to="/login" 
          onClick={handleSignOut}
          className="flex items-center space-x-4 px-6 py-3 text-gray-400 hover:text-[#F43F5E] transition-colors font-black text-[12px] uppercase tracking-widest group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
