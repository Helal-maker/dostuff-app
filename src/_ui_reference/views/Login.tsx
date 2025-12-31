
import React, { useState, useContext } from 'react';
import * as Router from 'react-router-dom';
import { Mail, Lock, EyeOff, GraduationCap, UserCircle, ArrowRight, Shield } from 'lucide-react';
import { AuthContext, UserRole } from '../types';

const { useNavigate } = Router;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      id: '1',
      name: 'Micke',
      role: role,
      email: 'micke@exampro.edu'
    });
    navigate('/verify-email');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Left: Brand / Promo Column */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-[#7C3AED] text-white relative">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-2xl"></div>
             <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 backdrop-blur-md">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-5xl font-black mb-6 tracking-tight leading-none">Empowering Global Learning.</h2>
            <p className="text-white/70 text-lg font-medium leading-relaxed">
              Join thousands of students and teachers who use ExamPro to measure progress and achieve excellence.
            </p>
          </div>

          <div className="relative z-10 flex items-center space-x-3 text-xs font-black uppercase tracking-widest">
            <Shield size={16} />
            <span>Secure Enterprise Architecture</span>
          </div>
        </div>

        {/* Right: Form Column */}
        <div className="p-10 md:p-20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Sign In</h1>
            <p className="text-gray-500 font-medium mb-10">Welcome back! Please select your role.</p>

            {/* Role Switcher - Stunning Toggle */}
            <div className="flex bg-[#F1F5F9] p-1.5 rounded-[1.5rem] mb-10">
              <button 
                onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all ${role === 'student' ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-gray-400'}`}
              >
                <UserCircle size={18} />
                <span>Student</span>
              </button>
              <button 
                onClick={() => setRole('teacher')}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all ${role === 'teacher' ? 'bg-white text-[#7C3AED] shadow-sm' : 'text-gray-400'}`}
              >
                <GraduationCap size={18} />
                <span>Teacher</span>
              </button>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900"
                  >
                    <EyeOff size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold px-4">
                <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="rounded-md border-gray-200 text-[#7C3AED] focus:ring-[#7C3AED]" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-[#7C3AED] hover:underline">Forgot Password?</button>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 group"
              >
                <span>Enter Academic Dashboard</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-sm font-bold text-gray-500">
                Don't have an account? <button onClick={() => navigate('/profile-setup')} className="text-[#7C3AED] font-black">Register Now</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
