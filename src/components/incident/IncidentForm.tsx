
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { incidentSchema, IncidentFormData } from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface IncidentFormProps {
  onSubmit: (data: CreateIncidentData) => Promise<void>;
  isSubmitting?: boolean;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, isSubmitting }) => {
  const { toast } = useToast();
  
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: undefined,
      category: "",
      status: "open",
    },
  });

  const watchedSeverity = form.watch('severity');

  // Default SLA times based on severity
  React.useEffect(() => {
    if (watchedSeverity) {
      let responseTime: number;
      let resolutionTime: number;
      
      switch(watchedSeverity) {
        case 'critical':
          responseTime = 1;
          resolutionTime = 4;
          break;
        case 'high':
          responseTime = 4;
          resolutionTime = 24;
          break;
        case 'medium':
          responseTime = 24;
          resolutionTime = 72;
          break;
        case 'low':
        default:
          responseTime = 72;
          resolutionTime = 168;
          break;
      }
      
      if (!form.getValues('max_response_time_hours')) {
        form.setValue('max_response_time_hours', responseTime);
      }
      
      if (!form.getValues('max_resolution_time_hours')) {
        form.setValue('max_resolution_time_hours', resolutionTime);
      }
    }
  }, [watchedSeverity, form]);

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

  const handleFormSubmit = async (data: IncidentFormData) => {
    try {
      await onSubmit(data);
      form.reset();
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

  // Helper to show what level incident will be assigned to
  const assignmentLevel = React.useMemo(() => {
    if (!watchedSeverity) return null;
    
    switch(watchedSeverity) {
      case 'critical':
        return { level: 'executive', variant: 'destructive' as const };
      case 'high':
        return { level: 'manager', variant: 'default' as const };
      case 'medium': 
        return { level: 'manager', variant: 'default' as const };
      case 'low':
      default:
        return { level: 'analyst', variant: 'secondary' as const };
    }
  }, [watchedSeverity]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log New Incident</CardTitle>
        <CardDescription>
          Report a new operational incident or disruption.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incident Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of the incident"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    {assignmentLevel && (
                      <div className="flex items-center gap-2 mt-2">
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Will be assigned to: </span>
                        <Badge variant={assignmentLevel.variant}>
                          {assignmentLevel.level}
                        </Badge>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impact_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Rating (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="Rate the business impact"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_function_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affected Business Function</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business function" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessFunctions?.map((func) => (
                          <SelectItem key={func.id} value={func.id}>
                            {func.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name || 'Unknown User'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Separator className="my-4" />
                <h3 className="text-sm font-medium mb-2">SLA Configuration</h3>
              </div>

              <FormField
                control={form.control}
                name="max_response_time_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Response Time (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Maximum time to first response"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_resolution_time_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Resolution Time (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Maximum time to resolution"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the incident..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Log Incident'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default IncidentForm;
