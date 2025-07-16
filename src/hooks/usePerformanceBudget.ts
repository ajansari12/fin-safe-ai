import { useEffect, useState, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface PerformanceBudget {
  maxLoadTime: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxBundleSize: number;
  maxImageSize: number;
}

interface PerformanceBudgetConfig {
  enableBudgetMonitoring?: boolean;
  enableAutoOptimization?: boolean;
  budgetThresholds?: Partial<PerformanceBudget>;
  alertOnBreach?: boolean;
}

export const usePerformanceBudget = (
  config: PerformanceBudgetConfig = {}
) => {
  const {
    enableBudgetMonitoring = true,
    enableAutoOptimization = true,
    budgetThresholds = {},
    alertOnBreach = true
  } = config;

  const { connectionType, saveData } = useNetworkStatus();
  const [currentBudget, setCurrentBudget] = useState<PerformanceBudget>({
    maxLoadTime: 3000,
    maxRenderTime: 16,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxBundleSize: 2 * 1024 * 1024, // 2MB
    maxImageSize: 500 * 1024 // 500KB
  });

  const [violations, setViolations] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Adjust budget based on network conditions
  useEffect(() => {
    const baseBudget = {
      maxLoadTime: 3000,
      maxRenderTime: 16,
      maxMemoryUsage: 100 * 1024 * 1024,
      maxBundleSize: 2 * 1024 * 1024,
      maxImageSize: 500 * 1024
    };

    let adjustedBudget = { ...baseBudget };

    if (saveData || connectionType === 'slow') {
      adjustedBudget = {
        maxLoadTime: 5000,
        maxRenderTime: 33,
        maxMemoryUsage: 50 * 1024 * 1024,
        maxBundleSize: 1 * 1024 * 1024,
        maxImageSize: 200 * 1024
      };
    } else if (connectionType === 'fast') {
      adjustedBudget = {
        maxLoadTime: 2000,
        maxRenderTime: 8,
        maxMemoryUsage: 200 * 1024 * 1024,
        maxBundleSize: 4 * 1024 * 1024,
        maxImageSize: 1 * 1024 * 1024
      };
    }

    setCurrentBudget({ ...adjustedBudget, ...budgetThresholds });
  }, [connectionType, saveData, budgetThresholds]);

  // Monitor performance metrics
  const checkBudgetCompliance = useCallback(() => {
    if (!enableBudgetMonitoring) return;

    const violations: string[] = [];

    // Check load time
    if ('navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navTiming.loadEventEnd - navTiming.fetchStart;
      
      if (loadTime > currentBudget.maxLoadTime) {
        violations.push(`Load time exceeded: ${loadTime}ms > ${currentBudget.maxLoadTime}ms`);
      }
    }

    // Check memory usage
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      if (memInfo.usedJSHeapSize > currentBudget.maxMemoryUsage) {
        violations.push(`Memory usage exceeded: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB > ${(currentBudget.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }
    }

    // Check paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp && fcp.startTime > currentBudget.maxRenderTime) {
      violations.push(`First Contentful Paint exceeded: ${fcp.startTime.toFixed(2)}ms > ${currentBudget.maxRenderTime}ms`);
    }

    setViolations(violations);

    if (violations.length > 0) {
      if (alertOnBreach) {
        console.warn('Performance budget violations:', violations);
      }
      
      if (enableAutoOptimization) {
        triggerAutoOptimization(violations);
      }
    }
  }, [currentBudget, enableBudgetMonitoring, alertOnBreach, enableAutoOptimization]);

  // Auto-optimization when budget is exceeded
  const triggerAutoOptimization = async (violations: string[]) => {
    if (isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      for (const violation of violations) {
        if (violation.includes('Memory usage')) {
          await optimizeMemoryUsage();
        } else if (violation.includes('Load time')) {
          await optimizeLoadTime();
        } else if (violation.includes('Paint')) {
          await optimizeRenderTime();
        }
      }
    } catch (error) {
      console.warn('Auto-optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Memory optimization
  const optimizeMemoryUsage = async () => {
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    // Clear unused image caches
    const images = document.querySelectorAll('img[data-cached="true"]');
    images.forEach(img => {
      if (!img.getBoundingClientRect().width) {
        img.remove();
      }
    });

    // Clear console logs in production
    if (process.env.NODE_ENV === 'production') {
      console.clear();
    }
  };

  // Load time optimization
  const optimizeLoadTime = async () => {
    // Remove non-critical CSS
    const styleSheets = document.querySelectorAll('link[rel="stylesheet"][data-priority="low"]');
    styleSheets.forEach(sheet => sheet.remove());

    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[data-critical="false"]');
    scripts.forEach(script => {
      if (script instanceof HTMLScriptElement) {
        script.defer = true;
      }
    });
  };

  // Render time optimization
  const optimizeRenderTime = async () => {
    // Reduce animation complexity
    document.body.style.setProperty('--animation-duration', '0.1s');
    
    // Disable non-critical animations
    const animations = document.querySelectorAll('[data-animation="decorative"]');
    animations.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.animation = 'none';
      }
    });
  };

  // Check compliance periodically
  useEffect(() => {
    if (!enableBudgetMonitoring) return;

    const interval = setInterval(checkBudgetCompliance, 5000); // Check every 5 seconds
    
    // Initial check after load
    setTimeout(checkBudgetCompliance, 2000);

    return () => clearInterval(interval);
  }, [checkBudgetCompliance]);

  return {
    currentBudget,
    violations,
    isOptimizing,
    checkBudgetCompliance,
    setBudgetThreshold: (metric: keyof PerformanceBudget, value: number) => {
      setCurrentBudget(prev => ({ ...prev, [metric]: value }));
    },
    isCompliant: violations.length === 0,
    optimizationTriggers: {
      optimizeMemoryUsage,
      optimizeLoadTime,
      optimizeRenderTime
    }
  };
};