import { useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface NetworkAdaptiveConfig {
  enableAdaptiveQuality?: boolean;
  enableDataSaver?: boolean;
  adaptiveImageLoading?: boolean;
  enableOfflineMode?: boolean;
}

export const useNetworkAdaptiveLoading = (
  config: NetworkAdaptiveConfig = {}
) => {
  const {
    enableAdaptiveQuality = true,
    enableDataSaver = true,
    adaptiveImageLoading = true,
    enableOfflineMode = true
  } = config;

  const { connectionType, saveData, isOnline } = useNetworkStatus();
  const [adaptiveStrategy, setAdaptiveStrategy] = useState<'high' | 'medium' | 'low'>('medium');
  const [imageQuality, setImageQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [loadingMode, setLoadingMode] = useState<'eager' | 'lazy' | 'critical-only'>('lazy');

  // Adapt strategy based on network conditions
  useEffect(() => {
    if (!isOnline && enableOfflineMode) {
      setAdaptiveStrategy('low');
      setImageQuality('low');
      setLoadingMode('critical-only');
      return;
    }

    if (saveData && enableDataSaver) {
      setAdaptiveStrategy('low');
      setImageQuality('low');
      setLoadingMode('critical-only');
    } else if (connectionType === 'slow') {
      setAdaptiveStrategy('low');
      setImageQuality('medium');
      setLoadingMode('lazy');
    } else if (connectionType === 'fast') {
      setAdaptiveStrategy('high');
      setImageQuality('high');
      setLoadingMode('eager');
    } else {
      setAdaptiveStrategy('medium');
      setImageQuality('medium');
      setLoadingMode('lazy');
    }
  }, [connectionType, saveData, isOnline]);

  // Get optimized image URL based on network conditions
  const getOptimizedImageUrl = (originalUrl: string, options: {
    width?: number;
    height?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}) => {
    if (!adaptiveImageLoading) return originalUrl;

    const { width, height, format = 'webp' } = options;
    const quality = imageQuality === 'high' ? 90 : imageQuality === 'medium' ? 70 : 50;
    
    // In a real app, this would use an image optimization service
    // For demo, we'll just append quality parameters
    const url = new URL(originalUrl, window.location.origin);
    url.searchParams.set('q', quality.toString());
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('f', format);
    
    return url.toString();
  };

  // Get loading strategy for components
  const getLoadingStrategy = (priority: 'critical' | 'high' | 'medium' | 'low') => {
    if (loadingMode === 'critical-only' && priority !== 'critical') {
      return { shouldLoad: false, delay: Infinity };
    }

    const delays = {
      high: { critical: 0, high: 0, medium: 200, low: 500 },
      medium: { critical: 0, high: 100, medium: 300, low: 800 },
      low: { critical: 0, high: 200, medium: 600, low: 1200 }
    };

    return {
      shouldLoad: true,
      delay: delays[adaptiveStrategy][priority],
      preload: adaptiveStrategy === 'high' && priority !== 'low'
    };
  };

  // Adaptive prefetch based on network
  const shouldPrefetch = (resourceType: 'image' | 'script' | 'style' | 'route') => {
    if (!isOnline || saveData) return false;
    
    const prefetchMatrix = {
      high: { image: true, script: true, style: true, route: true },
      medium: { image: true, script: true, style: false, route: false },
      low: { image: false, script: false, style: false, route: false }
    };

    return prefetchMatrix[adaptiveStrategy][resourceType];
  };

  // Network-aware animation settings
  const getAnimationSettings = () => {
    return {
      enableAnimations: adaptiveStrategy !== 'low',
      reducedMotion: loadingMode === 'critical-only',
      animationDuration: adaptiveStrategy === 'high' ? 'normal' : 'fast',
      enableParallax: adaptiveStrategy === 'high',
      enableTransitions: adaptiveStrategy !== 'low'
    };
  };

  return {
    adaptiveStrategy,
    imageQuality,
    loadingMode,
    isOnline,
    getOptimizedImageUrl,
    getLoadingStrategy,
    shouldPrefetch,
    getAnimationSettings,
    // Helper methods
    shouldLoadImages: loadingMode !== 'critical-only',
    shouldLoadVideos: adaptiveStrategy === 'high',
    shouldUseWebP: connectionType !== 'slow',
    maxConcurrentRequests: adaptiveStrategy === 'high' ? 6 : adaptiveStrategy === 'medium' ? 4 : 2
  };
};