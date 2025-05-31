
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { enhancedKRIService, KRIBreachNotification } from "@/services/kri/enhanced-kri-service";
import { useToast } from "@/hooks/use-toast";

const KRIBreachNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<KRIBreachNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await enhancedKRIService.getKRIBreachNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading breach notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load breach notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (notificationId: string) => {
    try {
      await enhancedKRIService.acknowledgeBreachNotification(notificationId);
      toast({
        title: "Success",
        description: "Breach notification acknowledged",
      });
      loadNotifications();
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge notification",
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (breachType: string) => {
    switch (breachType) {
      case 'critical':
        return 'destructive';
      case 'breach':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getIcon = (breachType: string) => {
    switch (breachType) {
      case 'critical':
      case 'breach':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRI Breach Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>KRI Breach Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">No breach notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getIcon(notification.breach_type)}
                    <div>
                      <p className="font-medium">KRI Threshold Breach</p>
                      <p className="text-sm text-muted-foreground">
                        Actual: {notification.actual_value} | Threshold: {notification.threshold_value}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(notification.breach_type)}>
                    {notification.breach_type.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Variance: {notification.variance_percentage.toFixed(1)}%
                    <span className="ml-2">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {!notification.acknowledged_at ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(notification.id)}
                    >
                      Acknowledge
                    </Button>
                  ) : (
                    <Badge variant="default">
                      Acknowledged
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KRIBreachNotifications;
