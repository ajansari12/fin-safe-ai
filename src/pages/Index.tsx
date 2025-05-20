
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import RegulatoryCompliance from "@/components/home/RegulatoryCompliance";
import AIAssistant from "@/components/home/AIAssistant";
import CTASection from "@/components/home/CTASection";
import PageLayout from "@/components/layout/PageLayout";
import Testimonials from "@/components/home/Testimonials";
import Pricing from "@/components/home/Pricing";
import Faq from "@/components/home/Faq";
import ContactSection from "@/components/home/ContactSection";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <PageLayout>
      <Helmet>
        <title>ResilientFI - Operational Risk Management for Financial Institutions</title>
        <meta name="description" content="AI-powered operational resilience platform for Canadian financial institutions. Achieve OSFI E-21 compliance and build robust risk management frameworks." />
        <meta property="og:title" content="ResilientFI - Operational Risk Management" />
        <meta property="og:description" content="AI-powered operational resilience platform for Canadian financial institutions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://resilientfi.com" />
        <meta property="og:image" content="https://resilientfi.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ResilientFI - Operational Risk Management" />
        <meta name="twitter:description" content="AI-powered operational resilience platform for Canadian financial institutions." />
        <meta name="twitter:image" content="https://resilientfi.com/og-image.png" />
      </Helmet>

      <Hero />
      
      <ScrollReveal>
        <Features />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={100}>
        <RegulatoryCompliance />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={100}>
        <AIAssistant />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={100}>
        <Testimonials />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={100}>
        <Pricing />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={100}>
        <Faq />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={100}>
        <ContactSection />
      </ScrollReveal>
      
      <ScrollReveal direction="none" delay={100}>
        <CTASection />
      </ScrollReveal>
    </PageLayout>
  );
};

export default Index;
