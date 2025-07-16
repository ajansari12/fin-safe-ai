import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';

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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isHealthy, setIsHealthy] = useState(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const maxReconnectAttempts = 5;

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
            toast.info(`Control status updated: ${update.new.title || 'Unknown'}`);
          }
        }
        break;
        
      case 'kri_logs':
        if (onKRIUpdate) {
          onKRIUpdate(update);
          if (update.eventType === 'INSERT' && update.new.threshold_breached) {
            toast.warning(`KRI threshold breached: ${update.new.name || 'Unknown KRI'}`);
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
            toast.error(`New incident reported: ${update.new.title || 'Untitled'}`);
          }
        }
        break;
    }
  }, [onControlUpdate, onKRIUpdate, onBreachAlert, onIncidentUpdate]);

  const connectToRealtime = useCallback(() => {
    if (!profile?.organization_id) {
      return;
    }

    setConnectionStatus('connecting');
    
    // Clean up existing connection
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create a new channel with connection recovery
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
        console.log('Real-time connection status:', status);
        
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          setReconnectAttempts(0);
          setIsHealthy(true);
          console.log('✅ Real-time metrics connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
          setIsHealthy(false);
          console.error('❌ Real-time metrics connection failed');
          
          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            
            setConnectionStatus('reconnecting');
            setReconnectAttempts(prev => prev + 1);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connectToRealtime();
            }, delay);
          } else {
            console.error('Max reconnection attempts reached');
            toast.error('Real-time connection failed. Some features may be limited.');
          }
        } else if (status === 'CLOSED') {
          setConnectionStatus('disconnected');
          setIsHealthy(false);
          console.warn('Real-time connection closed');
        }
      });

    channelRef.current = channel;
  }, [profile?.organization_id, handleMetricUpdate, reconnectAttempts, maxReconnectAttempts]);

  // Force reconnection function
  const forceReconnect = useCallback(() => {
    setReconnectAttempts(0);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connectToRealtime();
  }, [connectToRealtime]);

  useEffect(() => {
    if (!enabled || !profile?.organization_id) {
      return;
    }

    connectToRealtime();

    // Health check interval
    const healthCheckInterval = setInterval(() => {
      if (connectionStatus === 'connected') {
        // Send a ping to check if connection is still alive
        const timeSinceLastUpdate = lastUpdate ? Date.now() - lastUpdate.getTime() : Infinity;
        
        // If no updates for more than 5 minutes, consider connection stale
        if (timeSinceLastUpdate > 300000) {
          console.warn('Real-time connection appears stale, attempting reconnection');
          forceReconnect();
        }
      }
    }, 60000); // Check every minute

    return () => {
      setConnectionStatus('disconnected');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(healthCheckInterval);
    };
  }, [enabled, profile?.organization_id, connectToRealtime, connectionStatus, lastUpdate, forceReconnect]);

  return {
    connectionStatus,
    lastUpdate,
    isConnected: connectionStatus === 'connected',
    isHealthy,
    reconnectAttempts,
    forceReconnect
  };
};