
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Eye, Activity } from 'lucide-react';
import KRIDetailView from './KRIDetailView';

interface KRICardProps {
  name: string;
  currentValue: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'increasing' | 'decreasing' | 'stable';
  lastUpdated?: string;
  unit?: string;
}

const KRICard: React.FC<KRICardProps> = ({
  name,
  currentValue,
  threshold,
  status,
  trend,
  lastUpdated,
  unit = ''
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal': return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const utilizationPercentage = (currentValue / threshold) * 100;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            {name}
          </CardTitle>
          {getTrendIcon(trend)}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold ${getStatusColor(status)}`}>
                {currentValue}{unit}
              </span>
              {getStatusBadge(status)}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Threshold: {threshold}{unit}
              </span>
              <div className="flex items-center">
                <Target className="mr-1 h-3 w-3" />
                <span className={utilizationPercentage > 100 ? 'text-red-600' : 'text-muted-foreground'}>
                  {utilizationPercentage.toFixed(0)}%
                </span>
              </div>
            </div>
            
            {utilizationPercentage > 80 && (
              <div className="flex items-center space-x-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-700">Approaching threshold</span>
              </div>
            )}
            
            {lastUpdated && (
              <div className="text-xs text-muted-foreground">
                Updated: {lastUpdated}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowDetailModal(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <KRIDetailView
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        kriName={name}
        kriData={{
          currentValue,
          threshold,
          status,
          trend,
          lastUpdated,
          unit
        }}
      />
    </>
  );
};

export default KRICard;
