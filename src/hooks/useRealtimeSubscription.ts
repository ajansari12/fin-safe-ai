import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useErrorHandler } from './useErrorHandler';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription({
  table,
  event = '*',
  schema = 'public',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}-${Date.now()}`;
    
    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event,
            schema,
            table,
            ...(filter && { filter })
          },
          (payload: any) => {
            try {
              switch (payload.eventType) {
                case 'INSERT':
                  onInsert?.(payload);
                  break;
                case 'UPDATE':
                  onUpdate?.(payload);
                  break;
                case 'DELETE':
                  onDelete?.(payload);
                  break;
              }
            } catch (error) {
              handleError(error, `Realtime ${payload.eventType} handler for ${table}`);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`✅ Subscribed to realtime updates for ${table}`);
          } else if (status === 'CHANNEL_ERROR') {
            handleError(new Error('Realtime subscription failed'), `Realtime subscription for ${table}`);
          }
        });

      channelRef.current = channel;
    } catch (error) {
      handleError(error, `Setting up realtime subscription for ${table}`);
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log(`🔌 Unsubscribed from realtime updates for ${table}`);
      }
    };
  }, [table, event, schema, filter, enabled, onInsert, onUpdate, onDelete, handleError]);

  return {
    isConnected: !!channelRef.current
  };
}