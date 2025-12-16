import ResponsiveNavbar from "@/components/ResponsiveNavbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import GetStartedSection from "@/components/GetStartedSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ResponsiveNavbar />
      <HeroSection />
      <FeaturesSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
};

export default Index;
