
import React from "react";
import Hero from "@/components/home/Hero";
import PageLayout from "@/components/layout/PageLayout";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Helmet } from "react-helmet";

const Index = () => {
  console.log("Index component rendering");
  
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
        <div className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Risk Management</h3>
                <p className="text-gray-600">Comprehensive risk assessment and monitoring tools.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Compliance</h3>
                <p className="text-gray-600">OSFI E-21 compliant operational resilience framework.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Integration</h3>
                <p className="text-gray-600">Seamless connectivity with financial institution systems.</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </PageLayout>
  );
};

export default Index;
