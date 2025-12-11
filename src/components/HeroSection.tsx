import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Trophy } from "lucide-react";
import heroImage from "@/assets/hero-education.jpg";
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary-glow rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-warning rounded-full blur-lg animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft mb-6">
              <BookOpen className="text-primary h-[25px] w-[25px]" />
              <span className="font-medium text-xl text-black"> Exam Platform</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Do</span>{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Stuff
              </span>
            </h1>

            <p className="text-xl lg:text-2xl mb-8 leading-relaxed max-w-2xl text-center font-bold text-primary-foreground">
              Create engaging, interactive exams with multiple question types.
              From multiple choice to translations - make learning fun and assessment effective.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/auth'}>
                Start as Teacher
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="gradient" size="lg" className="text-lg px-8 py-6" onClick={() => window.location.href = '/auth'}>
                Join as Student
                <Users className="w-5 h-5" />
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold">Multiple Formats</h3>
                  <p className="text-sm text-primary font-semibold">10+ question types</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold">Easy Sharing</h3>
                  <p className="text-sm text-success font-semibold">One-click exam links</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold">Real-time Results</h3>
                  <p className="text-sm text-warning font-bold">Instant feedback</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative bg-gradient-card rounded-3xl shadow-strong p-8 backdrop-blur-sm">
              <img src={heroImage} alt="Students and teachers collaborating on educational platform" className="w-full h-auto rounded-2xl shadow-medium" />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-primary rounded-full shadow-glow animate-bounce flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;