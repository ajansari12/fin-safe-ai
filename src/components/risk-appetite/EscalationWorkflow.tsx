
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { appetiteBreachesService, type AppetiteBreach } from '@/services/risk-appetite';
import { toast } from '@/hooks/use-toast';

const EscalationWorkflow: React.FC = () => {
  const [breaches, setBreaches] = useState<AppetiteBreach[]>([]);
  const [selectedBreach, setSelectedBreach] = useState<AppetiteBreach | null>(null);
  const [escalationNotes, setEscalationNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);

  useEffect(() => {
    loadBreaches();
  }, []);

  const loadBreaches = async () => {
    setIsLoading(true);
    try {
      const data = await appetiteBreachesService.getAppetiteBreaches('open');
      setBreaches(data);
    } catch (error) {
      console.error('Error loading breaches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async (breach: AppetiteBreach) => {
    setIsEscalating(true);
    try {
      await appetiteBreachesService.escalateBreach(
        breach.id,
        breach.escalation_level + 1
      );
      
      toast({
        title: "Breach Escalated",
        description: `Escalated to level ${breach.escalation_level + 1}`,
      });
      
      loadBreaches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to escalate breach",
        variant: "destructive",
      });
    } finally {
      setIsEscalating(false);
    }
  };

  const handleResolve = async (breach: AppetiteBreach) => {
    try {
      await appetiteBreachesService.updateBreachStatus(
        breach.id,
        'resolved',
        escalationNotes
      );
      
      toast({
        title: "Breach Resolved",
        description: "Breach has been marked as resolved",
      });
      
      setSelectedBreach(null);
      setEscalationNotes('');
      loadBreaches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve breach",
        variant: "destructive",
      });
    }
  };

  const handleAcknowledge = async (breach: AppetiteBreach) => {
    try {
      await appetiteBreachesService.updateBreachStatus(breach.id, 'acknowledged');
      
      toast({
        title: "Breach Acknowledged",
        description: "Breach has been acknowledged",
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'breach': return 'secondary';
      case 'warning': return 'outline';
      default: return 'outline';
    }
  };

  const getEscalationLevel = (level: number) => {
    switch (level) {
      case 0: return 'Initial';
      case 1: return 'Management';
      case 2: return 'Senior Management';
      case 3: return 'Board Level';
      default: return `Level ${level}`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Escalation Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Escalation Workflow
            {breaches.length > 0 && (
              <Badge variant="destructive">{breaches.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {breaches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              No active breaches requiring escalation
            </div>
          ) : (
            <div className="space-y-4">
              {breaches.map((breach) => (
                <div key={breach.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {breach.risk_category?.name || 'Unknown Category'}
                        </h4>
                        <Badge variant={getSeverityColor(breach.breach_severity)}>
                          {breach.breach_severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {getEscalationLevel(breach.escalation_level)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Variance: {breach.variance_percentage?.toFixed(1)}% 
                          (Actual: {breach.actual_value}, Appetite: {breach.appetite_value})
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Breached: {new Date(breach.breach_date).toLocaleDateString()}
                        </p>
                        {breach.escalated_at && (
                          <p>
                            Last escalated: {new Date(breach.escalated_at).toLocaleDateString()}
                            {breach.escalated_to_name && ` to ${breach.escalated_to_name}`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {breach.resolution_status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(breach)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      
                      {breach.escalation_level < 3 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEscalate(breach)}
                          disabled={isEscalating}
                        >
                          <ArrowUp className="h-3 w-3 mr-1" />
                          Escalate
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => setSelectedBreach(breach)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                  
                  {breach.business_impact && (
                    <div className="text-sm bg-muted p-2 rounded">
                      <strong>Business Impact:</strong> {breach.business_impact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Dialog */}
      <Dialog open={!!selectedBreach} onOpenChange={() => setSelectedBreach(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Breach</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Resolving breach for: {selectedBreach?.risk_category?.name}
              </p>
              <p className="text-sm">
                Variance: {selectedBreach?.variance_percentage?.toFixed(1)}%
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                value={escalationNotes}
                onChange={(e) => setEscalationNotes(e.target.value)}
                placeholder="Describe the resolution actions taken..."
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedBreach(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedBreach && handleResolve(selectedBreach)}
              >
                Resolve Breach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EscalationWorkflow;
