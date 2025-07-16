import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConnectionStabilityConfig {
  maxReconnectAttempts: number;
  baseDelay: number;
  maxDelay: number;
  jitterRange: number;
  healthCheckInterval: number;
}

interface ConnectionState {
  isStable: boolean;
  reconnectAttempts: number;
  lastDisconnect: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unstable';
  latency: number;
}

const DEFAULT_CONFIG: ConnectionStabilityConfig = {
  maxReconnectAttempts: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  jitterRange: 0.3,
  healthCheckInterval: 15000
};

export const useConnectionStabilizer = (
  config: Partial<ConnectionStabilityConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<ConnectionState>({
    isStable: false,
    reconnectAttempts: 0,
    lastDisconnect: null,
    connectionQuality: 'poor',
    latency: 0
  });

  const [reconnectTimer, setReconnectTimer] = useState<NodeJS.Timeout | null>(null);
  const [healthCheckTimer, setHealthCheckTimer] = useState<NodeJS.Timeout | null>(null);

  // Calculate exponential backoff with jitter
  const calculateBackoffDelay = useCallback((attemptNumber: number) => {
    const exponentialDelay = Math.min(
      finalConfig.baseDelay * Math.pow(2, attemptNumber),
      finalConfig.maxDelay
    );
    
    const jitter = exponentialDelay * finalConfig.jitterRange * (Math.random() - 0.5);
    return Math.max(exponentialDelay + jitter, finalConfig.baseDelay);
  }, [finalConfig]);

  // Measure connection latency
  const measureLatency = useCallback(async () => {
    const start = performance.now();
    try {
      await supabase.from('profiles').select('count').limit(1).single();
      const latency = performance.now() - start;
      
      setState(prev => ({
        ...prev,
        latency,
        connectionQuality: 
          latency < 100 ? 'excellent' :
          latency < 300 ? 'good' :
          latency < 1000 ? 'poor' : 'unstable'
      }));
      
      return latency;
    } catch (error) {
      console.warn('Latency measurement failed:', error);
      return 5000; // Assume high latency on error
    }
  }, []);

  // Stabilized reconnection logic
  const attemptReconnection = useCallback(async () => {
    if (state.reconnectAttempts >= finalConfig.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      toast.error('Connection could not be restored. Please refresh the page.');
      return;
    }

    const delay = calculateBackoffDelay(state.reconnectAttempts);
    
    setState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));

    console.log(`Attempting reconnection ${state.reconnectAttempts + 1}/${finalConfig.maxReconnectAttempts} in ${delay}ms`);

    const timer = setTimeout(async () => {
      try {
        // Test connection with a simple query
        await measureLatency();
        
        // Reset state on successful reconnection
        setState(prev => ({
          ...prev,
          isStable: true,
          reconnectAttempts: 0,
          lastDisconnect: null
        }));
        
        toast.success('Connection restored successfully');
        console.log('Connection stabilized');
        
      } catch (error) {
        console.warn('Reconnection attempt failed:', error);
        attemptReconnection(); // Retry with increased backoff
      }
    }, delay);

    setReconnectTimer(timer);
  }, [state.reconnectAttempts, finalConfig, calculateBackoffDelay, measureLatency]);

  // Handle connection events
  const handleConnectionLoss = useCallback(() => {
    setState(prev => ({
      ...prev,
      isStable: false,
      lastDisconnect: new Date()
    }));

    // Clear any existing reconnection timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    // Start stabilized reconnection
    attemptReconnection();
  }, [reconnectTimer, attemptReconnection]);

  // Periodic health checks
  const startHealthMonitoring = useCallback(() => {
    const timer = setInterval(async () => {
      try {
        const latency = await measureLatency();
        
        // Update stability based on latency and recent disconnects
        const timeSinceLastDisconnect = state.lastDisconnect 
          ? Date.now() - state.lastDisconnect.getTime()
          : Infinity;
        
        const isCurrentlyStable = latency < 2000 && timeSinceLastDisconnect > 30000;
        
        setState(prev => ({
          ...prev,
          isStable: isCurrentlyStable
        }));
        
      } catch (error) {
        console.warn('Health check failed:', error);
        handleConnectionLoss();
      }
    }, finalConfig.healthCheckInterval);

    setHealthCheckTimer(timer);
  }, [finalConfig.healthCheckInterval, measureLatency, state.lastDisconnect, handleConnectionLoss]);

  // Initialize monitoring
  useEffect(() => {
    startHealthMonitoring();
    
    // Listen for Supabase realtime connection events
    const channel = supabase.channel('connection-stabilizer');
    
    channel.on('system', { event: 'close' }, () => {
      console.log('Realtime connection closed - stabilizing...');
      handleConnectionLoss();
    });
    
    channel.on('system', { event: 'open' }, () => {
      console.log('Realtime connection opened');
      setState(prev => ({ ...prev, isStable: true, reconnectAttempts: 0 }));
    });
    
    channel.subscribe();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (healthCheckTimer) clearInterval(healthCheckTimer);
      channel.unsubscribe();
    };
  }, [startHealthMonitoring, handleConnectionLoss, reconnectTimer, healthCheckTimer]);

  const forceReconnect = useCallback(() => {
    setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    handleConnectionLoss();
  }, [handleConnectionLoss]);

  return {
    ...state,
    forceReconnect,
    measureLatency,
    isReconnecting: state.reconnectAttempts > 0 && !state.isStable
  };
};