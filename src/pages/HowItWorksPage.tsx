import ResponsiveNavbar from "@/components/ResponsiveNavbar";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen">
      <ResponsiveNavbar />
      <div className="pt-16"> {/* Add padding to prevent overlap with navbar */}
        <HowItWorks />
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;