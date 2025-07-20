import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  User,
  FileText,
  Calendar,
  Zap
} from 'lucide-react';
import { useKRI, type KRIBreach, type KRI } from '@/hooks/useKRI';

interface KRIBreachManagerProps {
  breaches: KRIBreach[];
  kris: KRI[];
}

export const KRIBreachManager: React.FC<KRIBreachManagerProps> = ({ breaches, kris }) => {
  const { updateBreachStatus } = useKRI();
  const [selectedBreach, setSelectedBreach] = useState<KRIBreach | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<{
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    root_cause?: string;
    impact_assessment?: string;
    assigned_to?: string;
  }>({
    status: 'open'
  });

  const getBreachColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'investigating': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleUpdateBreach = (breach: KRIBreach) => {
    setSelectedBreach(breach);
    setStatusUpdate({
      status: breach.status,
      root_cause: breach.root_cause || '',
      impact_assessment: breach.impact_assessment || '',
      assigned_to: breach.assigned_to || ''
    });
    setUpdateDialogOpen(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedBreach) return;

    try {
      await updateBreachStatus(
        selectedBreach.id,
        statusUpdate.status,
        {
          root_cause: statusUpdate.root_cause,
          impact_assessment: statusUpdate.impact_assessment,
          assigned_to: statusUpdate.assigned_to
        }
      );
      setUpdateDialogOpen(false);
      setSelectedBreach(null);
    } catch (error) {
      console.error('Error updating breach:', error);
    }
  };

  const getKRIName = (kriId: string) => {
    const kri = kris.find(k => k.id === kriId);
    return kri?.name || 'Unknown KRI';
  };

  const openBreaches = breaches.filter(b => b.status === 'open');
  const investigatingBreaches = breaches.filter(b => b.status === 'investigating');
  const resolvedBreaches = breaches.filter(b => ['resolved', 'closed'].includes(b.status));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Open Breaches</span>
            </div>
            <p className="text-2xl font-bold mt-1">{openBreaches.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Investigating</span>
            </div>
            <p className="text-2xl font-bold mt-1">{investigatingBreaches.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Resolved</span>
            </div>
            <p className="text-2xl font-bold mt-1">{resolvedBreaches.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Total Breaches</span>
            </div>
            <p className="text-2xl font-bold mt-1">{breaches.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Breach List */}
      <Card>
        <CardHeader>
          <CardTitle>All Breaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breaches.map((breach) => (
              <div key={breach.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{getKRIName(breach.kri_id)}</h4>
                      <Badge className={getBreachColor(breach.breach_level)}>
                        {breach.breach_level}
                      </Badge>
                      <Badge className={getStatusColor(breach.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(breach.status)}
                          {breach.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="font-medium">Breach Value:</span>
                        <p className="text-muted-foreground">{breach.breach_value}</p>
                      </div>
                      <div>
                        <span className="font-medium">Threshold:</span>
                        <p className="text-muted-foreground">{breach.threshold_value}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p className="text-muted-foreground">
                          {new Date(breach.breach_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {breach.root_cause && (
                      <div className="mt-3 p-2 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-3 w-3" />
                          <span className="text-xs font-medium">Root Cause:</span>
                        </div>
                        <p className="text-sm">{breach.root_cause}</p>
                      </div>
                    )}

                    {breach.impact_assessment && (
                      <div className="mt-2 p-2 bg-muted rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-xs font-medium">Impact Assessment:</span>
                        </div>
                        <p className="text-sm">{breach.impact_assessment}</p>
                      </div>
                    )}

                    {breach.assigned_to && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <User className="h-3 w-3" />
                        <span className="font-medium">Assigned to:</span>
                        <span className="text-muted-foreground">{breach.assigned_to}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateBreach(breach)}
                    >
                      Update
                    </Button>
                    {breach.resolved_date && (
                      <div className="text-center">
                        <Calendar className="h-3 w-3 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">
                          Resolved: {new Date(breach.resolved_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {breaches.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No breaches recorded</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Breach Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Breach Status</DialogTitle>
            <DialogDescription>
              Update the status and details for the KRI breach
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={statusUpdate.status}
                  onValueChange={(value: any) => setStatusUpdate(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assigned To</Label>
                <Input
                  placeholder="Person responsible"
                  value={statusUpdate.assigned_to}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, assigned_to: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Root Cause</Label>
              <Textarea
                placeholder="Describe the root cause of the breach"
                value={statusUpdate.root_cause}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, root_cause: e.target.value }))}
              />
            </div>

            <div>
              <Label>Impact Assessment</Label>
              <Textarea
                placeholder="Assess the impact and any consequences"
                value={statusUpdate.impact_assessment}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, impact_assessment: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitUpdate}>
                Update Breach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};