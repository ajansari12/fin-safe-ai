
// Bundle optimization utilities
export const BundleAnalyzer = {
  // Analyze component bundle sizes
  analyzeComponentSize: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return {
        measureRender: () => {
          const endTime = performance.now();
          const renderTime = endTime - startTime;
          
          console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
          
          // Log if render is slow
          if (renderTime > 16) {
            console.warn(`⚠️ Slow render detected in ${componentName}`);
          }
          
          return renderTime;
        }
      };
    }
    
    return { measureRender: () => 0 };
  },

  // Tree shaking analyzer
  analyzeImports: (moduleName: string, imports: string[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 ${moduleName} imports:`, imports);
      
      // Warn about large imports
      const largeImports = imports.filter(imp => 
        ['lodash', 'moment', 'material-ui'].some(large => imp.includes(large))
      );
      
      if (largeImports.length > 0) {
        console.warn(`⚠️ Large imports detected in ${moduleName}:`, largeImports);
      }
    }
  }
};

// Code splitting utilities
export const CodeSplitter = {
  // Dynamic import with error handling
  dynamicImport: async <T>(importFn: () => Promise<T>): Promise<T | null> => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return null;
    }
  },

  // Preload critical routes
  preloadRoute: (routePath: string) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import(/* webpackChunkName: "[request]" */ `../pages${routePath}`);
      });
    }
  }
};
