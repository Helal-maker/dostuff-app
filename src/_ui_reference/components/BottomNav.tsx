
import React, { useContext } from 'react';
import * as Router from 'react-router-dom';
import { Home, HelpCircle, PlusCircle, BookOpen, BarChart2, Settings } from 'lucide-react';
import { AuthContext } from '../types';

const { NavLink } = Router;

const BottomNav: React.FC = () => {
  const { user } = useContext(AuthContext);

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: Home },
    // Help removed as per request to move to Settings/ensure context there
    { to: '/exams', label: 'Exams', icon: BookOpen },
    { to: '/results', label: 'Results', icon: BarChart2 },
  ];

  if (user?.role === 'teacher') {
    navItems.splice(1, 0, { to: '/create-exam', label: 'Create', icon: PlusCircle });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6">
      <nav className="bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-3 flex justify-between items-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center space-y-1 transition-all duration-300 flex-1 py-1 ${
                isActive ? 'text-[#7C3AED] scale-110' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-[#7C3AED]/10' : ''}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 flex-1 py-1 transition-all ${
              isActive ? 'text-[#7C3AED] scale-110' : 'text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-[#7C3AED]/10' : ''}`}>
                <Settings size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">Settings</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNav;
