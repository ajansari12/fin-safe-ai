import React, { memo, useMemo, useEffect, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { QueryOptimizer } from '@/lib/performance/query-optimizer';

interface OptimizedChartProps {
  children: React.ReactElement;
  data?: any[];
  height?: number;
  width?: string;
  className?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  role?: string;
  maxDataPoints?: number;
  enableSampling?: boolean;
  enablePerformanceMonitoring?: boolean;
}

const OptimizedChart = memo<OptimizedChartProps>(({ 
  children, 
  data = [],
  height = 300, 
  width = "100%",
  className,
  ariaLabel,
  ariaDescription,
  role = "img",
  maxDataPoints = 500,
  enableSampling = true,
  enablePerformanceMonitoring = true
}) => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [optimizedData, setOptimizedData] = useState<any[]>(data);

  // Optimize data for performance
  const processedData = useMemo(() => {
    const startTime = performance.now();
    
    let processedData = data;
    
    // Apply data sampling if enabled and data is large
    if (enableSampling && data.length > maxDataPoints) {
      processedData = QueryOptimizer.sampleChartData(data, maxDataPoints);
    }
    
    // Log performance if enabled
    if (enablePerformanceMonitoring) {
      const processingTime = performance.now() - startTime;
      console.debug(`Chart data processing: ${processingTime.toFixed(2)}ms for ${data.length} points`);
    }
    
    return processedData;
  }, [data, maxDataPoints, enableSampling, enablePerformanceMonitoring]);

  // Monitor render performance
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      const startTime = performance.now();
      
      // Use requestAnimationFrame to measure after render
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        setRenderTime(renderTime);
        
        // Log slow renders
        if (renderTime > 100) {
          console.warn(`Slow chart render: ${renderTime.toFixed(2)}ms`);
        }
      });
    }
  }, [processedData, enablePerformanceMonitoring]);

  // Memoize container props
  const containerProps = useMemo(() => ({
    width,
    height,
    className: `${className || ''} ${processedData.length > 200 ? 'chart-large-dataset' : ''}`.trim()
  }), [width, height, className, processedData.length]);

  // Memoize accessibility props
  const accessibilityProps = useMemo(() => {
    const descId = ariaDescription ? `chart-desc-${Math.random().toString(36).substr(2, 9)}` : undefined;
    return {
      role,
      'aria-label': ariaLabel,
      'aria-describedby': descId,
      tabIndex: 0,
      'data-testid': 'optimized-chart'
    };
  }, [role, ariaLabel, ariaDescription]);

  // Clone children with optimized data
  const enhancedChildren = useMemo(() => {
    if (React.isValidElement(children) && processedData.length > 0) {
      return React.cloneElement(children, {
        data: processedData,
        ...(children.props || {})
      });
    }
    return children;
  }, [children, processedData]);

  return (
    <div {...accessibilityProps} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded relative">
      {ariaDescription && (
        <div id={accessibilityProps['aria-describedby']} className="sr-only">
          {ariaDescription}
        </div>
      )}
      
      {/* Performance indicator for dev mode */}
      {enablePerformanceMonitoring && process.env.NODE_ENV === 'development' && renderTime > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
          {renderTime.toFixed(1)}ms • {processedData.length} pts
        </div>
      )}
      
      <ResponsiveContainer {...containerProps}>
        {enhancedChildren}
      </ResponsiveContainer>
    </div>
  );
});

OptimizedChart.displayName = 'OptimizedChart';

export default OptimizedChart;