import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { signIn } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { 
  GraduationCap, 
  Users, 
  ArrowLeft, 
  Mail, 
  Lock, 
  EyeOff, 
  Eye, 
  UserCircle, 
  ArrowRight, 
  Shield,
  Check
} from "lucide-react";
import { OTPVerification } from "@/components/auth/OTPVerification";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [showOTP, setShowOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, needsOnboarding, isTeacher } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (needsOnboarding) {
        navigate('/teacher-onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, needsOnboarding, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user && !data.session) {
        // OTP verification required
        setPendingEmail(email);
        setShowOTP(true);
        toast({
          title: "Check your email",
          description: "We've sent you a verification code.",
        });
      } else {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
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

  const handleOTPSuccess = () => {
    setShowOTP(false);
    toast({
      title: "Email Verified!",
      description: "Please sign in with your credentials.",
    });
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }
    
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }).then(({ error }) => {
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password reset email sent!",
        });
      }
    });
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
              Join thousands of students and teachers who use Do Stuff to measure progress and achieve excellence.
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
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6 text-gray-400 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Welcome to Do Stuff</h1>
            <p className="text-gray-500 font-medium mb-10">Create or join exams easily</p>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#F1F5F9] p-1.5 rounded-[1.5rem] mb-10">
                <TabsTrigger 
                  value="signin" 
                  className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-[#7C3AED] data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400"
                >
                  <UserCircle size={18} />
                  <span>Sign In</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-[#7C3AED] data-[state=active]:shadow-sm data-[state=inactive]:text-gray-400"
                >
                  <GraduationCap size={18} />
                  <span>Sign Up</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <Input
                        type="email"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-14 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900"
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold px-4">
                    <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded-md border-gray-200 text-[#7C3AED] focus:ring-[#7C3AED]" 
                      />
                      <span>Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={handleForgotPassword}
                      className="text-[#7C3AED] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 group"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? "Signing in..." : "Enter Academic Dashboard"}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                    <div className="relative">
                      <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <Input
                        type="email"
                        placeholder="name@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-14 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900"
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border-2 border-transparent focus:border-[#7C3AED]/20 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">I am a:</label>
                    <div className="space-y-3">
                      <button 
                        type="button"
                        onClick={() => setRole('teacher')}
                        className={`w-full flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all ${
                          role === 'teacher' 
                            ? 'border-[#7C3AED] bg-[#7C3AED]/5' 
                            : 'border-transparent bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          role === 'teacher' ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-gray-300'
                        }`}>
                          {role === 'teacher' && <Check size={12} className="text-white" />}
                        </div>
                        <GraduationCap className="w-5 h-5 text-[#7C3AED]" />
                        <div className="text-left">
                          <div className="font-black text-sm">Teacher</div>
                          <div className="text-xs text-gray-500">Create and manage exams</div>
                        </div>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => setRole('student')}
                        className={`w-full flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all ${
                          role === 'student' 
                            ? 'border-[#7C3AED] bg-[#7C3AED]/5' 
                            : 'border-transparent bg-[#F8FAFC] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          role === 'student' ? 'border-[#7C3AED] bg-[#7C3AED]' : 'border-gray-300'
                        }`}>
                          {role === 'student' && <Check size={12} className="text-white" />}
                        </div>
                        <Users className="w-5 h-5 text-[#7C3AED]" />
                        <div className="text-left">
                          <div className="font-black text-sm">Student</div>
                          <div className="text-xs text-gray-500">Take exams and track progress</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-4 bg-[#7C3AED] text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 group"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? "Creating account..." : "Create Account"}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-12 text-center">
              <p className="text-sm font-bold text-gray-500">
                Don't have an account? <button onClick={() => navigate('/teacher-onboarding')} className="text-[#7C3AED] font-black">Register Now</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <OTPVerification
        email={pendingEmail}
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onSuccess={handleOTPSuccess}
      />
    </div>
  );
};

export default Auth;