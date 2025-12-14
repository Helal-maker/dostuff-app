import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="min-h-screen bg-background">
        <MobileNavbar 
          title="Join Exam" 
          showBack={true}
          onBack={() => navigate('/dashboard')}
        />
        
        <div className="p-4 space-y-6 pt-6">
          {/* Welcome Header */}
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Join an Exam</h1>
            <p className="text-muted-foreground">
              Enter the exam link provided by your teacher
            </p>
          </div>

          {/* Join Form */}
          <Card className="p-6 bg-gradient-card border-0 shadow-medium">
            <div className="space-y-4">
              <div>
                <Label htmlFor="examLink" className="text-base font-medium">
                  Exam Link
                </Label>
                <Input
                  id="examLink"
                  type="text"
                  value={examLink}
                  onChange={(e) => setExamLink(e.target.value)}
                  placeholder="Paste exam link here..."
                  className="mt-2 text-base h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Paste the full URL or just the exam ID
                </p>
              </div>

              <Button
                onClick={joinExam}
                disabled={isJoining}
                variant="hero"
                size="lg"
                className="w-full h-12 text-base"
              >
                {isJoining ? "Joining..." : "Join Exam"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button for Desktop */}
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Join an Exam</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter the exam link provided by your teacher to start taking the test
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gradient-card border-0 shadow-medium">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Enter Exam Link</h2>
              <p className="text-muted-foreground">
                Paste the exam link shared by your teacher
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="examLink" className="text-base font-medium">
                  Exam Link
                </Label>
                <Input
                  id="examLink"
                  type="text"
                  value={examLink}
                  onChange={(e) => setExamLink(e.target.value)}
                  placeholder="Paste exam link here... (e.g., https://yourdomain.com/exam/abc123 or abc123)"
                  className="mt-2 text-base h-12"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  You can paste the full URL or just the exam ID
                </p>
              </div>

              <Button
                onClick={joinExam}
                disabled={isJoining}
                variant="hero"
                size="lg"
                className="w-full h-12 text-base"
              >
                {isJoining ? "Joining..." : "Join Exam"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JoinExam;