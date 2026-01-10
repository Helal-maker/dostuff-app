import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  UserPlus,
  LogOut,
  Sparkles,
  GraduationCap,
  Users
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
interface ExamStats {
  totalExams: number;
  passedExams: number;
  failedExams: number;
}



const Profile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
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
        setExamStats({
          totalExams: examIds.length,
          passedExams: passedCount,
          failedExams: completedAttempts.length - passedCount
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

      setExamStats({
        totalExams: completedAttempts.length,
        passedExams: passedCount,
        failedExams: completedAttempts.length - passedCount
      });
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

          {/* Teacher Information Card */}
          {isTeacher && profileData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Teaching Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.subject && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Subject</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span className="text-gray-900 font-medium">{profileData.subject}</span>
                    </div>
                  </div>
                )}

                {profileData.experience_years !== null && profileData.experience_years !== undefined && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Years of Experience</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Users className="w-4 h-4 text-success" />
                      <span className="text-gray-900 font-medium">{profileData.experience_years} years</span>
                    </div>
                  </div>
                )}

                {profileData.graduation_year && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Graduation Year</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <School className="w-4 h-4 text-warning" />
                      <span className="text-gray-900 font-medium">{profileData.graduation_year}</span>
                    </div>
                  </div>
                )}

                {profileData.certificate_type && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Certificate/Degree</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-accent" />
                      <span className="text-gray-900 font-medium">{profileData.certificate_type}</span>
                    </div>
                  </div>
                )}

                {profileData.teacher_type && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Teaching Type</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      {profileData.teacher_type === 'school' && <School className="w-4 h-4 text-primary" />}
                      {profileData.teacher_type === 'private' && <Users className="w-4 h-4 text-success" />}
                      {profileData.teacher_type === 'both' && <GraduationCap className="w-4 h-4 text-accent" />}
                      <span className="text-gray-900 font-medium capitalize">
                        {profileData.teacher_type === 'school' ? 'School Teacher' :
                         profileData.teacher_type === 'private' ? 'Private Tutor' :
                         'Both School & Private'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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