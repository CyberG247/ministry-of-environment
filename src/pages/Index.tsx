import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CommissionerSection from "@/components/CommissionerSection";
import ReportCategories from "@/components/ReportCategories";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import TrackReport from "@/components/TrackReport";
import StatsSection from "@/components/StatsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CommissionerSection />
        <StatsSection />
        <ReportCategories />
        <HowItWorks />
        <FeaturesSection />
        <TrackReport />
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
