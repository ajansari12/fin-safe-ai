
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Incident, UpdateIncidentData } from "@/services/incident-service";
import { supabase } from "@/integrations/supabase/client";

interface IncidentDetailsTabProps {
  incident: Incident;
  onUpdate: (data: UpdateIncidentData) => void;
  isUpdating: boolean;
}

const IncidentDetailsTab: React.FC<IncidentDetailsTabProps> = ({
  incident,
  onUpdate,
  isUpdating,
}) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<UpdateIncidentData>();

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

  React.useEffect(() => {
    reset(incident);
    setValue('status', incident.status);
    setValue('severity', incident.severity);
    setValue('assigned_to', incident.assigned_to || '');
  }, [incident, reset, setValue]);

  const handleUpdateSubmit = (data: UpdateIncidentData) => {
    const updates: UpdateIncidentData = {};
    
    // Only include changed fields with proper type checking
    if (data.title !== incident.title) {
      updates.title = data.title;
    }
    if (data.description !== incident.description) {
      updates.description = data.description;
    }
    if (data.category !== incident.category) {
      updates.category = data.category;
    }
    if (data.severity !== incident.severity) {
      updates.severity = data.severity;
    }
    if (data.status !== incident.status) {
      updates.status = data.status;
    }
    if (data.impact_rating !== incident.impact_rating) {
      updates.impact_rating = data.impact_rating;
    }
    if (data.business_function_id !== incident.business_function_id) {
      updates.business_function_id = data.business_function_id;
    }
    if (data.assigned_to !== incident.assigned_to) {
      updates.assigned_to = data.assigned_to;
    }
    if (data.resolved_at !== incident.resolved_at) {
      updates.resolved_at = data.resolved_at;
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Details</CardTitle>
        <CardDescription>Update incident information and status</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input {...register('title')} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={watch('severity')} onValueChange={(value) => setValue('severity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Select value={watch('assigned_to')} onValueChange={(value) => setValue('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
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
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea {...register('description')} rows={4} />
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Incident'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentDetailsTab;
