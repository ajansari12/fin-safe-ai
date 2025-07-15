import React, { memo, useMemo } from 'react';
import { ResponsiveContainer } from 'recharts';

interface AccessibleChartProps {
  children: React.ReactElement;
  height?: number;
  width?: string;
  className?: string;
  ariaLabel: string;
  ariaDescription?: string;
  role?: string;
  dataSummary?: string;
}

const AccessibleChart = memo<AccessibleChartProps>(({ 
  children, 
  height = 300, 
  width = "100%",
  className,
  ariaLabel,
  ariaDescription,
  role = "img",
  dataSummary
}) => {
  const containerProps = useMemo(() => ({
    width,
    height,
    className
  }), [width, height, className]);

  const descriptionId = useMemo(() => 
    `chart-desc-${Math.random().toString(36).substr(2, 9)}`, 
    []
  );

  const summaryId = useMemo(() => 
    `chart-summary-${Math.random().toString(36).substr(2, 9)}`, 
    []
  );

  const accessibilityProps = useMemo(() => ({
    role,
    'aria-label': ariaLabel,
    'aria-describedby': [
      ariaDescription ? descriptionId : null,
      dataSummary ? summaryId : null
    ].filter(Boolean).join(' ') || undefined,
    tabIndex: 0
  }), [role, ariaLabel, ariaDescription, dataSummary, descriptionId, summaryId]);

  return (
    <div 
      {...accessibilityProps} 
      className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    >
      {/* Screen reader accessible descriptions */}
      {ariaDescription && (
        <div id={descriptionId} className="sr-only">
          {ariaDescription}
        </div>
      )}
      {dataSummary && (
        <div id={summaryId} className="sr-only">
          Data summary: {dataSummary}
        </div>
      )}
      
      {/* Visual chart for sighted users */}
      <ResponsiveContainer {...containerProps}>
        {children}
      </ResponsiveContainer>
    </div>
  );
});

AccessibleChart.displayName = 'AccessibleChart';

export default AccessibleChart;