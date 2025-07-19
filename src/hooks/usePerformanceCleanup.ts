
import { useEffect } from 'react';

export const usePerformanceCleanup = () => {
  useEffect(() => {
    // Disabled for stability - no performance monitoring during emergency fix
    return () => {
      // Simple cleanup without complex monitoring
      if (process.env.NODE_ENV === 'development') {
        console.log('Component unmounted - performance monitoring disabled');
      }
    };
  }, []);
};
