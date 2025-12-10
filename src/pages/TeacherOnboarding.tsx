import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { GraduationCap, Loader2, School, Users } from "lucide-react";

const TeacherOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear());
  const [teacherType, setTeacherType] = useState<'school' | 'private' | 'both'>('school');
  const [subject, setSubject] = useState("");
  const [certificateType, setCertificateType] = useState("");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated, isTeacher } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loading && isAuthenticated && !isTeacher) {
      navigate('/dashboard');
    }
  }, [loading, isAuthenticated, isTeacher, navigate]);

  useEffect(() => {
    if (user?.profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          experience_years: experienceYears,
          graduation_year: graduationYear,
          teacher_type: teacherType,
          subject: subject,
          certificate_type: certificateType,
          onboarding_completed: true
        })
        .eq('user_id', user?.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Your profile has been set up successfully.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 bg-card/95 backdrop-blur-sm border-0 shadow-strong">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Card className="p-8 bg-card/95 backdrop-blur-sm border-0 shadow-strong">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">Tell us a bit about yourself</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject You Teach</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, English"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduation">Graduation Year</Label>
                <Input
                  id="graduation"
                  type="number"
                  min="1970"
                  max={new Date().getFullYear()}
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(parseInt(e.target.value) || new Date().getFullYear())}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate">Certificate/Degree Type</Label>
              <Input
                id="certificate"
                type="text"
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                placeholder="e.g., B.Ed, M.A., Ph.D."
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Teaching Type</Label>
              <RadioGroup 
                value={teacherType} 
                onValueChange={(value: 'school' | 'private' | 'both') => setTeacherType(value)}
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="school" id="school" />
                  <School className="w-4 h-4 text-primary" />
                  <Label htmlFor="school" className="flex-1 cursor-pointer">
                    School Teacher
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="private" id="private" />
                  <Users className="w-4 h-4 text-success" />
                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                    Private Tutor
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="both" id="both" />
                  <GraduationCap className="w-4 h-4 text-accent" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    Both School & Private
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="gradient"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TeacherOnboarding;