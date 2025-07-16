import { useState, useEffect, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface ProgressiveLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  enableNetworkAdaptation?: boolean;
}

export const useProgressiveLoading = (
  options: ProgressiveLoadingOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    delay = 0,
    enableNetworkAdaptation = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const { connectionType } = useNetworkStatus();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Adjust delay based on network speed
    const adaptiveDelay = enableNetworkAdaptation && connectionType === 'slow' 
      ? delay * 2 
      : delay;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          
          // Add delay before marking as loaded
          setTimeout(() => {
            setIsLoaded(true);
          }, adaptiveDelay);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay, connectionType, enableNetworkAdaptation, isVisible]);

  return {
    elementRef,
    isVisible,
    isLoaded,
    shouldReduceAnimations: connectionType === 'slow'
  };
};