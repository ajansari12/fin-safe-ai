
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { businessContinuityService, ContinuityPlan } from "@/services/business-continuity-service";

interface ContinuityPlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: ContinuityPlan;
  businessFunctions: Array<{ id: string; name: string; criticality: string }>;
  orgId: string;
  onSuccess: () => void;
}

interface FormData {
  plan_name: string;
  business_function_id: string;
  plan_description: string;
  rto_hours: number;
  rpo_hours: number;
  fallback_steps: string;
  status: 'draft' | 'active' | 'archived';
  next_test_date: string;
}

const ContinuityPlanForm: React.FC<ContinuityPlanFormProps> = ({
  open,
  onOpenChange,
  plan,
  businessFunctions,
  orgId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      plan_name: plan?.plan_name || '',
      business_function_id: plan?.business_function_id || '',
      plan_description: plan?.plan_description || '',
      rto_hours: plan?.rto_hours || 4,
      rpo_hours: plan?.rpo_hours || 1,
      fallback_steps: plan?.fallback_steps || '',
      status: plan?.status || 'draft',
      next_test_date: plan?.next_test_date || ''
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      let planData: any = {
        ...data,
        org_id: orgId
      };

      let savedPlan: ContinuityPlan;

      if (plan) {
        savedPlan = await businessContinuityService.updateContinuityPlan(plan.id, planData);
      } else {
        savedPlan = await businessContinuityService.createContinuityPlan(planData);
      }

      // Upload document if provided
      if (uploadedFile) {
        const filePath = await businessContinuityService.uploadPlanDocument(uploadedFile, savedPlan.id);
        await businessContinuityService.updateContinuityPlan(savedPlan.id, {
          plan_document_path: filePath,
          plan_document_name: uploadedFile.name,
          file_size: uploadedFile.size,
          mime_type: uploadedFile.type
        });
      }

      toast({
        title: "Success",
        description: `Continuity plan ${plan ? 'updated' : 'created'} successfully.`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving continuity plan:', error);
      toast({
        title: "Error",
        description: "Failed to save continuity plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit' : 'Create'} Continuity Plan</DialogTitle>
          <DialogDescription>
            {plan ? 'Update the' : 'Create a new'} business continuity plan with RTO, fallback steps, and recovery procedures.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plan_name"
              rules={{ required: "Plan name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plan name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_function_id"
              rules={{ required: "Business function is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Function</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business function" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {businessFunctions.map((func) => (
                        <SelectItem key={func.id} value={func.id}>
                          {func.name} ({func.criticality})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plan_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the continuity plan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rto_hours"
                rules={{ required: "RTO is required", min: { value: 0, message: "RTO must be positive" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Time Objective (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rpo_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Point Objective (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fallback_steps"
              rules={{ required: "Fallback steps are required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fallback Steps</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List the fallback steps and procedures..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="next_test_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Test Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <Label>Plan Document (Optional)</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (plan ? 'Update' : 'Create')} Plan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContinuityPlanForm;
