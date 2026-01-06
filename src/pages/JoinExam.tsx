import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MobileNavbar } from "@/components/mobile/MobileNavigation";
import { Link2, ArrowLeft } from "lucide-react";

const JoinExam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [examLink, setExamLink] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const extractShareLink = (input: string) => {
    // Extract share link from full URL or return as-is if it's just the UUID
    const match = input.match(/\/exam\/([a-f0-9-]+)/);
    return match ? match[1] : input.trim();
  };

  const joinExam = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!examLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exam link",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    const shareLink = extractShareLink(examLink);
    
    // Navigate to the exam page
    navigate(`/exam/${shareLink}`);
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans">
        <MobileNavbar 
          title="Join Exam" 
          showBack={true}
          onBack={() => navigate('/dashboard')}
        />
        
        <div className="p-6 space-y-6 pt-6">
          {/* Welcome Header */}
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
              <Link2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join an Exam</h1>
            <p className="text-subtle-text dark:text-subtle-text-dark text-sm max-w-md mx-auto">
              Enter the unique link or ID provided by your instructor to begin your assessment.
            </p>
          </div>

          {/* Join Form Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-gray-800 p-6 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
            
            <div className="flex flex-col items-center mb-6 relative">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-3 text-primary">
                <Link2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Enter Exam Link</h2>
              <p className="text-xs text-subtle-text dark:text-subtle-text-dark mt-1">Paste your secure link below</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="exam-link">
                  Exam Link or ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-icons-round text-gray-400 text-xl">language</span>
                  </div>
                  <input
                    id="exam-link"
                    type="text"
                    value={examLink}
                    onChange={(e) => setExamLink(e.target.value)}
                    placeholder="https://yourdomain.com/exam/abc123"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-subtle-text dark:text-subtle-text-dark ml-1">
                  You can paste the full URL or just the 6-digit exam ID.
                </p>
              </div>

              <button
                onClick={joinExam}
                disabled={isJoining}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? "Joining..." : (
                  <>
                    <span>Join Exam</span>
                    <span className="material-icons-round text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans h-screen overflow-hidden flex transition-colors duration-200">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-green-400/20 via-primary/10 to-transparent dark:from-green-500/10 dark:via-primary/5 dark:to-transparent pointer-events-none rounded-bl-full z-0"></div>
        
        <header className="h-16 flex items-center justify-between px-8 z-10">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-sm font-medium text-subtle-text dark:text-subtle-text-dark hover:text-primary dark:hover:text-primary transition-colors"
          >
            <span className="material-icons-round mr-2 text-base">arrow_back</span>
            Back to Dashboard
          </button>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-6 z-10 overflow-y-auto">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Join an Exam</h1>
              <p className="text-subtle-text dark:text-subtle-text-dark text-lg max-w-md mx-auto">
                Enter the unique link or ID provided by your instructor to begin your assessment.
              </p>
            </div>
            
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-soft dark:shadow-none dark:border dark:border-gray-800 p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
              
              <div className="flex flex-col items-center mb-8 relative">
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4 text-primary">
                  <Link2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Exam Link</h2>
                <p className="text-sm text-subtle-text dark:text-subtle-text-dark mt-1">Paste your secure link below</p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1" htmlFor="exam-link">
                    Exam Link or ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-icons-round text-gray-400 text-xl">language</span>
                    </div>
                    <input
                      id="exam-link"
                      type="text"
                      value={examLink}
                      onChange={(e) => setExamLink(e.target.value)}
                      placeholder="https://yourdomain.com/exam/abc123"
                      className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    />
                  </div>
                  <p className="text-xs text-subtle-text dark:text-subtle-text-dark ml-1">
                    You can paste the full URL or just the 6-digit exam ID.
                  </p>
                </div>
                
                <button
                  onClick={joinExam}
                  disabled={isJoining}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? "Joining..." : (
                    <>
                      <span>Join Exam</span>
                      <span className="material-icons-round text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinExam;
