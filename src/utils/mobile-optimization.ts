// Mobile optimization utilities for touch interactions and responsive design

export const TOUCH_TARGET_SIZE = 44; // Minimum touch target size in pixels (WCAG)

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const getOptimalTouchTarget = (size: number = TOUCH_TARGET_SIZE): string => {
  return `min-h-[${size}px] min-w-[${size}px]`;
};

export const getMobileBreakpointClasses = () => ({
  hideOnMobile: 'hidden sm:block',
  showOnMobile: 'block sm:hidden',
  compactOnMobile: 'text-xs sm:text-sm px-2 sm:px-3',
  stackOnMobile: 'flex-col sm:flex-row',
  centerOnMobile: 'text-center sm:text-left'
});

export const addSwipeGestures = (
  element: HTMLElement,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold: number = 50
) => {
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    // Ensure horizontal swipe dominates vertical movement
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    isDragging = false;
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};

// Performance monitoring for mobile
export const measurePerformance = (label: string): (() => void) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 3000) { // Alert if over 3 seconds
      console.warn(`Performance warning: ${label} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`${label} completed in ${duration.toFixed(2)}ms`);
    }
  };
};