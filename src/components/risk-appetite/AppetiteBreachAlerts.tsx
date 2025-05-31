
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAppetiteBreachLogs, updateBreachLog, escalateBreach, AppetiteBreachLog } from "@/services/appetite-breach-service";
import { toast } from "@/hooks/use-toast";
import BreachAlertsTable from "./breach-alerts/BreachAlertsTable";
import EmptyBreachState from "./breach-alerts/EmptyBreachState";
import LoadingBreachState from "./breach-alerts/LoadingBreachState";

const AppetiteBreachAlerts: React.FC = () => {
  const [breaches, setBreaches] = useState<AppetiteBreachLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBreaches();
  }, []);

  const loadBreaches = async () => {
    try {
      setIsLoading(true);
      const data = await getAppetiteBreachLogs();
      setBreaches(data);
    } catch (error) {
      console.error('Error loading breaches:', error);
      toast({
        title: "Error",
        description: "Failed to load appetite breaches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async (breachId: string, currentLevel: number) => {
    try {
      await escalateBreach(breachId, currentLevel + 1);
      toast({
        title: "Success",
        description: "Breach escalated successfully",
      });
      loadBreaches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to escalate breach",
        variant: "destructive",
      });
    }
  };

  const handleResolve = async (breach: AppetiteBreachLog) => {
    try {
      await updateBreachLog(breach.id, {
        resolution_status: 'resolved',
        resolution_date: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Breach resolved successfully",
      });
      loadBreaches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve breach",
        variant: "destructive",
      });
    }
  };

  const handleAcknowledge = async (breachId: string) => {
    try {
      await updateBreachLog(breachId, {
        resolution_status: 'acknowledged'
      });
      toast({
        title: "Success",
        description: "Breach acknowledged",
      });
      loadBreaches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge breach",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appetite Breach Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingBreachState />
        </CardContent>
      </Card>
    );
  }

  const openBreaches = breaches.filter(b => b.resolution_status !== 'resolved');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Appetite Breach Alerts
          {openBreaches.length > 0 && (
            <Badge variant="destructive">{openBreaches.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breaches.length === 0 ? (
          <EmptyBreachState />
        ) : (
          <BreachAlertsTable
            breaches={breaches}
            onEscalate={handleEscalate}
            onResolve={handleResolve}
            onAcknowledge={handleAcknowledge}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AppetiteBreachAlerts;
