
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  database: 'healthy' | 'warning' | 'critical';
  integrations: 'healthy' | 'warning' | 'critical';
  performance: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

export const SystemStatusIndicator: React.FC = () => {
  const { profile } = useAuth();
  const [status, setStatus] = useState<SystemStatus>({
    overall: 'unknown',
    database: 'healthy',
    integrations: 'healthy',
    performance: 'healthy',
    lastUpdated: new Date()
  });

  useEffect(() => {
    if (!profile?.organization_id) return;

    const checkSystemStatus = async () => {
      try {
        // Check database connectivity
        const { error: dbError } = await supabase
          .from('performance_metrics')
          .select('id')
          .limit(1);

        // Check recent performance metrics
        const { data: recentMetrics, error: metricsError } = await supabase
          .from('performance_metrics')
          .select('*')
          .eq('org_id', profile.organization_id)
          .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .limit(1);

        // Check integration health
        const { data: integrationHealth, error: integrationError } = await supabase
          .from('integrations')
          .select('status')
          .eq('org_id', profile.organization_id)
          .eq('is_active', true);

        const newStatus: SystemStatus = {
          database: dbError ? 'critical' : 'healthy',
          integrations: integrationError ? 'critical' : 
                       integrationHealth?.some(i => i.status === 'error') ? 'warning' : 'healthy',
          performance: metricsError ? 'warning' : 
                      recentMetrics && recentMetrics.length > 0 ? 'healthy' : 'warning',
          overall: 'healthy',
          lastUpdated: new Date()
        };

        // Determine overall status
        if ([newStatus.database, newStatus.integrations, newStatus.performance].includes('critical')) {
          newStatus.overall = 'critical';
        } else if ([newStatus.database, newStatus.integrations, newStatus.performance].includes('warning')) {
          newStatus.overall = 'warning';
        } else {
          newStatus.overall = 'healthy';
        }

        setStatus(newStatus);
      } catch (error) {
        console.error('Error checking system status:', error);
        setStatus(prev => ({ ...prev, overall: 'warning', lastUpdated: new Date() }));
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [profile?.organization_id]);

  const getStatusIcon = (statusType: 'healthy' | 'warning' | 'critical' | 'unknown') => {
    switch (statusType) {
      case 'healthy':
        return <CheckCircle className="h-3 w-3" />;
      case 'warning':
        return <Clock className="h-3 w-3" />;
      case 'critical':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getStatusColor = (statusType: 'healthy' | 'warning' | 'critical' | 'unknown') => {
    switch (statusType) {
      case 'healthy':
        return 'bg-green-500 text-green-50';
      case 'warning':
        return 'bg-yellow-500 text-yellow-50';
      case 'critical':
        return 'bg-red-500 text-red-50';
      default:
        return 'bg-gray-500 text-gray-50';
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className={`${getStatusColor(status.overall)} flex items-center gap-1`}>
          {getStatusIcon(status.overall)}
          System Status
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span>Database:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(status.database)}
              <span className="capitalize">{status.database}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Integrations:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(status.integrations)}
              <span className="capitalize">{status.integrations}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Performance:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(status.performance)}
              <span className="capitalize">{status.performance}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Last updated: {status.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
