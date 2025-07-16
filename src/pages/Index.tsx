
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import RegulatoryCompliance from '@/components/home/RegulatoryCompliance';
import AIAssistant from '@/components/home/AIAssistant';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import CTASection from '@/components/home/CTASection';
import { PublicPageErrorBoundary } from '@/components/error/PublicPageErrorBoundary';
import { usePerformanceCleanup } from '@/hooks/usePerformanceCleanup';
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading';
import { useAssetPreloading } from '@/hooks/useAssetPreloading';
import { 
  HeroSkeleton, 
  FeaturesSkeleton, 
  TestimonialsSkeleton, 
  PricingSkeleton, 
  CTASkeleton 
} from '@/components/loading/section-skeletons';

// Progressive loading wrapper component
const ProgressiveSection: React.FC<{ 
  children: React.ReactNode; 
  skeleton: React.ReactNode; 
  delay?: number;
}> = ({ children, skeleton, delay = 0 }) => {
  const { elementRef, isLoaded } = useProgressiveLoading({ 
    delay, 
    enableNetworkAdaptation: true 
  });
  
  return (
    <div ref={elementRef}>
      {isLoaded ? children : skeleton}
    </div>
  );
};

const Home = () => {
  // Initialize performance monitoring with proper cleanup
  usePerformanceCleanup();
  
  // Initialize asset preloading
  useAssetPreloading({
    enablePreloading: true,
    preloadImages: true,
    preloadFonts: true,
    preloadCriticalRoutes: true,
    respectDataSaver: true
  });
  
  return (
    <PublicPageErrorBoundary>
      <PageLayout>
        <div className="min-h-screen">
          {/* Hero loads immediately - no progressive loading */}
          <Hero />
          
          {/* Features loads with minimal delay */}
          <ProgressiveSection skeleton={<FeaturesSkeleton />} delay={100}>
            <Features />
          </ProgressiveSection>
          
          {/* Regulatory Compliance loads immediately after Features */}
          <ProgressiveSection skeleton={<div className="py-16 bg-muted/20"><div className="container mx-auto px-4"><div className="w-full h-64 bg-muted rounded animate-pulse" /></div></div>} delay={200}>
            <RegulatoryCompliance />
          </ProgressiveSection>
          
          {/* AI Assistant loads with slight delay */}
          <ProgressiveSection skeleton={<div className="py-16 bg-background"><div className="container mx-auto px-4"><div className="w-full h-64 bg-muted rounded animate-pulse" /></div></div>} delay={300}>
            <AIAssistant />
          </ProgressiveSection>
          
          {/* Testimonials loads progressively */}
          <ProgressiveSection skeleton={<TestimonialsSkeleton />} delay={400}>
            <Testimonials />
          </ProgressiveSection>
          
          {/* Pricing loads progressively */}
          <ProgressiveSection skeleton={<PricingSkeleton />} delay={500}>
            <Pricing />
          </ProgressiveSection>
          
          {/* CTA loads last */}
          <ProgressiveSection skeleton={<CTASkeleton />} delay={600}>
            <CTASection />
          </ProgressiveSection>
        </div>
      </PageLayout>
    </PublicPageErrorBoundary>
  );
};

export default Home;
