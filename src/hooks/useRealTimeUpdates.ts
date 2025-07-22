
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface RealTimeConfig {
  table?: string;
  channel?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  eventTypes?: string[];
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

    const channelName = config.channel || `realtime-${config.table}`;
    const channel = supabase.channel(channelName);

    if (config.table) {
      // Database table changes
      channel.on(
        'postgres_changes' as any,
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
      );
    }

    if (config.eventTypes) {
      // Custom broadcast events
      config.eventTypes.forEach(eventType => {
        channel.on('broadcast', { event: eventType }, (payload) => {
          console.log(`Real-time broadcast ${eventType}:`, payload);
          setLastUpdate(new Date());
          
          if (onUpdate) {
            onUpdate({ eventType, payload });
          }
        });
      });
    }

    channel.subscribe((status) => {
      console.log(`Real-time subscription status for ${channelName}:`, status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    return () => {
      const channelName = config.channel || `realtime-${config.table}`;
      console.log(`Unsubscribing from ${channelName} real-time updates`);
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [config.table, config.channel, config.event, config.eventTypes, config.filter, profile?.organization_id, onUpdate]);

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
