import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Calendar,
  Briefcase,
  User,
  LogOut
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExamStats {
  totalExams: number;
  passedExams: number;
  failedExams: number;
  averageScore: number;
}

const Profile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, isTeacher } = useAuth();

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
        .update({ full_name: fullName })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero text-primary-foreground py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 -mt-4">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Avatar & Basic Info */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="relative inline-block mb-4">
                <SecureAvatar
                  src={avatarUrl}
                  alt="Profile Avatar"
                  fallback={getInitials(fullName || user?.email || 'U')}
                  size="xl"
                  className="border-2 border-background shadow-lg"
                />
                <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary-foreground" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <h2 className="text-xl font-semibold mb-1">{fullName || 'User'}</h2>
              <p className="text-sm text-muted-foreground mb-3">{user?.email}</p>
              <Badge variant={isTeacher ? "default" : "secondary"}>
                {isTeacher ? (
                  <><GraduationCap className="w-3 h-3 mr-1" /> Teacher</>
                ) : (
                  <><Users className="w-3 h-3 mr-1" /> Student</>
                )}
              </Badge>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {isTeacher && profileData && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{profileData.teacher_type || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{profileData.subject || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-medium">{profileData.experience_years || 0} years</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium">{profileData.certificate_type || 'Not set'}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Exam Stats */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {isTeacher ? "Teaching Statistics" : "Exam Performance"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {examStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">{examStats.totalExams}</p>
                    <p className="text-sm text-muted-foreground">
                      {isTeacher ? "Exams Created" : "Exams Taken"}
                    </p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-success">{examStats.passedExams}</p>
                    <p className="text-sm text-muted-foreground">
                      {isTeacher ? "Students Passed" : "Passed"}
                    </p>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-destructive">{examStats.failedExams}</p>
                    <p className="text-sm text-muted-foreground">
                      {isTeacher ? "Students Failed" : "Failed"}
                    </p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-accent-foreground">{examStats.averageScore}%</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No exam data available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.open('https://t.me/+P-Vu76yybMA5MjBk', '_blank')}
          >
            <Users className="w-4 h-4 mr-2" />
            Join Community
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;