import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'slow' | 'fast' | 'unknown';
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown';
      
      if (connection) {
        // Determine connection speed based on effective type
        const effectiveType = connection.effectiveType;
        connectionType = ['slow-2g', '2g', '3g'].includes(effectiveType) ? 'slow' : 'fast';
        
        setNetworkStatus({
          isOnline: navigator.onLine,
          connectionType,
          effectiveType: effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      } else {
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: navigator.onLine
        }));
      }
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Initial check
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};