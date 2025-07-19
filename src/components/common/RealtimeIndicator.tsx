import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, Clock } from 'lucide-react';

interface RealtimeIndicatorProps {
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  lastUpdate?: Date | null;
  className?: string;
}

const RealtimeIndicator = memo<RealtimeIndicatorProps>(({ 
  connectionStatus, 
  lastUpdate, 
  className = "" 
}) => {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          text: 'Live',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'connecting':
        return {
          icon: <Clock className="h-3 w-3 animate-spin" />,
          text: 'Connecting',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: 'Offline',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
    }
  };

  const config = getStatusConfig();
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={`${config.className} ${className} flex items-center gap-1`}
          >
            {config.icon}
            <span className="text-xs">{config.text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-sm font-medium">Real-time Status</p>
            <p className="text-xs text-muted-foreground">
              Status: {connectionStatus}
            </p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Last update: {formatLastUpdate(lastUpdate)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

RealtimeIndicator.displayName = 'RealtimeIndicator';

export default RealtimeIndicator;