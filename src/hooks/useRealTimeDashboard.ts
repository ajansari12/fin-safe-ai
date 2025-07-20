
import { useState, useEffect, useCallback } from 'react';
import { realTimeService } from '@/services/streaming/real-time-service';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface DashboardMetrics {
  kris: any[];
  alerts: any[];
  performance: any[];
  lastUpdate: Date;
}

export const useRealTimeDashboard = () => {
  const { userContext } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    kris: [],
    alerts: [],
    performance: [],
    lastUpdate: new Date()
  });
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

  const handleKRIUpdate = useCallback((data: any) => {
    setMetrics(prev => ({
      ...prev,
      kris: [data.data, ...prev.kris.slice(0, 9)], // Keep last 10 updates
      lastUpdate: new Date()
    }));
  }, []);

  const handleAlertUpdate = useCallback((data: any) => {
    setMetrics(prev => ({
      ...prev,
      alerts: [data.data, ...prev.alerts.slice(0, 9)],
      lastUpdate: new Date()
    }));
  }, []);

  const handlePerformanceUpdate = useCallback((data: any) => {
    setMetrics(prev => ({
      ...prev,
      performance: [data, ...prev.performance.slice(0, 19)], // Keep last 20 updates
      lastUpdate: new Date()
    }));
  }, []);

  useEffect(() => {
    if (!userContext?.organizationId) return;

    // Subscribe to real-time updates
    const kriSubscription = realTimeService.subscribeToKRIUpdates(handleKRIUpdate);
    const alertSubscription = realTimeService.subscribeToAlerts(handleAlertUpdate);
    realTimeService.subscribeToPerformanceMetrics(handlePerformanceUpdate);

    // Monitor connection status
    const statusInterval = setInterval(() => {
      const status = realTimeService.getConnectionStatus();
      setIsConnected(status.connected);
      setConnectionStatus(status.connected ? 'connected' : 'disconnected');
    }, 1000);

    return () => {
      realTimeService.cleanup();
      clearInterval(statusInterval);
    };
  }, [userContext?.organizationId, handleKRIUpdate, handleAlertUpdate, handlePerformanceUpdate]);

  const refreshMetrics = useCallback(() => {
    // Force refresh of metrics
    setMetrics(prev => ({
      ...prev,
      lastUpdate: new Date()
    }));
  }, []);

  return {
    metrics,
    isConnected,
    connectionStatus,
    refreshMetrics,
    lastUpdate: metrics.lastUpdate
  };
};
