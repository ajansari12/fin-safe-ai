import React from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const NetworkStatus: React.FC = () => {
  const { isOnline, connectionType, effectiveType } = useNetworkStatus();

  if (isOnline && connectionType !== 'slow') {
    return null; // Don't show anything for normal/fast connections
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-card border rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Slow Connection</p>
                <p className="text-xs text-muted-foreground">
                  {effectiveType} - Optimizing for better performance
                </p>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium">No Internet</p>
                <p className="text-xs text-muted-foreground">
                  You're offline. Some features may not work.
                </p>
              </div>
            </>
          )}
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;