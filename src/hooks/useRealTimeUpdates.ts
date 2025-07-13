import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeUpdateOptions {
  channel: string;
  eventTypes: string[];
  onUpdate?: (event: any) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error?: string;
  reconnectAttempts: number;
  lastConnected?: Date;
}

export const useRealTimeUpdates = (options: RealTimeUpdateOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    reconnectAttempts: 0
  });
  
  const [messages, setMessages] = useState<any[]>([]);
  const channelRef = useRef<any>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    setConnectionStatus(prev => ({ ...prev, connecting: true, error: undefined }));

    const channel = supabase.channel(options.channel);

    // Subscribe to specified event types
    options.eventTypes.forEach(eventType => {
      channel.on('broadcast', { event: eventType }, (payload) => {
        const message = {
          ...payload,
          timestamp: new Date(),
          eventType
        };
        
        setMessages(prev => [...prev, message]);
        options.onUpdate?.(message);
      });
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConnectionStatus(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          reconnectAttempts: 0,
          lastConnected: new Date()
        }));
      } else if (status === 'CHANNEL_ERROR') {
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: 'Connection failed'
        }));
        
        // Auto-reconnect with exponential backoff
        if (connectionStatus.reconnectAttempts < (options.maxReconnectAttempts || 5)) {
          const delay = Math.min(1000 * Math.pow(2, connectionStatus.reconnectAttempts), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionStatus(prev => ({
              ...prev,
              reconnectAttempts: prev.reconnectAttempts + 1
            }));
            connect();
          }, delay);
        }
      } else if (status === 'CLOSED') {
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          connecting: false
        }));
      }
    });

    channelRef.current = channel;
  }, [options, connectionStatus.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    setConnectionStatus({
      connected: false,
      connecting: false,
      reconnectAttempts: 0
    });
  }, []);

  const sendMessage = useCallback(async (eventType: string, payload: any) => {
    if (!channelRef.current || !connectionStatus.connected) {
      throw new Error('Not connected to real-time channel');
    }

    return channelRef.current.send({
      type: 'broadcast',
      event: eventType,
      payload
    });
  }, [connectionStatus.connected]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const getLastMessage = useCallback((eventType?: string) => {
    if (eventType) {
      const filtered = messages.filter(msg => msg.eventType === eventType);
      return filtered[filtered.length - 1];
    }
    return messages[messages.length - 1];
  }, [messages]);

  const getConnectionQuality = useCallback(() => {
    if (!connectionStatus.connected) return 'disconnected';
    if (connectionStatus.reconnectAttempts > 0) return 'poor';
    if (connectionStatus.lastConnected && 
        Date.now() - connectionStatus.lastConnected.getTime() < 5000) {
      return 'excellent';
    }
    return 'good';
  }, [connectionStatus]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [options.channel]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    connectionStatus,
    messages,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    getLastMessage,
    getConnectionQuality,
    isConnected: connectionStatus.connected,
    isConnecting: connectionStatus.connecting
  };
};