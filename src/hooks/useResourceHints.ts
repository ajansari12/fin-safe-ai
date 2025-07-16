import { useEffect, useState } from 'react';

interface ResourceHint {
  type: 'dns-prefetch' | 'preconnect' | 'modulepreload' | 'prefetch' | 'preload';
  href: string;
  as?: string;
  crossOrigin?: boolean;
  media?: string;
}

interface ResourceHintsConfig {
  enableDnsPrefetch?: boolean;
  enablePreconnect?: boolean;
  enablePreload?: boolean;
  enablePrefetch?: boolean;
  criticalResources?: string[];
  externalDomains?: string[];
}

export const useResourceHints = (config: ResourceHintsConfig = {}) => {
  const {
    enableDnsPrefetch = true,
    enablePreconnect = true,
    enablePreload = true,
    enablePrefetch = true,
    criticalResources = [],
    externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdn.jsdelivr.net',
      'unpkg.com'
    ]
  } = config;

  const [hintsApplied, setHintsApplied] = useState<string[]>([]);

  // Apply DNS prefetch hints
  const applyDnsPrefetch = () => {
    if (!enableDnsPrefetch) return;

    externalDomains.forEach(domain => {
      const hint: ResourceHint = {
        type: 'dns-prefetch',
        href: `https://${domain}`
      };
      
      if (!document.querySelector(`link[rel="dns-prefetch"][href="${hint.href}"]`)) {
        addResourceHint(hint);
      }
    });
  };

  // Apply preconnect hints
  const applyPreconnect = () => {
    if (!enablePreconnect) return;

    const criticalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    criticalDomains.forEach(domain => {
      const hint: ResourceHint = {
        type: 'preconnect',
        href: `https://${domain}`,
        crossOrigin: domain.includes('gstatic')
      };
      
      if (!document.querySelector(`link[rel="preconnect"][href="${hint.href}"]`)) {
        addResourceHint(hint);
      }
    });
  };

  // Apply preload hints for critical resources
  const applyPreload = () => {
    if (!enablePreload) return;

    const criticalAssets = [
      { href: '/fonts/inter-var.woff2', as: 'font', crossOrigin: true },
      { href: '/placeholder.svg', as: 'image' },
      ...criticalResources.map(resource => ({
        href: resource,
        as: detectResourceType(resource)
      }))
    ];

    criticalAssets.forEach(asset => {
      const hint: ResourceHint = {
        type: 'preload',
        href: asset.href,
        as: asset.as,
        crossOrigin: asset.crossOrigin
      };
      
      if (!document.querySelector(`link[rel="preload"][href="${hint.href}"]`)) {
        addResourceHint(hint);
      }
    });
  };

  // Apply prefetch hints for likely next resources
  const applyPrefetch = () => {
    if (!enablePrefetch) return;

    // Prefetch likely next page resources based on current page
    const currentPath = window.location.pathname;
    const likelyNextResources: string[] = [];

    switch (currentPath) {
      case '/':
        likelyNextResources.push(
          '/auth/login',
          '/auth/register',
          '/css/auth.css',
          '/js/auth.js'
        );
        break;
      case '/auth/login':
        likelyNextResources.push(
          '/dashboard',
          '/css/dashboard.css',
          '/js/dashboard.js'
        );
        break;
    }

    likelyNextResources.forEach(resource => {
      const hint: ResourceHint = {
        type: 'prefetch',
        href: resource
      };
      
      if (!document.querySelector(`link[rel="prefetch"][href="${hint.href}"]`)) {
        addResourceHint(hint);
      }
    });
  };

  // Detect resource type from URL
  const detectResourceType = (url: string): string => {
    if (url.includes('.css')) return 'style';
    if (url.includes('.js')) return 'script';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    if (url.includes('.json')) return 'fetch';
    return 'document';
  };

  // Add resource hint to DOM
  const addResourceHint = (hint: ResourceHint) => {
    const link = document.createElement('link');
    link.rel = hint.type;
    link.href = hint.href;
    
    if (hint.as) link.as = hint.as;
    if (hint.crossOrigin) link.crossOrigin = 'anonymous';
    if (hint.media) link.media = hint.media;
    
    // Add attributes for tracking
    link.setAttribute('data-resource-hint', 'true');
    link.setAttribute('data-hint-type', hint.type);
    
    document.head.appendChild(link);
    setHintsApplied(prev => [...prev, `${hint.type}:${hint.href}`]);
  };

  // Dynamic prefetch based on user interaction
  const prefetchOnHover = (url: string) => {
    if (!enablePrefetch) return;

    const hint: ResourceHint = {
      type: 'prefetch',
      href: url
    };
    
    if (!document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
      addResourceHint(hint);
    }
  };

  // Preload critical CSS for next route
  const preloadCriticalCSS = (route: string) => {
    const cssMap: { [key: string]: string } = {
      '/dashboard': '/css/dashboard.css',
      '/auth': '/css/auth.css',
      '/reports': '/css/reports.css'
    };

    const cssFile = cssMap[route];
    if (cssFile) {
      const hint: ResourceHint = {
        type: 'preload',
        href: cssFile,
        as: 'style'
      };
      
      if (!document.querySelector(`link[rel="preload"][href="${cssFile}"]`)) {
        addResourceHint(hint);
      }
    }
  };

  // Apply critical resource hints
  const applyCriticalHints = () => {
    applyDnsPrefetch();
    applyPreconnect();
    applyPreload();
  };

  // Apply non-critical resource hints
  const applyNonCriticalHints = () => {
    applyPrefetch();
  };

  // Initialize resource hints
  useEffect(() => {
    // Apply critical hints immediately
    applyCriticalHints();
    
    // Apply non-critical hints after a delay
    const timer = setTimeout(() => {
      applyNonCriticalHints();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Set up hover prefetching for navigation links
  useEffect(() => {
    const handleLinkHover = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).href;
        if (href && href.startsWith(window.location.origin)) {
          prefetchOnHover(href);
        }
      }
    };

    document.addEventListener('mouseover', handleLinkHover);
    return () => document.removeEventListener('mouseover', handleLinkHover);
  }, []);

  return {
    hintsApplied,
    prefetchOnHover,
    preloadCriticalCSS,
    addCustomHint: addResourceHint,
    getAppliedHints: () => hintsApplied,
    clearHints: () => {
      document.querySelectorAll('link[data-resource-hint="true"]').forEach(link => {
        link.remove();
      });
      setHintsApplied([]);
    }
  };
};