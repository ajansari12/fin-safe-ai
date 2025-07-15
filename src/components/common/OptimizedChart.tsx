import React, { memo, useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';

interface OptimizedChartProps {
  children: React.ReactElement;
  height?: number;
  width?: string;
  className?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  role?: string;
}

const OptimizedChart = memo<OptimizedChartProps>(({ 
  children, 
  height = 300, 
  width = "100%",
  className,
  ariaLabel,
  ariaDescription,
  role = "img"
}) => {
  const containerProps = useMemo(() => ({
    width,
    height,
    className
  }), [width, height, className]);

  const accessibilityProps = useMemo(() => ({
    role,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescription ? `chart-desc-${Math.random().toString(36).substr(2, 9)}` : undefined,
    tabIndex: 0
  }), [role, ariaLabel, ariaDescription]);

  return (
    <div {...accessibilityProps} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
      {ariaDescription && (
        <div id={accessibilityProps['aria-describedby']} className="sr-only">
          {ariaDescription}
        </div>
      )}
      <ResponsiveContainer {...containerProps}>
        {children}
      </ResponsiveContainer>
    </div>
  );
});

OptimizedChart.displayName = 'OptimizedChart';

export default OptimizedChart;