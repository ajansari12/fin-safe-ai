
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
import { useLazyLoading } from '@/hooks/useLazyLoading';
import { useAssetPreloading } from '@/hooks/useAssetPreloading';
import { usePredictiveLoading } from '@/hooks/usePredictiveLoading';
import { useNetworkAdaptiveLoading } from '@/hooks/useNetworkAdaptiveLoading';
import { useLoadingMicroInteractions } from '@/hooks/useLoadingMicroInteractions';
import { 
  HeroSkeleton, 
  FeaturesSkeleton, 
  TestimonialsSkeleton, 
  PricingSkeleton, 
  CTASkeleton 
} from '@/components/loading/section-skeletons';

// Progressive loading wrapper for above-the-fold content
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

// Lazy loading wrapper for below-the-fold content
const LazySection: React.FC<{
  children: React.ReactNode;
  skeleton: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  preloadNext?: boolean;
}> = ({ children, skeleton, priority = 'medium', preloadNext = true }) => {
  const { elementRef, shouldRender, isLoading, preloadNextSection } = useLazyLoading({
    priority,
    preloadNext,
    enableNetworkAdaptation: true
  });

  // Trigger preload when this section starts loading
  React.useEffect(() => {
    if (shouldRender && preloadNext) {
      preloadNextSection();
    }
  }, [shouldRender, preloadNext, preloadNextSection]);

  return (
    <div ref={elementRef} data-lazy-next={preloadNext}>
      {shouldRender ? children : isLoading ? skeleton : skeleton}
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

  // Phase 3: Advanced loading experience
  usePredictiveLoading({
    enablePredictiveLoading: true,
    enableServiceWorker: true,
    cacheStrategy: 'adaptive'
  });

  const { getLoadingStrategy, getAnimationSettings } = useNetworkAdaptiveLoading({
    enableAdaptiveQuality: true,
    adaptiveImageLoading: true,
    enableOfflineMode: true
  });

  const { createShimmerEffect, triggerSuccessInteraction } = useLoadingMicroInteractions({
    enableMicroInteractions: true,
    enableContentPreviews: true,
    enableProgressIndicators: true
  });
  
  return (
    <PublicPageErrorBoundary>
      <PageLayout>
        <div className="min-h-screen">
          {/* Hero loads immediately - critical above-the-fold */}
          <Hero />
          
          {/* Features loads with minimal delay - still above-the-fold */}
          <ProgressiveSection skeleton={<FeaturesSkeleton />} delay={50}>
            <Features />
          </ProgressiveSection>
          
          {/* Regulatory Compliance - above-the-fold on most screens */}
          <ProgressiveSection skeleton={<div className="py-16 bg-muted/20"><div className="container mx-auto px-4"><div className="w-full h-64 bg-muted rounded animate-pulse" /></div></div>} delay={100}>
            <RegulatoryCompliance />
          </ProgressiveSection>
          
          {/* AI Assistant - typically below-the-fold, lazy load */}
          <LazySection 
            skeleton={<div className="py-16 bg-background"><div className="container mx-auto px-4"><div className="w-full h-64 bg-muted rounded animate-pulse" /></div></div>}
            priority="high"
            preloadNext={true}
          >
            <AIAssistant />
          </LazySection>
          
          {/* Testimonials - lazy load with medium priority */}
          <LazySection 
            skeleton={<TestimonialsSkeleton />}
            priority="medium"
            preloadNext={true}
          >
            <Testimonials />
          </LazySection>
          
          {/* Pricing - lazy load with high priority (conversion critical) */}
          <LazySection 
            skeleton={<PricingSkeleton />}
            priority="high"
            preloadNext={true}
          >
            <Pricing />
          </LazySection>
          
          {/* CTA - lazy load, lowest priority but still important */}
          <LazySection 
            skeleton={<CTASkeleton />}
            priority="medium"
            preloadNext={false}
          >
            <CTASection />
          </LazySection>
        </div>
      </PageLayout>
    </PublicPageErrorBoundary>
  );
};

export default Home;
