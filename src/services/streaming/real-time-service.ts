
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface StreamSubscription {
  id: string;
  table: string;
  callback: (payload: any) => void;
  channel?: RealtimeChannel;
}

class RealTimeService {
  private subscriptions: Map<string, StreamSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Subscribe to real-time updates for a specific table
   */
  subscribe(config: {
    id: string;
    table: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
    callback: (payload: any) => void;
  }) {
    const { id, table, event = '*', schema = 'public', callback } = config;

    // Remove existing subscription if it exists
    this.unsubscribe(id);

    const channel = supabase
      .channel(`realtime-${id}`)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table
        },
        (payload) => {
          console.log(`Real-time update for ${table}:`, payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription ${id} status:`, status);
        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts = 0;
        } else if (status === 'CHANNEL_ERROR') {
          this.handleReconnection(id);
        }
      });

    const subscription: StreamSubscription = {
      id,
      table,
      callback,
      channel
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(id: string) {
    const subscription = this.subscriptions.get(id);
    if (subscription?.channel) {
      supabase.removeChannel(subscription.channel);
      this.subscriptions.delete(id);
    }
  }

  /**
   * Subscribe to multiple tables for performance metrics
   */
  subscribeToPerformanceMetrics(callback: (data: any) => void) {
    const tables = ['performance_metrics', 'alerts', 'kri_logs'];
    
    tables.forEach(table => {
      this.subscribe({
        id: `performance-${table}`,
        table,
        callback: (payload) => {
          callback({
            table,
            event: payload.eventType,
            data: payload.new || payload.old,
            timestamp: new Date()
          });
        }
      });
    });
  }

  /**
   * Subscribe to KRI updates for real-time dashboard
   */
  subscribeToKRIUpdates(callback: (data: any) => void) {
    return this.subscribe({
      id: 'kri-updates',
      table: 'kri_logs',
      event: 'INSERT',
      callback: (payload) => {
        callback({
          type: 'kri_update',
          data: payload.new,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Subscribe to alert updates
   */
  subscribeToAlerts(callback: (data: any) => void) {
    return this.subscribe({
      id: 'alert-updates',
      table: 'alerts',
      callback: (payload) => {
        callback({
          type: 'alert',
          event: payload.eventType,
          data: payload.new || payload.old,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnection(subscriptionId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${subscriptionId}`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

    setTimeout(() => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        console.log(`Attempting to reconnect ${subscriptionId}...`);
        this.subscribe({
          id: subscription.id,
          table: subscription.table,
          callback: subscription.callback
        });
      }
    }, delay);
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.subscriptions.size > 0,
      subscriptions: Array.from(this.subscriptions.keys()),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach((_, id) => {
      this.unsubscribe(id);
    });
    this.subscriptions.clear();
  }
}

export const realTimeService = new RealTimeService();
