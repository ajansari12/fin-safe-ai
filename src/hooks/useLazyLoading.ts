import { useState, useCallback, useEffect } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';
import { useNetworkStatus } from './useNetworkStatus';

interface UseLazyLoadingOptions {
  priority?: 'high' | 'medium' | 'low';
  preloadNext?: boolean;
  enableNetworkAdaptation?: boolean;
}

export const useLazyLoading = (options: UseLazyLoadingOptions = {}) => {
  const {
    priority = 'medium',
    preloadNext = true,
    enableNetworkAdaptation = true
  } = options;

  const { connectionType, saveData } = useNetworkStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Adjust loading behavior based on network conditions
  const getLoadingDelay = () => {
    if (!enableNetworkAdaptation) return 0;
    
    if (saveData) return 200; // Delay on data saver mode
    
    switch (connectionType) {
      case 'slow':
        return priority === 'high' ? 0 : 300;
      case 'fast':
        return 0;
      default:
        return priority === 'high' ? 0 : 100;
    }
  };

  // Intersection observer with network-aware settings
  const { elementRef, shouldRender } = useIntersectionObserver({
    threshold: connectionType === 'slow' ? 0.3 : 0.1,
    rootMargin: saveData ? '20px' : '100px',
    triggerOnce: true,
    enabled: true
  });

  // Load content with delay based on network conditions
  const loadContent = useCallback(async () => {
    if (hasLoaded) return;
    
    setIsLoading(true);
    const delay = getLoadingDelay();
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setHasLoaded(true);
    setIsLoading(false);
  }, [hasLoaded, getLoadingDelay]);

  // Trigger loading when element comes into view
  useEffect(() => {
    if (shouldRender && !hasLoaded && !isLoading) {
      loadContent();
    }
  }, [shouldRender, hasLoaded, isLoading, loadContent]);

  // Preload next sections for better UX
  const preloadNextSection = useCallback(() => {
    if (!preloadNext || connectionType === 'slow' || saveData) return;
    
    // Simulate preloading next section
    const nextSectionElements = document.querySelectorAll('[data-lazy-next="true"]');
    nextSectionElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.transform = 'translateZ(0)'; // Trigger GPU layer
      }
    });
  }, [preloadNext, connectionType, saveData]);

  return {
    elementRef,
    shouldRender: shouldRender && hasLoaded,
    isLoading: shouldRender && isLoading,
    hasLoaded,
    preloadNextSection
  };
};