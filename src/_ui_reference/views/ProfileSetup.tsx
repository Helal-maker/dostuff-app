
import React, { useState, useContext } from 'react';
import * as Router from 'react-router-dom';
import { GraduationCap, School, User, Users, Check, Sparkles } from 'lucide-react';
import { AuthContext } from '../types';

const { useNavigate } = Router;

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [teachingType, setTeachingType] = useState('school');
  const [formData, setFormData] = useState({
    subject: user?.role === 'teacher' ? 'English Literature' : 'Pharmacology',
    experience: '5',
    gradYear: '2020',
    degree: 'Master of Arts'
  });

  const handleFinish = () => {
    if (user) {
      setUser({
        ...user,
        name: user.name || 'Micke',
        subject: formData.subject,
        experience: formData.experience
      });
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-stretch">
      {/* Decorative Branding Column */}
      <div className="w-full md:w-1/3 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
            <Sparkles size={32} />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight">Tailor Your Journey.</h1>
          <p className="text-white/70 text-lg font-medium">
            Personalizing your profile helps us provide the most relevant academic tools for your specific role.
          </p>
        </div>
        <div className="relative z-10 pt-12 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-white/50">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span>Drafting your identity</span>
        </div>
      </div>

      {/* Main Form Column */}
      <div className="flex-1 bg-white p-8 md:p-20 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Professional Details</h2>
          
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Main Subject</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/10 transition-all outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Years Active</label>
                <input 
                  type="number" 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/10 transition-all outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Work Setting</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'school', label: 'Institution', icon: School },
                  { id: 'private', label: 'Freelance', icon: User },
                  { id: 'both', label: 'Hybrid', icon: Users }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setTeachingType(type.id)}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all relative ${
                      teachingType === type.id 
                        ? 'border-[#7C3AED] bg-[#7C3AED]/5' 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {teachingType === type.id && (
                      <div className="absolute top-2 right-2 text-[#7C3AED]">
                        <Check size={14} />
                      </div>
                    )}
                    <type.icon size={20} className={teachingType === type.id ? 'text-[#7C3AED]' : 'text-gray-400'} />
                    <span className={`text-[10px] font-black uppercase tracking-tight mt-2 ${teachingType === type.id ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Certification / Degree</label>
              <input 
                type="text" 
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white outline-none transition-all font-bold"
              />
            </div>

            <div className="pt-8">
              <button
                onClick={handleFinish}
                className="w-full py-4 bg-[#7C3AED] text-white font-black rounded-2xl shadow-2xl shadow-[#7C3AED]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
              >
                <span>Finalize My Profile</span>
                <Sparkles size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
