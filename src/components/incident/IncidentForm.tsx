
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateIncidentData } from "@/services/incident-service";

interface IncidentFormProps {
  onSubmit: (data: CreateIncidentData) => Promise<void>;
  isSubmitting?: boolean;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateIncidentData>();
  const { toast } = useToast();
  
  const watchedSeverity = watch('severity');
  const watchedCategory = watch('category');
  const watchedBusinessFunctionId = watch('business_function_id');

  // Fetch business functions for the dropdown
  const { data: businessFunctions } = useQuery({
    queryKey: ['business-functions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_functions')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleFormSubmit = async (data: CreateIncidentData) => {
    try {
      await onSubmit(data);
      reset();
      toast({
        title: "Incident Created",
        description: "The incident has been successfully logged.",
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to create incident. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log New Incident</CardTitle>
        <CardDescription>
          Report a new operational incident or disruption.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Brief description of the incident"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={watchedCategory} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system_failure">System Failure</SelectItem>
                  <SelectItem value="data_loss">Data Loss</SelectItem>
                  <SelectItem value="vendor_breach">Vendor Breach</SelectItem>
                  <SelectItem value="security_incident">Security Incident</SelectItem>
                  <SelectItem value="operational_disruption">Operational Disruption</SelectItem>
                  <SelectItem value="compliance_breach">Compliance Breach</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity">Severity *</Label>
              <Select value={watchedSeverity} onValueChange={(value) => setValue('severity', value)}>
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
              {errors.severity && (
                <p className="text-sm text-destructive mt-1">Severity is required</p>
              )}
            </div>

            <div>
              <Label htmlFor="impact_rating">Impact Rating (1-10)</Label>
              <Input
                id="impact_rating"
                type="number"
                min="1"
                max="10"
                {...register('impact_rating', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'Minimum rating is 1' },
                  max: { value: 10, message: 'Maximum rating is 10' }
                })}
                placeholder="Rate the business impact"
              />
              {errors.impact_rating && (
                <p className="text-sm text-destructive mt-1">{errors.impact_rating.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="business_function_id">Affected Business Function</Label>
              <Select value={watchedBusinessFunctionId} onValueChange={(value) => setValue('business_function_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business function" />
                </SelectTrigger>
                <SelectContent>
                  {businessFunctions?.map((func) => (
                    <SelectItem key={func.id} value={func.id}>
                      {func.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select value={watch('assigned_to')} onValueChange={(value) => setValue('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || 'Unknown User'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed description of the incident..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Log Incident'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentForm;
