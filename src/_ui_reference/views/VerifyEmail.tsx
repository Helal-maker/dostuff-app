
import React, { useState, useEffect, useRef } from 'react';
import * as Router from 'react-router-dom';
import { Clock, ShieldCheck, ArrowRight } from 'lucide-react';

const { useNavigate } = Router;

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(299);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-50">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Visual Side */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white"></div>
             <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-4xl font-black mb-4 leading-tight">Secure Your Account</h2>
            <p className="text-white/70 text-lg font-medium">
              We've sent a unique 6-digit access code to verify your academic identity.
            </p>
          </div>
        </div>

        {/* Input Side */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="md:hidden flex justify-center mb-8">
            <div className="w-12 h-12 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center text-[#7C3AED]">
              <ShieldCheck size={24} />
            </div>
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-2">Verification Code</h3>
          <p className="text-gray-500 font-medium mb-10 text-sm">
            Enter the code sent to <span className="text-[#7C3AED] font-bold">micke@exampro.edu</span>
          </p>

          <div className="flex justify-between gap-2 mb-8">
            {code.map((digit, i) => (
              <input
                key={i}
                // Fix: ensure ref callback returns void by using curly braces
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-full h-14 md:h-16 text-2xl font-black text-center border-2 rounded-2xl transition-all outline-none ${
                  digit 
                    ? 'border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED]' 
                    : 'border-gray-200 bg-gray-50' // Added border-gray-200 for visibility
                } focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <Clock size={14} />
              <span>Expires in <span className="text-gray-900">{formatTime(timer)}</span></span>
            </div>
            <button className="text-[#7C3AED] text-xs font-bold hover:underline">Resend Code</button>
          </div>

          <button
            onClick={() => navigate('/profile-setup')}
            disabled={code.some(d => !d)}
            className="w-full py-4 bg-[#7C3AED] text-white font-bold rounded-2xl shadow-xl shadow-[#7C3AED]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            <span>Verify & Continue</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
