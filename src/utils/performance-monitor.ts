// Performance monitoring for mobile and desktop
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  bundleSize?: number;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordNavigationMetrics(navEntry);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Observe paint timing
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordPaintMetrics(entry);
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordLCPMetrics(lastEntry);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

      } catch (error) {
        console.warn('Performance observers not fully supported:', error);
      }
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics: PerformanceMetrics = {
      loadTime: entry.loadEventEnd - entry.loadEventStart,
      renderTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      interactionTime: entry.domInteractive - entry.fetchStart
    };

    this.metrics.set('navigation', metrics);
    this.logPerformanceWarnings(metrics);
  }

  private recordPaintMetrics(entry: PerformanceEntry): void {
    console.log(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
    
    if (entry.name === 'first-contentful-paint' && entry.startTime > 2500) {
      console.warn(`⚠️ First Contentful Paint is slow: ${entry.startTime.toFixed(2)}ms (target: <1500ms)`);
    }
  }

  private recordLCPMetrics(entry: PerformanceEntry): void {
    console.log(`Largest Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
    
    if (entry.startTime > 4000) {
      console.warn(`⚠️ Largest Contentful Paint is slow: ${entry.startTime.toFixed(2)}ms (target: <2500ms)`);
    }
  }

  private logPerformanceWarnings(metrics: PerformanceMetrics): void {
    if (metrics.loadTime > 3000) {
      console.warn(`⚠️ Page load time is slow: ${metrics.loadTime.toFixed(2)}ms (target: <3000ms)`);
    }
    
    if (metrics.renderTime > 1000) {
      console.warn(`⚠️ DOM content load time is slow: ${metrics.renderTime.toFixed(2)}ms (target: <1000ms)`);
    }
  }

  // Measure component performance
  measureComponent<T>(
    componentName: string,
    operation: () => T | Promise<T>
  ): T | Promise<T> {
    const startTime = performance.now();
    
    const result = operation();
    
    if (result instanceof Promise) {
      return result.then((value) => {
        const endTime = performance.now();
        this.recordComponentMetrics(componentName, endTime - startTime);
        return value;
      });
    } else {
      const endTime = performance.now();
      this.recordComponentMetrics(componentName, endTime - startTime);
      return result;
    }
  }

  private recordComponentMetrics(componentName: string, duration: number): void {
    const existing = this.metrics.get(componentName) || {
      loadTime: 0,
      renderTime: duration,
      interactionTime: 0
    };
    
    this.metrics.set(componentName, {
      ...existing,
      renderTime: duration
    });

    // Log warnings for slow components
    if (duration > 100) {
      console.warn(`⚠️ Component ${componentName} is slow: ${duration.toFixed(2)}ms (target: <100ms)`);
    }
  }

  // Check memory usage
  checkMemoryUsage(): number | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      
      if (usage > 100) {
        console.warn(`⚠️ High memory usage: ${usage.toFixed(2)}MB (target: <50MB)`);
      }
      
      return usage;
    }
    return null;
  }

  // Get performance report
  getReport(): {
    summary: {
      overallScore: number;
      loadTime: number;
      renderTime: number;
      memoryUsage: number | null;
    };
    components: { [key: string]: PerformanceMetrics };
    recommendations: string[];
  } {
    const navigation = this.metrics.get('navigation');
    const memoryUsage = this.checkMemoryUsage();
    
    const components: { [key: string]: PerformanceMetrics } = {};
    this.metrics.forEach((metrics, name) => {
      if (name !== 'navigation') {
        components[name] = metrics;
      }
    });

    const recommendations: string[] = [];
    
    // Generate recommendations
    if (navigation && navigation.loadTime > 3000) {
      recommendations.push('Optimize bundle size and enable code splitting');
    }
    
    if (memoryUsage && memoryUsage > 50) {
      recommendations.push('Optimize memory usage by cleaning up event listeners and large objects');
    }
    
    Object.entries(components).forEach(([name, metrics]) => {
      if (metrics.renderTime > 100) {
        recommendations.push(`Optimize ${name} component rendering performance`);
      }
    });

    // Calculate overall score
    let score = 100;
    if (navigation) {
      if (navigation.loadTime > 3000) score -= 20;
      if (navigation.renderTime > 1000) score -= 15;
    }
    if (memoryUsage && memoryUsage > 50) score -= 15;
    
    Object.values(components).forEach((metrics) => {
      if (metrics.renderTime > 100) score -= 10;
    });

    return {
      summary: {
        overallScore: Math.max(0, score),
        loadTime: navigation?.loadTime || 0,
        renderTime: navigation?.renderTime || 0,
        memoryUsage
      },
      components,
      recommendations
    };
  }

  // Cleanup observers
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();