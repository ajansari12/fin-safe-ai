import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  config: any;
  filters: any;
}

const MetricCard: React.FC<MetricCardProps> = ({ config, filters }) => {
  // Mock data
  const currentValue = 147;
  const previousValue = 132;
  const trend = ((currentValue - previousValue) / previousValue) * 100;
  const isPositive = trend > 0;

  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-4">
      <div className="text-3xl font-bold mb-2">{currentValue.toLocaleString()}</div>
      
      <div className={`flex items-center gap-1 text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        vs. previous period ({previousValue})
      </div>
    </div>
  );
};

export default MetricCard;