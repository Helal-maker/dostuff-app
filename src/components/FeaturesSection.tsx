import { Card } from "@/components/ui/card";
import { MessageSquare, Languages, Clock, BarChart3, Palette, Link, CheckCircle, PenTool, Vote } from "lucide-react";
const FeaturesSection = () => {
  const questionTypes = [{
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Multiple Choice",
    description: "Classic choose-the-correct-answer format"
  }, {
    icon: <PenTool className="w-6 h-6" />,
    title: "Fill in the Blank",
    description: "Type the missing word or phrase"
  }, {
    icon: <Languages className="w-6 h-6" />,
    title: "Translation",
    description: "Arabic ↔ English translation exercises"
  }, {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "True or False",
    description: "Simple right or wrong statements"
  }, {
    icon: <Vote className="w-6 h-6" />,
    title: "Matching",
    description: "Connect items from two tables"
  }, {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Reading Comprehension",
    description: "Paragraph-based questions"
  }];
  const teacherFeatures = [{
    icon: <Clock className="w-6 h-6" />,
    title: "Timer Control",
    description: "Set exam duration and auto-submit"
  }, {
    icon: <Palette className="w-6 h-6" />,
    title: "Custom Styling",
    description: "Personalize colors and themes"
  }, {
    icon: <Link className="w-6 h-6" />,
    title: "Easy Sharing",
    description: "Generate shareable exam links"
  }, {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics Dashboard",
    description: "Track student performance"
  }];
  return <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Question Types */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Premium-Style</span>{" "}
            Question Types
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create engaging assessments with diverse question formats that keep students motivated and challenged.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {questionTypes.map((type, index) => <Card key={index} className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                {type.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                {type.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {type.description}
              </p>
            </Card>)}
        </div>

        {/* Teacher Features */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Powerful{" "}
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              Teacher Tools
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, customize, and track your exams with professional-grade features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teacherFeatures.map((feature, index) => <Card key={index} className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-accent">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default FeaturesSection;