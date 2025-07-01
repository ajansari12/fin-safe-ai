
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import RegulatoryCompliance from '@/components/home/RegulatoryCompliance';
import AIAssistant from '@/components/home/AIAssistant';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import CTASection from '@/components/home/CTASection';

const Home = () => {
  return (
    <PageLayout>
      <Hero />
      <Features />
      <RegulatoryCompliance />
      <AIAssistant />
      <Testimonials />
      <Pricing />
      <CTASection />
    </PageLayout>
  );
};

export default Home;
