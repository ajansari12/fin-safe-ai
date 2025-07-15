import { useState, useEffect, useCallback, useRef } from 'react';
import { measurePerformance, isMobileDevice, isTouchDevice } from '@/utils/mobile-optimization';

interface MobileOptimizationState {
  isMobile: boolean;
  isTouch: boolean;
  screenSize: 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
  isSlowConnection: boolean;
}

export const useMobileOptimization = () => {
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isTouch: false,
    screenSize: 'lg',
    orientation: 'landscape',
    isSlowConnection: false
  });

  const performanceRef = useRef<{ [key: string]: () => void }>({});

  // Update screen size based on window width
  const getScreenSize = useCallback((width: number): 'sm' | 'md' | 'lg' | 'xl' => {
    if (width < 640) return 'sm';
    if (width < 768) return 'md';
    if (width < 1024) return 'lg';
    return 'xl';
  }, []);

  // Update orientation
  const getOrientation = useCallback((width: number, height: number): 'portrait' | 'landscape' => {
    return width > height ? 'landscape' : 'portrait';
  }, []);

  // Check connection speed
  const checkConnectionSpeed = useCallback((): boolean => {
    // @ts-ignore - navigator.connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
    }
    
    return false; // Assume fast connection if unable to detect
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setState(prev => ({
      ...prev,
      screenSize: getScreenSize(width),
      orientation: getOrientation(width, height),
      isMobile: isMobileDevice(),
      isTouch: isTouchDevice()
    }));
  }, [getScreenSize, getOrientation]);

  // Performance measurement wrapper
  const measureComponentPerformance = useCallback((componentName: string) => {
    const endMeasurement = measurePerformance(`Mobile: ${componentName}`);
    performanceRef.current[componentName] = endMeasurement;
    
    return endMeasurement;
  }, []);

  // Debounced resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    // Initial check
    handleResize();
    
    // Check connection speed
    setState(prev => ({
      ...prev,
      isSlowConnection: checkConnectionSpeed()
    }));

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize, checkConnectionSpeed]);

  // Touch gesture handlers
  const addTouchGestures = useCallback((
    element: HTMLElement,
    handlers: {
      onSwipeLeft?: () => void;
      onSwipeRight?: () => void;
      onTap?: () => void;
      onLongPress?: () => void;
    }
  ) => {
    if (!state.isTouch) return () => {};

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let longPressTimeout: NodeJS.Timeout;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();

      if (handlers.onLongPress) {
        longPressTimeout = setTimeout(() => {
          handlers.onLongPress!();
        }, 500);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      clearTimeout(longPressTimeout);
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const deltaTime = Date.now() - startTime;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const isSwipe = distance > 50 && deltaTime < 300;
      const isTap = distance < 10 && deltaTime < 200;

      if (isTap && handlers.onTap) {
        handlers.onTap();
      } else if (isSwipe) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          } else if (deltaX < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(longPressTimeout);
    };
  }, [state.isTouch]);

  // Get responsive classes based on current state
  const getResponsiveClasses = useCallback(() => {
    return {
      container: state.screenSize === 'sm' ? 'px-2' : 'px-4 sm:px-6 lg:px-8',
      text: state.screenSize === 'sm' ? 'text-sm' : 'text-base',
      spacing: state.screenSize === 'sm' ? 'space-y-2' : 'space-y-4',
      grid: {
        1: 'grid-cols-1',
        2: state.screenSize === 'sm' ? 'grid-cols-1' : 'grid-cols-2',
        3: state.screenSize === 'sm' ? 'grid-cols-1' : state.screenSize === 'md' ? 'grid-cols-2' : 'grid-cols-3',
        4: state.screenSize === 'sm' ? 'grid-cols-1' : state.screenSize === 'md' ? 'grid-cols-2' : 'grid-cols-4'
      }
    };
  }, [state.screenSize]);

  return {
    ...state,
    measureComponentPerformance,
    addTouchGestures,
    getResponsiveClasses,
    // Utility methods
    shouldUseMobileLayout: state.isMobile || state.screenSize === 'sm',
    shouldOptimizeForTouch: state.isTouch,
    shouldReduceAnimations: state.isSlowConnection || state.isMobile
  };
};