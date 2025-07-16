import { useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useBundleOptimization } from './useBundleOptimization';

interface AssetPreloadingConfig {
  enablePreloading?: boolean;
  preloadImages?: boolean;
  preloadFonts?: boolean;
  preloadCriticalRoutes?: boolean;
  respectDataSaver?: boolean;
}

export const useAssetPreloading = (
  config: AssetPreloadingConfig = {}
) => {
  const {
    enablePreloading = true,
    preloadImages = true,
    preloadFonts = true,
    preloadCriticalRoutes = true,
    respectDataSaver = true
  } = config;

  const { connectionType, saveData } = useNetworkStatus();
  const { optimizationLevel, shouldPreload: shouldPreloadByStrategy } = useBundleOptimization();
  const [preloadingStatus, setPreloadingStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [preloadedAssets, setPreloadedAssets] = useState<string[]>([]);

  // Critical assets to preload
  const criticalAssets = [
    // Fonts
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    // Critical images (placeholder URLs)
    '/placeholder.svg',
    '/favicon.ico'
  ];

  // Critical routes to preload
  const criticalRoutes = [
    '/auth/login',
    '/auth/register',
    '/app/dashboard'
  ];

  const shouldPreload = () => {
    if (!enablePreloading) return false;
    if (respectDataSaver && saveData) return false;
    if (connectionType === 'slow' && optimizationLevel === 'aggressive') return false;
    return shouldPreloadByStrategy('medium');
  };

  // Preload fonts
  const preloadFont = (href: string) => {
    return new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Don't fail on font load errors
      document.head.appendChild(link);
    });
  };

  // Preload images
  const preloadImage = (src: string) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Don't fail on image load errors
      img.src = src;
    });
  };

  // Preload critical routes (components)
  const preloadRoute = async (route: string) => {
    try {
      // This would typically preload the route's component
      // For now, we'll just simulate preloading
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.warn(`Failed to preload route: ${route}`, error);
      return false;
    }
  };

  // Main preloading function
  const startPreloading = async () => {
    if (!shouldPreload()) return;
    
    setPreloadingStatus('loading');
    const loadedAssets: string[] = [];

    try {
      // Preload fonts
      if (preloadFonts) {
        await Promise.all(
          criticalAssets
            .filter(asset => asset.includes('fonts.googleapis.com'))
            .map(async (font) => {
              await preloadFont(font);
              loadedAssets.push(font);
            })
        );
      }

      // Preload images
      if (preloadImages) {
        await Promise.all(
          criticalAssets
            .filter(asset => asset.includes('.svg') || asset.includes('.ico') || asset.includes('.png'))
            .map(async (image) => {
              await preloadImage(image);
              loadedAssets.push(image);
            })
        );
      }

      // Preload critical routes
      if (preloadCriticalRoutes) {
        await Promise.all(
          criticalRoutes.map(async (route) => {
            const success = await preloadRoute(route);
            if (success) loadedAssets.push(route);
          })
        );
      }

      setPreloadedAssets(loadedAssets);
      setPreloadingStatus('complete');
    } catch (error) {
      console.warn('Asset preloading failed:', error);
      setPreloadingStatus('complete');
    }
  };

  // Start preloading on idle time
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        startPreloading();
      });
      
      return () => {
        if ('cancelIdleCallback' in window) {
          window.cancelIdleCallback(idleCallback);
        }
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(() => {
        startPreloading();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [connectionType, saveData]);

  return {
    preloadingStatus,
    preloadedAssets,
    shouldPreload: shouldPreload(),
    preloadAsset: (asset: string) => {
      if (asset.includes('fonts.googleapis.com')) {
        return preloadFont(asset);
      } else {
        return preloadImage(asset);
      }
    }
  };
};