
import React, { useContext, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  Bell, LogOut, User, Shield, Info, ChevronRight, 
  Moon, ChevronLeft, Globe, HelpCircle 
} from 'lucide-react';
import { AuthContext } from '../types';

const { useNavigate } = Router;

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState(true);

  const handleSignOut = () => {
    setUser(null);
    navigate('/login');
  };

  const menuItems = [
    { icon: User, label: 'Account Profile', desc: 'Personal info, identity verify', color: 'bg-blue-50 text-blue-600', action: () => navigate('/profile-setup') },
    { icon: Shield, label: 'Security', desc: 'Password, biometrics, 2FA', color: 'bg-indigo-50 text-indigo-600' },
    { icon: Bell, label: 'Notifications', desc: 'Alerts, push, email', color: 'bg-purple-50 text-purple-600', toggle: true },
    { icon: Moon, label: 'Display Mode', desc: 'Dark theme, system sync', color: 'bg-slate-50 text-slate-600' },
    { icon: Globe, label: 'Language', desc: 'English (US)', color: 'bg-emerald-50 text-emerald-600' },
    { icon: HelpCircle, label: 'Help Center', desc: 'FAQs, live support', color: 'bg-orange-50 text-orange-600', action: () => navigate('/how-it-works') },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen pb-32">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-xl z-10 flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">System Settings</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* User Card */}
        <div className="bg-[#F8FAFC] rounded-[2rem] p-6 flex items-center space-x-4 border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-white font-black text-2xl shadow-md">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-black text-gray-900 truncate leading-tight">{user?.name || 'Micke'}</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{user?.role || 'Academic'}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <div 
              key={idx}
              onClick={item.action}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className={`${item.color} p-3 rounded-xl shadow-sm`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900 leading-tight">{item.label}</p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
              {item.toggle ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                  className={`w-11 h-6 rounded-full transition-all relative ${notifications ? 'bg-[#10B981]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
                </button>
              ) : (
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
              )}
            </div>
          ))}
        </div>

        <div className="h-px bg-gray-50 my-2"></div>

        {/* Exit Actions */}
        <div className="space-y-3">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center space-x-4 p-4 rounded-2xl text-[#F43F5E] hover:bg-rose-50 transition-all font-black text-[13px] uppercase tracking-widest group"
          >
            <div className="bg-rose-50 p-3 rounded-xl">
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>Sign Out From Device</span>
          </button>
        </div>

        <div className="text-center pt-8">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Version 2.4.0 (Stable)</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
