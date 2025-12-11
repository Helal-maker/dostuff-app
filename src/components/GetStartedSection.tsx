import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, ArrowRight, CheckCircle } from "lucide-react";
const GetStartedSection = () => {
  return <section className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Choose Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Path
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're creating exams or taking them, we've got you covered with specialized workflows.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Teacher Card */}
          <Card className="p-8 bg-gradient-card border-0 shadow-strong hover:shadow-glow transition-all duration-500 group">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-10 h-10 text-primary-foreground" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">
                For Teachers
              </h3>
              
              <p className="mb-6 leading-relaxed font-extrabold text-slate-950">
                Create engaging, customizable exams with powerful analytics to track student progress.
              </p>

              <div className="space-y-3 mb-8">
                {["Create diverse question types", "Customize exam appearance", "Set timers and attempt limits", "Track detailed analytics", "Share with one-click links"].map((feature, index) => <div key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>)}
              </div>

              <Button variant="hero" size="lg" className="w-full" onClick={() => window.location.href = '/auth'}>
                Start Creating Exams
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                One-time verification required for security
              </p>
            </div>
          </Card>

          {/* Student Card */}
          <Card className="p-8 bg-gradient-card border-0 shadow-strong hover:shadow-glow transition-all duration-500 group">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-foreground" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-card-foreground">
                For Students
              </h3>
              
              <p className="mb-6 leading-relaxed font-extrabold text-slate-950">
                Take engaging exams and track your progress with instant feedback and detailed results.
              </p>

              <div className="space-y-3 mb-8">
                {["Join exams with simple links", "Interactive question formats", "Instant result feedback", "Progress tracking dashboard", "Detailed exam history"].map((feature, index) => <div key={index} className="gap-3 text-sm items-center justify-start flex flex-row">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>)}
              </div>

              <Button variant="gradient" size="lg" className="w-full" onClick={() => window.location.href = '/auth'}>
                Start Taking Exams
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Simple signup, no verification needed
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>;
};
export default GetStartedSection;