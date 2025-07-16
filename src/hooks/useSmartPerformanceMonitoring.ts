import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useLocation } from 'react-router-dom';
import { performanceMonitor } from '@/utils/performance-monitor';

interface SmartPerformanceConfig {
  enablePublicPageMonitoring?: boolean;
  enableLightweightMode?: boolean;
  enableAdaptiveFrequency?: boolean;
  publicPageMetrics?: string[];
}

export const useSmartPerformanceMonitoring = (
  config: SmartPerformanceConfig = {}
) => {
  const {
    enablePublicPageMonitoring = false,
    enableLightweightMode = true,
    enableAdaptiveFrequency = true,
    publicPageMetrics = ['loadTime', 'renderTime']
  } = config;

  const { user } = useAuth();
  const location = useLocation();
  const [monitoringMode, setMonitoringMode] = useState<'full' | 'lightweight' | 'disabled'>('disabled');
  const [isPublicPage, setIsPublicPage] = useState(false);

  useEffect(() => {
    // Determine if current page is public or authenticated
    const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];
    const currentIsPublic = publicRoutes.includes(location.pathname) || 
                           location.pathname.startsWith('/auth/');
    
    setIsPublicPage(currentIsPublic);

    // Set monitoring mode based on user status and page type
    if (user && !currentIsPublic) {
      // Full monitoring for authenticated users on app pages
      setMonitoringMode('full');
    } else if (currentIsPublic && enablePublicPageMonitoring) {
      // Lightweight monitoring for public pages
      setMonitoringMode(enableLightweightMode ? 'lightweight' : 'full');
    } else {
      // Disabled monitoring
      setMonitoringMode('disabled');
    }
  }, [user, location.pathname, enablePublicPageMonitoring, enableLightweightMode]);

  // Smart monitoring frequency based on page type and user activity
  const getMonitoringFrequency = () => {
    if (!enableAdaptiveFrequency) return 1000; // Default 1 second
    
    if (monitoringMode === 'disabled') return 0;
    if (monitoringMode === 'lightweight') return 5000; // 5 seconds for public pages
    if (isPublicPage) return 3000; // 3 seconds for public pages with auth
    return 1000; // 1 second for authenticated app pages
  };

  // Lightweight performance tracking
  const trackLightweightMetrics = (componentName: string) => {
    if (monitoringMode === 'disabled') return () => {};
    
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (monitoringMode === 'lightweight') {
        // Only track essential metrics for public pages
        if (publicPageMetrics.includes('renderTime')) {
          console.log(`[Lightweight] ${componentName} render time: ${duration.toFixed(2)}ms`);
        }
      } else {
        // Full tracking for authenticated users - use measureComponent for timing
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Full] ${componentName} render time: ${duration.toFixed(2)}ms`);
        }
      }
    };
  };

  // Memory usage monitoring with adaptive frequency
  useEffect(() => {
    const frequency = getMonitoringFrequency();
    if (frequency === 0) return;

    const interval = setInterval(() => {
      if (monitoringMode === 'full') {
        performanceMonitor.checkMemoryUsage();
      } else if (monitoringMode === 'lightweight') {
        // Basic memory check for public pages
        if ('memory' in performance) {
          const memInfo = (performance as any).memory;
          if (memInfo.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
            console.warn('[Lightweight] High memory usage detected:', memInfo.usedJSHeapSize / 1024 / 1024, 'MB');
          }
        }
      }
    }, frequency);

    return () => clearInterval(interval);
  }, [monitoringMode, getMonitoringFrequency]);

  return {
    monitoringMode,
    isPublicPage,
    trackLightweightMetrics,
    shouldMonitor: monitoringMode !== 'disabled',
    isLightweightMode: monitoringMode === 'lightweight'
  };
};