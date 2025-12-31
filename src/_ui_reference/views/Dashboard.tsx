
import React, { useContext } from 'react';
import * as Router from 'react-router-dom';
import { Settings, Trophy, FileText, CheckCircle, Award, Clock, Search, Filter, Plus, Activity, User, Book } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { AuthContext } from '../types';

const { useNavigate } = Router;

const data = [
  { name: 'Mon', score: 45, classAvg: 40 },
  { name: 'Tue', score: 52, classAvg: 45 },
  { name: 'Wed', score: 38, classAvg: 42 },
  { name: 'Thu', score: 65, classAvg: 40 },
  { name: 'Fri', score: 48, classAvg: 48 },
  { name: 'Sat', score: 85, classAvg: 50 },
  { name: 'Sun', score: 92, classAvg: 52 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="flex-1 flex flex-col p-4 md:p-10 max-w-7xl mx-auto w-full space-y-10 pb-24 md:pb-10">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-1">Academic Pulse</h1>
          <p className="text-gray-500 font-medium">Monitoring {isTeacher ? 'class performance' : 'your progress'} in real-time.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative group flex-1 md:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#7C3AED] transition-colors" size={18} />
             <input type="text" placeholder="Search assessments..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] outline-none transition-all" />
          </div>
          {isTeacher && (
            <button 
              onClick={() => navigate('/create-exam')}
              className="bg-[#7C3AED] text-white p-3 md:px-6 md:py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl shadow-[#7C3AED]/20 hover:scale-[1.05] transition-all"
            >
              <Plus size={20} />
              <span className="hidden md:block">Create New</span>
            </button>
          )}
        </div>
      </header>

      {/* Stunning Performance Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity size={120} className="text-[#7C3AED]" />
          </div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black text-gray-900">Success Analytics</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Weekly Mastery Score</p>
            </div>
            <div className="flex space-x-2">
               <button className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] transition-all">Last 7 Days</button>
               <button className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] transition-all">Last Month</button>
            </div>
          </div>

          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {/* Dynamic Vertical Gradient for Performance: Red (Low) -> Yellow -> Green (High) */}
                  <linearGradient id="performanceGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/> {/* Red for low */}
                    <stop offset="50%" stopColor="#EAB308" stopOpacity={1}/> {/* Yellow mid */}
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={1}/> {/* Green high */}
                  </linearGradient>
                  
                  <linearGradient id="performanceFill" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="50%" stopColor="#EAB308" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0.2}/>
                  </linearGradient>

                  <linearGradient id="avgColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c7d2fe" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#cbd5e1'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#cbd5e1'}} />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '5px', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="classAvg" stroke="#c7d2fe" strokeWidth={2} fillOpacity={1} fill="url(#avgColor)" />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="url(#performanceGradient)" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#performanceFill)" 
                  dot={{ r: 6, fill: 'url(#performanceGradient)', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 4 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insight Panel */}
        <div className="bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-10 -translate-y-10"></div>
           <div className="relative z-10">
             <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
               <Trophy size={24} />
             </div>
             <h4 className="text-2xl font-black mb-2">Achievement Unlocked!</h4>
             <p className="text-white/70 font-medium text-sm leading-relaxed mb-8">
               {isTeacher 
                ? "32 students have completed 'Pharmacy Final' with distinction today." 
                : "You've maintained a 90%+ score for 3 weeks straight. Keep it up!"}
             </p>
           </div>
           
           <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#7C3AED] bg-indigo-200"></div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">+12 more events</span>
           </div>
        </div>
      </section>

      {/* Interactive Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: isTeacher ? "Total Students" : "Active Exams", value: isTeacher ? "1,240" : "12", icon: isTeacher ? User : Book, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Completed", value: "85%", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
          { label: "Medals", value: "14", icon: Award, color: "text-yellow-500", bg: "bg-yellow-50" },
          { label: "Study Time", value: "24h", icon: Clock, color: "text-pink-500", bg: "bg-pink-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-100 p-6 rounded-[2rem] flex flex-col items-center text-center group hover:scale-[1.05] transition-all cursor-default shadow-sm hover:shadow-md">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <span className="text-2xl font-black text-gray-900 leading-none mb-1">{stat.value}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Recently Viewed / Action List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-900">Recent Activity</h3>
          <button className="text-[#7C3AED] text-sm font-black hover:underline">View History</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Neuroscience 101", date: "Today", score: 98, status: "Distinction" },
            { title: "Calculus Review", date: "Yesterday", score: 85, status: "Pass" },
            { title: "Global History", date: "2 days ago", score: 42, status: "Failed" },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 p-5 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-lg transition-all group border-l-4 border-l-[#7C3AED]">
              <div>
                <h5 className="font-bold text-gray-900 group-hover:text-[#7C3AED] transition-colors">{item.title}</h5>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{item.date}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${item.score >= 50 ? 'text-green-500' : 'text-red-500'}`}>{item.score}%</span>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
