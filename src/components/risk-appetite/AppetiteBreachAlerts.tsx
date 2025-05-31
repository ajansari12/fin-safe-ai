
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { getAppetiteBreachLogs, updateBreachLog, escalateBreach, AppetiteBreachLog } from "@/services/appetite-breach-service";
import { toast } from "@/hooks/use-toast";

const AppetiteBreachAlerts: React.FC = () => {
  const [breaches, setBreaches] = useState<AppetiteBreachLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBreach, setSelectedBreach] = useState<AppetiteBreachLog | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'breach':
        return 'bg-orange-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'acknowledged':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'breach':
        return <TrendingUp className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
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
        resolution_notes: resolutionNotes
      });
      toast({
        title: "Success",
        description: "Breach resolved successfully",
      });
      setSelectedBreach(null);
      setResolutionNotes("");
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
          <div className="text-center py-4">Loading breach alerts...</div>
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
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">No appetite breaches detected</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Escalation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breaches.map((breach) => (
                <TableRow key={breach.id}>
                  <TableCell>
                    {new Date(breach.breach_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {(breach as any).risk_categories?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(breach.breach_severity)}
                      <Badge className={getSeverityColor(breach.breach_severity)}>
                        {breach.breach_severity.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {breach.variance_percentage ? (
                      <span className="font-mono text-red-600">
                        +{breach.variance_percentage.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(breach.resolution_status)}>
                      {breach.resolution_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      Level {breach.escalation_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {breach.resolution_status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(breach.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      
                      {breach.resolution_status !== 'resolved' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEscalate(breach.id, breach.escalation_level)}
                          >
                            Escalate
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedBreach(breach)}
                              >
                                Resolve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Resolve Breach</DialogTitle>
                                <DialogDescription>
                                  Add resolution notes and mark this breach as resolved.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Resolution notes..."
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => selectedBreach && handleResolve(selectedBreach)}
                                  >
                                    Resolve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBreach(null);
                                      setResolutionNotes("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AppetiteBreachAlerts;
