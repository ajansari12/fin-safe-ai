
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import RegulatoryCompliance from "@/components/home/RegulatoryCompliance";
import AIAssistant from "@/components/home/AIAssistant";
import CTASection from "@/components/home/CTASection";
import PageLayout from "@/components/layout/PageLayout";

const Index = () => {
  return (
    <PageLayout>
      <Hero />
      <Features />
      <RegulatoryCompliance />
      <AIAssistant />
      <CTASection />
    </PageLayout>
  );
};

export default Index;
