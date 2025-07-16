import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConnectionState {
  isOnline: boolean;
  supabaseConnected: boolean;
  lastPingTime: number | null;
  latency: number | null;
  retryCount: number;
  maxRetries: number;
}

interface ConnectionMonitorOptions {
  pingInterval?: number;
  retryDelay?: number;
  maxRetries?: number;
  onConnectionChange?: (state: ConnectionState) => void;
}

export const useConnectionMonitor = (options: ConnectionMonitorOptions = {}) => {
  const {
    pingInterval = 30000, // 30 seconds
    retryDelay = 5000, // 5 seconds
    maxRetries = 3,
    onConnectionChange
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    supabaseConnected: false,
    lastPingTime: null,
    latency: null,
    retryCount: 0,
    maxRetries
  });

  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    setConnectionState(prev => {
      const newState = { ...prev, ...updates };
      onConnectionChange?.(newState);
      return newState;
    });
  }, [onConnectionChange]);

  const pingSupabase = useCallback(async (): Promise<{ success: boolean; latency: number | null }> => {
    try {
      const startTime = Date.now();
      
      // Simple ping to Supabase - check if we can connect
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found", which is still a successful connection
        throw error;
      }

      const latency = Date.now() - startTime;
      return { success: true, latency };
    } catch (error) {
      console.error('Supabase ping failed:', error);
      return { success: false, latency: null };
    }
  }, []);

  const performHealthCheck = useCallback(async () => {
    if (!connectionState.isOnline) {
      updateConnectionState({
        supabaseConnected: false,
        latency: null,
        lastPingTime: null
      });
      return;
    }

    const { success, latency } = await pingSupabase();
    
    if (success) {
      updateConnectionState({
        supabaseConnected: true,
        latency,
        lastPingTime: Date.now(),
        retryCount: 0
      });
    } else {
      updateConnectionState({
        supabaseConnected: false,
        latency: null,
        retryCount: connectionState.retryCount + 1
      });

      // Retry logic
      if (connectionState.retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, connectionState.retryCount); // Exponential backoff
        
        console.log(`Retrying connection in ${delay}ms (attempt ${connectionState.retryCount + 1}/${maxRetries})`);
        
        retryTimeoutRef.current = setTimeout(() => {
          performHealthCheck();
        }, delay);
      } else {
        toast.error('Connection to database lost. Please check your internet connection.');
      }
    }
  }, [connectionState.isOnline, connectionState.retryCount, maxRetries, retryDelay, pingSupabase, updateConnectionState]);

  const startMonitoring = useCallback(() => {
    performHealthCheck();
    
    pingTimeoutRef.current = setInterval(() => {
      performHealthCheck();
    }, pingInterval);
  }, [performHealthCheck, pingInterval]);

  const stopMonitoring = useCallback(() => {
    if (pingTimeoutRef.current) {
      clearInterval(pingTimeoutRef.current);
      pingTimeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const forceReconnect = useCallback(() => {
    updateConnectionState({ retryCount: 0 });
    stopMonitoring();
    startMonitoring();
  }, [updateConnectionState, stopMonitoring, startMonitoring]);

  // Monitor browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      updateConnectionState({ isOnline: true });
      toast.success('Internet connection restored');
      
      // Restart monitoring when coming back online
      startMonitoring();
    };

    const handleOffline = () => {
      updateConnectionState({ 
        isOnline: false, 
        supabaseConnected: false,
        latency: null 
      });
      toast.warning('Internet connection lost');
      
      // Stop monitoring when offline
      stopMonitoring();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateConnectionState, startMonitoring, stopMonitoring]);

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring();
    return stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  return {
    connectionState,
    isOnline: connectionState.isOnline,
    isConnected: connectionState.supabaseConnected,
    latency: connectionState.latency,
    retryCount: connectionState.retryCount,
    forceReconnect,
    performHealthCheck
  };
};