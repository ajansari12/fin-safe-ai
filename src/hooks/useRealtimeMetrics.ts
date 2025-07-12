import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface MetricUpdate {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
}

interface RealtimeMetricsOptions {
  onControlUpdate?: (data: any) => void;
  onKRIUpdate?: (data: any) => void;
  onBreachAlert?: (data: any) => void;
  onIncidentUpdate?: (data: any) => void;
  enabled?: boolean;
}

export const useRealtimeMetrics = (options: RealtimeMetricsOptions = {}) => {
  const { profile } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const {
    onControlUpdate,
    onKRIUpdate,
    onBreachAlert,
    onIncidentUpdate,
    enabled = true
  } = options;

  const handleMetricUpdate = useCallback((update: MetricUpdate) => {
    setLastUpdate(new Date());
    
    switch (update.table) {
      case 'controls':
        if (onControlUpdate) {
          onControlUpdate(update);
          if (update.eventType === 'UPDATE' && update.new.status !== update.old?.status) {
            toast.info(`Control status updated: ${update.new.control_name || 'Unknown'}`);
          }
        }
        break;
        
      case 'kri_logs':
        if (onKRIUpdate) {
          onKRIUpdate(update);
          if (update.eventType === 'INSERT' && update.new.threshold_breached) {
            toast.warning(`KRI threshold breached: ${update.new.kri_name || 'Unknown KRI'}`);
          }
        }
        break;
        
      case 'appetite_breach_logs':
        if (onBreachAlert) {
          onBreachAlert(update);
          if (update.eventType === 'INSERT') {
            const severity = update.new.breach_severity || 'medium';
            toast.error(`Risk appetite breach detected (${severity})`, {
              duration: 8000,
              action: {
                label: 'View Details',
                onClick: () => {
                  // Could navigate to breach details
                  console.log('Navigate to breach details:', update.new.id);
                }
              }
            });
          }
        }
        break;
        
      case 'incident_logs':
        if (onIncidentUpdate) {
          onIncidentUpdate(update);
          if (update.eventType === 'INSERT') {
            toast.error(`New incident reported: ${update.new.incident_title || 'Untitled'}`);
          }
        }
        break;
    }
  }, [onControlUpdate, onKRIUpdate, onBreachAlert, onIncidentUpdate]);

  useEffect(() => {
    if (!enabled || !profile?.organization_id) {
      return;
    }

    setConnectionStatus('connecting');

    // Create a single channel for all organization updates
    const channel = supabase
      .channel(`org-metrics-${profile.organization_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'controls',
          filter: `org_id=eq.${profile.organization_id}`
        },
        (payload) => {
          handleMetricUpdate({
            table: 'controls',
            eventType: payload.eventType as any,
            new: payload.new,
            old: payload.old
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kri_logs',
          filter: `org_id=eq.${profile.organization_id}`
        },
        (payload) => {
          handleMetricUpdate({
            table: 'kri_logs',
            eventType: payload.eventType as any,
            new: payload.new,
            old: payload.old
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appetite_breach_logs',
          filter: `org_id=eq.${profile.organization_id}`
        },
        (payload) => {
          handleMetricUpdate({
            table: 'appetite_breach_logs',
            eventType: payload.eventType as any,
            new: payload.new,
            old: payload.old
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incident_logs',
          filter: `org_id=eq.${profile.organization_id}`
        },
        (payload) => {
          handleMetricUpdate({
            table: 'incident_logs',
            eventType: payload.eventType as any,
            new: payload.new,
            old: payload.old
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          console.log('✅ Real-time metrics connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
          console.error('❌ Real-time metrics connection failed');
        }
      });

    return () => {
      setConnectionStatus('disconnected');
      supabase.removeChannel(channel);
    };
  }, [enabled, profile?.organization_id, handleMetricUpdate]);

  return {
    connectionStatus,
    lastUpdate,
    isConnected: connectionStatus === 'connected'
  };
};