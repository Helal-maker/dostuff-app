import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Settings, 
  Link, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Play,
  FileText,
  Timer,
  Eye,
  Award,
  HelpCircle,
  Target,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const teacherSteps = [
    {
      step: 1,
      icon: <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Sign Up & Verify",
      description: "Create your teacher account with OTP verification for security. Set up your profile and institution details.",
      details: [
        "Enter your email",
        "Receive OTP verification code",
        "Complete your profile setup",
        "Choose your institution"
      ],
      time: "2 minutes"
    },
    {
      step: 2,
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Create Your Exam",
      description: "Build engaging exams with multiple question types. Customize appearance, set timers, and configure settings.",
      details: [
        "Choose from 10+ question types",
        "Add questions",
        "Set time limits and attempts",
        "Customize exam appearance"
      ],
      time: "10-15 minutes"
    },
    {
      step: 3,
      icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Configure Settings",
      description: "Fine-tune your exam with advanced settings like randomization, scoring rules, and accessibility options.",
      details: [
        "Enable question timer",
        "Set passing scores",
        "Configure auto-submission",
        "Add exam instructions"
      ],
      time: "5 minutes"
    },
    {
      step: 4,
      icon: <Link className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Share & Monitor",
      description: "Generate shareable links and monitor student progress in real-time with detailed analytics dashboard.",
      details: [
        "Copy shareable exam link",
        "Send to students",
        "Monitor live exam progress",
        "Track completion rates"
      ],
      time: "1 minute"
    },
    {
      step: 5,
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Review Results",
      description: "Analyze student performance with comprehensive analytics, export reports, and provide detailed feedback.",
      details: [
        "View detailed score breakdowns",
        "Identify common mistakes",
        "Generate performance reports"
      ],
      time: "5-10 minutes"
    }
  ];

  const studentSteps = [
    {
      step: 1,
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Join Exam",
      description: "Click the exam link shared by your teacher or enter the exam code to join instantly.",
      details: [
        "Click exam link or enter code",
        "Enter your name and details",
        "No complex registration required",
        "Get started immediately"
      ],
      time: "30 seconds"
    },
    {
      step: 2,
      icon: <Play className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Start Assessment",
      description: "Begin your exam with clear instructions and timer. Navigate through questions at your own pace.",
      details: [
        "Review exam instructions",
        "Start when ready",
        "Navigate freely between questions",
        "Auto-save your progress"
      ],
      time: "Variable"
    },
    {
      step: 3,
      icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Answer Questions",
      description: "Tackle various question types including multiple choice, fill-in-the-blank, translations, and more.",
      details: [
        "Multiple choice questions",
        "Fill in the blank responses",
        "Translation exercises",
        "True/false statements"
      ],
      time: "Exam duration"
    },
    {
      step: 4,
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Time Management",
      description: "Keep track of remaining time with visual countdown. Submit automatically or manually when finished.",
      details: [
        "See countdown timer",
        "Get time warnings",
        "Auto-submit at deadline",
        "Submit early if ready"
      ],
      time: "Continuous"
    },
    {
      step: 5,
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Get Results",
      description: "Receive instant feedback with detailed results, explanations, and performance insights.",
      details: [
        "Instant score display",
        "Detailed answer review",
        "Performance analytics",
        "Track improvement over time"
      ],
      time: "Immediate"
    }
  ];

  const questionTypes = [
    { type: "Multiple Choice", description: "Select the correct answer from options", icon: "🔘" },
    { type: "Fill in the Blank", description: "Type the missing word or phrase", icon: "✏️" },
    { type: "Translation", description: "Translate between Arabic and English", icon: "🌐" },
    { type: "True or False", description: "Choose right or wrong statements", icon: "✅" },
    { type: "Matching", description: "Connect related items", icon: "🔗" },
    { type: "Reading Comprehension", description: "Answer questions about passages", icon: "📖" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium">
            <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Complete Platform Guide
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            How{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Do Stuff
            </span>{" "}
            Works
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4">
            A complete guide for teachers and students. Learn how to create, take, and analyze exams with our easy-to-use platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              onClick={() => navigate('/auth')}
            >
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start as Teacher
            </Button>
            <Button 
              variant="gradient" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
              onClick={() => navigate('/auth')}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Join as Student
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-12 sm:py-16 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <Card className="p-6 sm:p-8 bg-gradient-card border-0 shadow-strong">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">For Teachers</h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  Create professional exams, track student progress, and gain insights with powerful analytics tools.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>10+ Question Types</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>Custom Branding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>Easy Sharing</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-gradient-card border-0 shadow-strong">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">For Students</h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  Take engaging exams with instant feedback and track your learning progress over time.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>Instant Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>Interactive Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>Progress Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    <span>No Registration</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Teacher Workflow */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-primary font-medium text-sm sm:text-base">Teacher Guide</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Teacher{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Workflow
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              From creating your account to analyzing results - here's everything you need to know about using Do Stuff as a teacher.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            {teacherSteps.map((step, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl shadow-strong">
                    {step.step}
                  </div>
                </div>
                <Card className="flex-1 p-4 sm:p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                      {step.icon}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold">{step.title}</h3>
                        <Badge variant="secondary" className="text-xs w-fit">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">{step.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Workflow */}
      <section className="py-12 sm:py-20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              <span className="text-foreground font-medium text-sm sm:text-base">Student Guide</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Student{" "}
              <span className="bg-gradient-secondary bg-clip-text text-transparent">
                Experience
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Taking exams has never been easier. Learn how to join, take, and get results from your exams.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
            {studentSteps.map((step, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-secondary rounded-full flex items-center justify-center text-foreground font-bold text-lg sm:text-xl shadow-strong">
                    {step.step}
                  </div>
                </div>
                <Card className="flex-1 p-4 sm:p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/20 rounded-lg flex items-center justify-center text-foreground flex-shrink-0">
                      {step.icon}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold">{step.title}</h3>
                        <Badge variant="secondary" className="text-xs w-fit">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.time}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">{step.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Question Types Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Question{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Types
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Support for diverse question formats to create engaging and comprehensive assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {questionTypes.map((question, index) => (
              <Card key={index} className="p-4 sm:p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">{question.icon}</div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{question.type}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{question.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Comparison */}
      <section className="py-12 sm:py-20 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Platform{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Powerful features designed for both teachers and students to create the best exam experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <Card className="p-6 sm:p-8 bg-gradient-card border-0 shadow-strong">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Teacher Features</h3>
              <div className="space-y-3 sm:space-y-4">
                {[
                  "Create exams with 10+ question types",
                  "Customize exam appearance and branding",
                  "Set time limits and attempt restrictions",
                  "Real-time monitoring during exams",
                  "Detailed analytics and reporting",
                  "One-click exam sharing",
                  "Custom scoring rules"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 sm:p-8 bg-gradient-card border-0 shadow-strong">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">Student Benefits</h3>
              <div className="space-y-3 sm:space-y-4">
                {[
                  "Join exams easily",
                  "Clean, distraction-free interface",
                  "Progress saving automatically",
                  "Multiple device compatibility",
                  "Accessible on mobile and desktop",
                  "Detailed performance tracking",
                  "Exam history and statistics",
                  "Learn from explanations"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-12 bg-gradient-card border-0 shadow-strong text-center max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
              Join thousands of teachers and students who are already using Do Stuff to create better learning experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                onClick={() => navigate('/auth')}
              >
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Creating Exams
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
              <Button 
                variant="gradient" 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                onClick={() => navigate('/auth')}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Join Your First Exam
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;