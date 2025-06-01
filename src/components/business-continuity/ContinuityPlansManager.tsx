
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { continuityPlansService, ContinuityPlanData } from "@/services/continuity-plans-service";
import ContinuityPlanForm from "./ContinuityPlanForm";

interface ContinuityPlansManagerProps {
  orgId: string;
}

const ContinuityPlansManager: React.FC<ContinuityPlansManagerProps> = ({ orgId }) => {
  const [plans, setPlans] = useState<ContinuityPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ContinuityPlanData | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await continuityPlansService.getContinuityPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: "Error",
        description: "Failed to load continuity plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: ContinuityPlanData) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this continuity plan?')) return;
    
    const success = await continuityPlansService.deleteContinuityPlan(planId);
    if (success) {
      toast({
        title: "Success",
        description: "Continuity plan deleted successfully"
      });
      loadPlans();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete continuity plan",
        variant: "destructive"
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPlan(undefined);
    loadPlans();
  };

  const exportToPDF = async (plan: ContinuityPlanData) => {
    // Implementation for PDF export would go here
    toast({
      title: "Info",
      description: "PDF export functionality coming soon"
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'draft': 'secondary',
      'archived': 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading continuity plans...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Continuity Plans</CardTitle>
            <CardDescription>
              Manage business continuity plans and recovery procedures
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No continuity plans</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first continuity plan.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Business Function</TableHead>
                <TableHead>RTO (hours)</TableHead>
                <TableHead>RPO (hours)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Tested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.plan_name}</TableCell>
                  <TableCell>
                    {plan.business_functions?.name}
                    <Badge variant="outline" className="ml-2">
                      {plan.business_functions?.criticality}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan.rto_hours}</TableCell>
                  <TableCell>{plan.rpo_hours || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>{plan.last_tested_date || 'Never'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportToPDF(plan)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {showForm && (
        <ContinuityPlanForm
          open={showForm}
          onOpenChange={setShowForm}
          plan={editingPlan}
          businessFunctions={[]} // This would be populated from business functions service
          orgId={orgId}
          onSuccess={handleFormClose}
        />
      )}
    </Card>
  );
};

export default ContinuityPlansManager;
