import React, { memo, useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';

interface OptimizedChartProps {
  children: React.ReactElement;
  height?: number;
  width?: string;
  className?: string;
}

const OptimizedChart = memo<OptimizedChartProps>(({ 
  children, 
  height = 300, 
  width = "100%",
  className 
}) => {
  const containerProps = useMemo(() => ({
    width,
    height,
    className
  }), [width, height, className]);

  return (
    <ResponsiveContainer {...containerProps}>
      {children}
    </ResponsiveContainer>
  );
});

OptimizedChart.displayName = 'OptimizedChart';

export default OptimizedChart;