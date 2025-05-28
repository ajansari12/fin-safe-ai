
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComplianceFindingsFormProps {
  orgId: string;
  auditUploadId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  finding_reference: string;
  finding_title: string;
  finding_description: string;
  severity: string;
  module_affected: string;
  regulator_comments: string;
  internal_response: string;
  corrective_actions: string;
  assigned_to_name: string;
  due_date: string;
}

const ComplianceFindingsForm: React.FC<ComplianceFindingsFormProps> = ({
  orgId,
  auditUploadId,
  onSuccess,
  onCancel
}) => {
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>();
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    try {
      const { auditService } = await import("@/services/audit-service");
      
      // Get current user for created_by fields
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      await auditService.createComplianceFinding({
        org_id: orgId,
        audit_upload_id: auditUploadId || null,
        finding_reference: data.finding_reference,
        finding_title: data.finding_title,
        finding_description: data.finding_description,
        severity: data.severity,
        module_affected: data.module_affected,
        regulator_comments: data.regulator_comments || null,
        internal_response: data.internal_response || null,
        corrective_actions: data.corrective_actions || null,
        assigned_to: null,
        assigned_to_name: data.assigned_to_name || null,
        due_date: data.due_date || null,
        status: 'open',
        created_by: user?.id || null,
        created_by_name: profile?.full_name || 'Unknown User'
      });

      toast({
        title: "Finding created successfully",
        description: "Compliance finding has been recorded and is ready for action."
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating finding:', error);
      toast({
        title: "Error creating finding",
        description: "There was an error creating the compliance finding. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Record Compliance Finding
        </CardTitle>
        <CardDescription>
          Document audit findings and track remediation efforts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="finding_reference">Finding Reference</Label>
              <Input
                {...register("finding_reference", { required: true })}
                placeholder="e.g., F-001, Finding 1.2.3"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select onValueChange={(value) => setValue("severity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="finding_title">Finding Title</Label>
            <Input
              {...register("finding_title", { required: true })}
              placeholder="Brief title of the finding"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="finding_description">Finding Description</Label>
            <Textarea
              {...register("finding_description", { required: true })}
              placeholder="Detailed description of the compliance finding..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="module_affected">Module Affected</Label>
            <Select onValueChange={(value) => setValue("module_affected", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select affected module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="incident">Incident Management</SelectItem>
                <SelectItem value="risk">Risk Management</SelectItem>
                <SelectItem value="third_party">Third Party Risk</SelectItem>
                <SelectItem value="business_continuity">Business Continuity</SelectItem>
                <SelectItem value="controls">Controls & KRIs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="regulator_comments">Regulator Comments</Label>
            <Textarea
              {...register("regulator_comments")}
              placeholder="Comments from the regulator or auditor..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="internal_response">Internal Response</Label>
            <Textarea
              {...register("internal_response")}
              placeholder="Internal response to the finding..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="corrective_actions">Corrective Actions</Label>
            <Textarea
              {...register("corrective_actions")}
              placeholder="Planned corrective actions..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assigned_to_name">Assigned To</Label>
              <Input
                {...register("assigned_to_name")}
                placeholder="Person responsible for remediation"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                {...register("due_date")}
                type="date"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Finding"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComplianceFindingsForm;
