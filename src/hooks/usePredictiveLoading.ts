import { useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface PredictiveLoadingConfig {
  enablePredictiveLoading?: boolean;
  enableServiceWorker?: boolean;
  cacheStrategy?: 'aggressive' | 'conservative' | 'adaptive';
  idleTimeThreshold?: number;
}

interface CachedAsset {
  url: string;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  size?: number;
}

export const usePredictiveLoading = (
  config: PredictiveLoadingConfig = {}
) => {
  const {
    enablePredictiveLoading = true,
    enableServiceWorker = true,
    cacheStrategy = 'adaptive',
    idleTimeThreshold = 2000
  } = config;

  const { connectionType, saveData } = useNetworkStatus();
  const [cachedAssets, setCachedAssets] = useState<CachedAsset[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  // Predict likely next pages based on user behavior
  const predictNextPages = () => {
    const currentPath = window.location.pathname;
    const likelyNextPages: string[] = [];

    switch (currentPath) {
      case '/':
        likelyNextPages.push('/auth/login', '/auth/register');
        break;
      case '/auth/login':
        likelyNextPages.push('/app/dashboard');
        break;
      case '/auth/register':
        likelyNextPages.push('/app/dashboard');
        break;
      default:
        likelyNextPages.push('/');
    }

    return likelyNextPages;
  };

  // Preload critical assets for predicted pages
  const preloadCriticalAssets = async (pages: string[]) => {
    if (!enablePredictiveLoading || saveData) return;
    
    const assetsToPreload = pages.flatMap(page => {
      // Map pages to their critical assets
      switch (page) {
        case '/auth/login':
          return ['/auth-background.jpg', '/login-icon.svg'];
        case '/auth/register':
          return ['/auth-background.jpg', '/register-icon.svg'];
        case '/app/dashboard':
          return ['/dashboard-bg.jpg', '/chart-icons.svg'];
        default:
          return [];
      }
    });

    for (const asset of assetsToPreload) {
      try {
        if (asset.endsWith('.jpg') || asset.endsWith('.png')) {
          const img = new Image();
          img.src = asset;
        } else if (asset.endsWith('.svg')) {
          await fetch(asset);
        }
        
        setCachedAssets(prev => [...prev, {
          url: asset,
          timestamp: Date.now(),
          priority: 'medium'
        }]);
      } catch (error) {
        console.warn('Failed to preload asset:', asset);
      }
    }
  };

  // Register service worker for advanced caching
  const registerServiceWorker = async () => {
    if (!enableServiceWorker || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setServiceWorkerReady(true);
      
      // Communicate cache strategy to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'CACHE_STRATEGY',
          strategy: cacheStrategy,
          networkType: connectionType
        });
      }
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  };

  // Intelligent cache management
  const manageCacheIntelligently = () => {
    const now = Date.now();
    const maxAge = cacheStrategy === 'aggressive' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 24h or 1h
    
    setCachedAssets(prev => 
      prev.filter(asset => now - asset.timestamp < maxAge)
    );
  };

  // Detect user idle time and trigger preloading
  useEffect(() => {
    if (!enablePredictiveLoading) return;

    let idleTimer: NodeJS.Timeout;
    let isIdle = false;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      isIdle = false;
      
      idleTimer = setTimeout(() => {
        isIdle = true;
        if (!isPreloading) {
          setIsPreloading(true);
          const nextPages = predictNextPages();
          preloadCriticalAssets(nextPages).finally(() => {
            setIsPreloading(false);
          });
        }
      }, idleTimeThreshold);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [enablePredictiveLoading, idleTimeThreshold, isPreloading]);

  // Initialize service worker
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Clean up cache periodically
  useEffect(() => {
    const interval = setInterval(manageCacheIntelligently, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [cacheStrategy]);

  return {
    cachedAssets,
    isPreloading,
    serviceWorkerReady,
    preloadPage: (page: string) => preloadCriticalAssets([page]),
    clearCache: () => setCachedAssets([]),
    getCacheSize: () => cachedAssets.length
  };
};