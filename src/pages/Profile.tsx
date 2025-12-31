import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SecureAvatar from "@/components/ui/secure-avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import {
  ArrowLeft,
  Camera,
  Loader2,
  School,
  Users,
  UserPlus,
  LogOut,
  BarChart3,
  MoreVertical,
  Sparkles,
  GraduationCap,
  User,
  Check
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import ContributionHeatmap from "@/components/exam/ContributionHeatmap";

interface ExamStats {
  totalExams: number;
  passedExams: number;
  failedExams: number;
  averageScore: number;
}

interface PerformanceTrendData {
  date: string;
  score: number;
  count: number;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrendData[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [teachingType, setTeachingType] = useState('school');
  const [formData, setFormData] = useState({
    subject: 'English Literature',
    experience: '5',
    gradYear: '2020',
    degree: 'Master of Arts'
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, isTeacher } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchExamStats();
      fetchPerformanceTrend();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfileData(data);
      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url);
    }
  };

  const fetchExamStats = async () => {
    if (!user?.id) return;

    if (isTeacher) {
      // Fetch teacher's exam stats
      const { data: exams } = await supabase
        .from('exams')
        .select('id')
        .eq('teacher_id', user.id);

      const examIds = exams?.map(e => e.id) || [];
      
      if (examIds.length > 0) {
        const { data: attempts } = await supabase
          .from('exam_attempts')
          .select('score, passed, is_completed')
          .in('exam_id', examIds)
          .eq('is_completed', true);

        const completedAttempts = attempts || [];
        const passedCount = completedAttempts.filter(a => a.passed).length;
        const avgScore = completedAttempts.length > 0
          ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
          : 0;

        setExamStats({
          totalExams: examIds.length,
          passedExams: passedCount,
          failedExams: completedAttempts.length - passedCount,
          averageScore: Math.round(avgScore)
        });
      }
    } else {
      // Fetch student's exam stats
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('score, passed, is_completed')
        .eq('student_id', user.id)
        .eq('is_completed', true);

      const completedAttempts = attempts || [];
      const passedCount = completedAttempts.filter(a => a.passed).length;
      const avgScore = completedAttempts.length > 0
        ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
        : 0;

      setExamStats({
        totalExams: completedAttempts.length,
        passedExams: passedCount,
        failedExams: completedAttempts.length - passedCount,
        averageScore: Math.round(avgScore)
      });
    }
  };

  const fetchPerformanceTrend = async () => {
    if (!user?.id) return;
    
    setLoadingTrend(true);
    try {
      let attempts: any[] = [];
      
      if (isTeacher) {
        // For teachers, get performance from their students' attempts on their exams
        const { data: exams } = await supabase
          .from('exams')
          .select('id')
          .eq('teacher_id', user.id);
        
        const examIds = exams?.map(e => e.id) || [];
        
        if (examIds.length > 0) {
          const { data: attemptsData } = await supabase
            .from('exam_attempts')
            .select(`
              score,
              end_time,
              is_completed,
              passed
            `)
            .in('exam_id', examIds)
            .eq('is_completed', true)
            .order('end_time', { ascending: true });
          
          attempts = attemptsData || [];
        }
      } else {
        // For students, get their own attempts
        const { data: attemptsData } = await supabase
          .from('exam_attempts')
          .select(`
            score,
            end_time,
            is_completed,
            passed
          `)
          .eq('student_id', user.id)
          .eq('is_completed', true)
          .order('end_time', { ascending: true });
        
        attempts = attemptsData || [];
      }
      
      // Group attempts by day for the GitHub-style heatmap
      const dailyData: { [key: string]: { score: number, count: number } } = {};
      
      attempts.forEach(attempt => {
        const date = new Date(attempt.end_time);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = { score: 0, count: 0 };
        }
        
        dailyData[dateKey].score += attempt.score || 0;
        dailyData[dateKey].count++;
      });
      
      // Convert to the format expected by the heatmap
      const trendData = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          score: Math.round(data.score / data.count), // Average score for the day
          count: data.count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setPerformanceTrend(trendData);
    } catch (error) {
      console.error('Error fetching performance trend:', error);
      setPerformanceTrend([]);
    } finally {
      setLoadingTrend(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture updated!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          teaching_type: teachingType,
          subject: formData.subject,
          experience: formData.experience,
          grad_year: formData.gradYear,
          degree: formData.degree
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Dynamic performance data is now fetched via fetchPerformanceTrend
  // The performanceTrend state contains the real user data
  const performanceData = loadingTrend ? [] : performanceTrend;

  // Convert performance data to ContributionHeatmap format
  const contributionData = performanceData.map(item => ({
    date: item.date,
    value: item.score
  }));

  const renderProfileContent = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-stretch">
      {/* Decorative Branding Column */}
      <div className="w-full md:w-1/3 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-indigo-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <a 
            className="inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity mb-6" 
            href="#"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="text-lg mr-1" />
            Back to Dashboard
          </a>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">My Profile</h1>
          <p className="text-white/70 text-lg font-medium">
            Manage your profile information, track your academic performance, and customize your learning experience.
          </p>
        </div>
        
        <div className="relative z-10 pt-8 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-white/50">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span>Managing your identity</span>
        </div>
      </div>

      {/* Main Form Column */}
      <div className="flex-1 bg-white p-6 md:p-12 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                  <SecureAvatar
                    src={avatarUrl}
                    alt="Profile Picture"
                    fallback={getInitials(fullName || user?.email || 'U')}
                    size="xl"
                    className="w-full h-full border-0"
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-[#7C3AED] text-white p-1.5 rounded-full shadow-lg hover:bg-[#6D28D9] transition-colors flex items-center justify-center border-2 border-white cursor-pointer">
                  <Camera className="text-sm" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{fullName || 'User'}</h2>
                <p className="text-gray-500 mb-3 break-all">{user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                    <School className="text-sm mr-1" />
                    {isTeacher ? "Teacher" : "Student"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <GraduationCap className="text-sm mr-1" />
                    Verified Profile
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => window.open('https://t.me/+P-Vu76yybMA5MjBk', '_blank')}
                  className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  <UserPlus className="text-sm mr-2" />
                  Join Community
                </Button>
                <Button
                  onClick={handleSignOut}
                  className="flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-medium transition-colors"
                >
                  <LogOut className="text-sm mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Professional Details Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-xl font-black text-gray-900 mb-6">Professional Details</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Main Subject</Label>
                  <Input 
                    type="text" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/10 transition-all outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Years Active</Label>
                  <Input 
                    type="number" 
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/10 transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Work Setting</Label>
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
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/10 transition-all outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Certification / Degree</Label>
                  <Input 
                    type="text" 
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Graduation Year</Label>
                  <Input 
                    type="number" 
                    value={formData.gradYear}
                    onChange={(e) => setFormData({...formData, gradYear: e.target.value})}
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#7C3AED] focus:bg-white outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="w-full py-4 bg-[#7C3AED] text-white font-black rounded-2xl shadow-2xl shadow-[#7C3AED]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Profile</span>
                      <Sparkles size={20} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Performance Analytics Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center">
                <BarChart3 className="mr-3 text-[#7C3AED]" />
                Performance Analytics
              </h3>
              <select className="text-xs border-none bg-gray-50 rounded-lg py-2 px-3 text-gray-600 focus:ring-2 focus:ring-[#7C3AED]/20 cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl md:text-3xl font-bold text-violet-600 dark:text-violet-300">{examStats?.totalExams || 0}</span>
                <span className="text-xs font-medium text-violet-600/70 dark:text-violet-300/70 mt-1">
                  {isTeacher ? "Exams Created" : "Exams Taken"}
                </span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-300">{examStats?.passedExams || 0}</span>
                <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-300/70 mt-1">Passed</span>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-300">{examStats?.failedExams || 0}</span>
                <span className="text-xs font-medium text-rose-600/70 dark:text-rose-300/70 mt-1">Failed</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-300">{examStats?.averageScore || 0}%</span>
                <span className="text-xs font-medium text-amber-600/70 dark:text-amber-300/70 mt-1">Average Score</span>
              </div>
            </div>
            
            {/* Performance Heatmap */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Performance Heatmap</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <ContributionHeatmap data={contributionData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Return the unified layout for both mobile and desktop
  return renderProfileContent();
};

export default Profile;