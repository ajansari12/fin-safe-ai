import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const EmergencyFallback: React.FC<EmergencyFallbackProps> = ({
  title = "System Temporarily Unavailable",
  message = "The system is running in emergency mode for stability. Some features may be limited.",
  onRetry,
  showRetry = true
}) => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-orange-700 mb-4">{message}</p>
        <div className="flex gap-3">
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              variant="outline"
              className="border-orange-300 text-orange-800 hover:bg-orange-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-orange-300 text-orange-800 hover:bg-orange-100"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};