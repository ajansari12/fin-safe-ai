
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Database,
  AlertCircle
} from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingSyncCount, syncOfflineData } = useOfflineStorage();

  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="bg-white border rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-3">
          {!isOnline ? (
            <>
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-700">Offline</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Limited functionality
              </Badge>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
              {pendingSyncCount > 0 && (
                <>
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <Database className="h-3 w-3" />
                    <span>{pendingSyncCount} pending</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={syncOfflineData}
                    className="h-7 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {!isOnline && (
          <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              You can continue working. Data will sync when connection is restored.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
