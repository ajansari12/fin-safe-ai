
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface RealTimeConfig {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

export const useRealTimeUpdates = <T>(
  config: RealTimeConfig,
  onUpdate?: (payload: any) => void
) => {
  const { profile } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel(`realtime-${config.table}`)
      .on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: 'public',
          table: config.table,
          filter: config.filter
        },
        (payload) => {
          console.log(`Real-time update for ${config.table}:`, payload);
          setLastUpdate(new Date());
          
          if (onUpdate) {
            onUpdate(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for ${config.table}:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log(`Unsubscribing from ${config.table} real-time updates`);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [config.table, config.event, config.filter, profile?.organization_id, onUpdate]);

  return { isConnected, lastUpdate };
};

// Specialized hooks for different data types
export const usePerformanceUpdates = (onUpdate?: (payload: any) => void) => {
  return useRealTimeUpdates(
    { table: 'performance_metrics', event: 'INSERT' },
    onUpdate
  );
};

export const useIntegrationUpdates = (onUpdate?: (payload: any) => void) => {
  return useRealTimeUpdates(
    { table: 'integrations', event: 'UPDATE' },
    onUpdate
  );
};

export const useReportingUpdates = (onUpdate?: (payload: any) => void) => {
  return useRealTimeUpdates(
    { table: 'automated_reporting_rules', event: '*' },
    onUpdate
  );
};
