import React from 'react';

export const HeroSkeleton: React.FC = () => (
  <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
    <div className="container mx-auto px-4 pt-16 pb-24" style={{ minHeight: '600px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          {/* Badge skeleton */}
          <div className="w-32 h-8 bg-muted rounded-full animate-pulse" />
          
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="w-full h-12 bg-muted rounded animate-pulse" />
            <div className="w-4/5 h-12 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-muted rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex gap-4">
            <div className="w-24 h-10 bg-muted rounded animate-pulse" />
            <div className="w-24 h-10 bg-muted rounded animate-pulse" />
          </div>
          
          {/* Features grid skeleton */}
          <div className="grid grid-cols-2 gap-6 mt-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-muted rounded-full animate-pulse mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-full h-3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Integration overview skeleton */}
        <div className="relative">
          <div className="w-full h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export const FeaturesSkeleton: React.FC = () => (
  <div className="py-16 bg-background">
    <div className="container mx-auto px-4">
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <div className="w-64 h-8 bg-muted rounded mx-auto mb-4 animate-pulse" />
        <div className="w-96 h-4 bg-muted rounded mx-auto animate-pulse" />
      </div>
      
      {/* Features grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-lg border">
            <div className="w-10 h-10 bg-muted rounded mb-4 animate-pulse" />
            <div className="w-3/4 h-6 bg-muted rounded mb-2 animate-pulse" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-muted rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TestimonialsSkeleton: React.FC = () => (
  <div className="py-16 bg-muted/50">
    <div className="container mx-auto px-4">
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <div className="w-48 h-8 bg-muted rounded mx-auto mb-4 animate-pulse" />
        <div className="w-80 h-4 bg-muted rounded mx-auto animate-pulse" />
      </div>
      
      {/* Testimonials grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-lg border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse mr-3" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-muted rounded mb-1 animate-pulse" />
                <div className="w-32 h-3 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-muted rounded animate-pulse" />
              <div className="w-5/6 h-4 bg-muted rounded animate-pulse" />
              <div className="w-4/5 h-4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PricingSkeleton: React.FC = () => (
  <div className="py-16 bg-background">
    <div className="container mx-auto px-4">
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <div className="w-32 h-8 bg-muted rounded mx-auto mb-4 animate-pulse" />
        <div className="w-64 h-4 bg-muted rounded mx-auto animate-pulse" />
      </div>
      
      {/* Pricing cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-lg border">
            <div className="w-20 h-6 bg-muted rounded mb-2 animate-pulse" />
            <div className="w-16 h-8 bg-muted rounded mb-4 animate-pulse" />
            <div className="space-y-2 mb-6">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-full h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
            <div className="w-full h-10 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CTASkeleton: React.FC = () => (
  <div className="py-16 bg-primary/5">
    <div className="container mx-auto px-4 text-center">
      <div className="w-64 h-8 bg-muted rounded mx-auto mb-4 animate-pulse" />
      <div className="w-96 h-4 bg-muted rounded mx-auto mb-8 animate-pulse" />
      <div className="w-32 h-10 bg-muted rounded mx-auto animate-pulse" />
    </div>
  </div>
);