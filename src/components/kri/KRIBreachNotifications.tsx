
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bell, X, Eye } from 'lucide-react';
import { useKRI } from '@/hooks/useKRI';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

export const KRIBreachNotifications: React.FC = () => {
  const { breaches, updateBreachStatus } = useKRI();
  const [dismissedBreaches, setDismissedBreaches] = useState<string[]>([]);

  // Listen for real-time breach notifications
  useRealtimeSubscription({
    table: 'kri_breaches',
    event: 'INSERT',
    onInsert: (payload) => {
      console.log('New KRI breach detected:', payload);
      // Optionally show toast notification
    },
  });

  const openBreaches = breaches.filter(breach => 
    breach.status === 'open' && !dismissedBreaches.includes(breach.id)
  );

  const handleDismissBreach = (breachId: string) => {
    setDismissedBreaches(prev => [...prev, breachId]);
  };

  const handleAcknowledgeBreach = async (breachId: string) => {
    try {
      await updateBreachStatus(breachId, 'investigating');
      setDismissedBreaches(prev => [...prev, breachId]);
    } catch (error) {
      console.error('Error acknowledging breach:', error);
    }
  };

  if (openBreaches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Active KRI Breaches ({openBreaches.length})</h3>
      </div>

      {openBreaches.map((breach) => (
        <Alert key={breach.id} className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">KRI Threshold Breach</span>
                <Badge 
                  variant="outline" 
                  className={
                    breach.breach_level === 'critical' 
                      ? 'border-red-500 text-red-700' 
                      : 'border-orange-500 text-orange-700'
                  }
                >
                  {breach.breach_level}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Value:</strong> {breach.breach_value} 
                  <span className="text-muted-foreground"> (Threshold: {breach.threshold_value})</span>
                </p>
                <p>
                  <strong>Date:</strong> {new Date(breach.breach_date).toLocaleDateString()}
                </p>
                {breach.root_cause && (
                  <p><strong>Root Cause:</strong> {breach.root_cause}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAcknowledgeBreach(breach.id)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                Acknowledge
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismissBreach(breach.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default KRIBreachNotifications;
