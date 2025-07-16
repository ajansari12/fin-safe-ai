import { useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface BundleOptimizationConfig {
  enableCodeSplitting?: boolean;
  preloadCriticalChunks?: boolean;
  deferNonCritical?: boolean;
}

export const useBundleOptimization = (
  config: BundleOptimizationConfig = {}
) => {
  const {
    enableCodeSplitting = true,
    preloadCriticalChunks = true,
    deferNonCritical = true
  } = config;

  const { connectionType, saveData } = useNetworkStatus();
  const [optimizationLevel, setOptimizationLevel] = useState<'aggressive' | 'balanced' | 'conservative'>('balanced');

  useEffect(() => {
    // Adjust optimization strategy based on network conditions
    if (saveData || connectionType === 'slow') {
      setOptimizationLevel('aggressive');
    } else if (connectionType === 'fast') {
      setOptimizationLevel('conservative');
    } else {
      setOptimizationLevel('balanced');
    }
  }, [connectionType, saveData]);

  // Resource hints for critical resources
  const addResourceHints = () => {
    if (!preloadCriticalChunks) return;

    const hints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: true },
      { rel: 'dns-prefetch', href: 'https://api.example.com' }
    ];

    hints.forEach(hint => {
      const existing = document.querySelector(`link[href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossOrigin) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });
  };

  // Defer non-critical resources
  const deferNonCriticalResources = () => {
    if (!deferNonCritical) return;

    // Defer analytics and other non-critical scripts
    const deferredScripts = [
      'gtag',
      'analytics',
      'hotjar',
      'intercom'
    ];

    deferredScripts.forEach(scriptType => {
      const elements = document.querySelectorAll(`script[data-type="${scriptType}"]`);
      elements.forEach(element => {
        if (element instanceof HTMLScriptElement) {
          element.defer = true;
        }
      });
    });
  };

  // Optimize based on device capabilities
  const getOptimizationStrategy = () => {
    const isLowEndDevice = navigator.hardwareConcurrency <= 2;
    const hasLimitedMemory = 'memory' in performance && 
      (performance as any).memory?.usedJSHeapSize > 100 * 1024 * 1024;

    if (isLowEndDevice || hasLimitedMemory || optimizationLevel === 'aggressive') {
      return {
        chunkSize: 'small',
        preloadLimit: 2,
        deferThreshold: 0
      };
    } else if (optimizationLevel === 'conservative') {
      return {
        chunkSize: 'large',
        preloadLimit: 6,
        deferThreshold: 1000
      };
    } else {
      return {
        chunkSize: 'medium',
        preloadLimit: 4,
        deferThreshold: 500
      };
    }
  };

  useEffect(() => {
    addResourceHints();
    deferNonCriticalResources();
  }, [optimizationLevel]);

  return {
    optimizationLevel,
    strategy: getOptimizationStrategy(),
    shouldPreload: (priority: 'high' | 'medium' | 'low') => {
      const { preloadLimit } = getOptimizationStrategy();
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[priority] <= preloadLimit;
    }
  };
};