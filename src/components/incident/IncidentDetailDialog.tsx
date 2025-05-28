
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, CheckCircle, Send, MessageSquare, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { 
  Incident, 
  updateIncident, 
  getIncidentResponses, 
  createIncidentResponse, 
  sendAlert,
  UpdateIncidentData 
} from "@/services/incident-service";
import { supabase } from "@/integrations/supabase/client";

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IncidentDetailDialog: React.FC<IncidentDetailDialogProps> = ({
  incident,
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register: registerUpdate, handleSubmit: handleUpdateSubmit, setValue: setUpdateValue, watch: watchUpdate, reset: resetUpdate } = useForm<UpdateIncidentData>();
  const { register: registerResponse, handleSubmit: handleResponseSubmit, reset: resetResponse } = useForm<{ content: string; type: string }>();
  const { register: registerAlert, handleSubmit: handleAlertSubmit, reset: resetAlert } = useForm<{ email: string; message: string }>();

  // Fetch incident responses
  const { data: responses } = useQuery({
    queryKey: ['incident-responses', incident?.id],
    queryFn: () => incident ? getIncidentResponses(incident.id) : Promise.resolve([]),
    enabled: !!incident?.id && open
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

  // Update incident mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateIncidentData }) => 
      updateIncident(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident-responses'] });
      toast({
        title: "Incident Updated",
        description: "The incident has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add response mutation
  const responseMutation = useMutation({
    mutationFn: createIncidentResponse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident-responses'] });
      resetResponse();
      toast({
        title: "Response Added",
        description: "Your response has been added to the incident.",
      });
    },
    onError: (error) => {
      console.error('Error adding response:', error);
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send alert mutation
  const alertMutation = useMutation({
    mutationFn: ({ incidentId, email, message }: { incidentId: string; email: string; message: string }) =>
      sendAlert(incidentId, email, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident-responses'] });
      resetAlert();
      toast({
        title: "Alert Sent",
        description: "Alert has been sent to the assignee.",
      });
    },
    onError: (error) => {
      console.error('Error sending alert:', error);
      toast({
        title: "Error",
        description: "Failed to send alert. Please try again.",
        variant: "destructive",
      });
    }
  });

  React.useEffect(() => {
    if (incident && open) {
      resetUpdate(incident);
      setUpdateValue('status', incident.status);
      setUpdateValue('severity', incident.severity);
      setUpdateValue('assigned_to', incident.assigned_to || '');
    }
  }, [incident, open, resetUpdate, setUpdateValue]);

  if (!incident) return null;

  const handleUpdate = async (data: UpdateIncidentData) => {
    const updates: UpdateIncidentData = {};
    
    // Only include changed fields
    Object.keys(data).forEach(key => {
      const typedKey = key as keyof UpdateIncidentData;
      if (data[typedKey] !== incident[typedKey]) {
        updates[typedKey] = data[typedKey] as any;
      }
    });

    if (Object.keys(updates).length > 0) {
      updateMutation.mutate({ id: incident.id, updates });
    }
  };

  const handleAddResponse = async (data: { content: string; type: string }) => {
    if (!data.content.trim()) return;

    responseMutation.mutate({
      incident_id: incident.id,
      response_type: data.type,
      response_content: data.content
    });
  };

  const handleSendAlert = async (data: { email: string; message: string }) => {
    if (!data.email || !data.message.trim()) return;

    alertMutation.mutate({
      incidentId: incident.id,
      email: data.email,
      message: data.message
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getResponseIcon = (type: string) => {
    switch (type) {
      case 'rca': return <FileText className="h-4 w-4" />;
      case 'alert': return <Send className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(incident.status)}
            {incident.title}
          </DialogTitle>
          <DialogDescription>
            Incident ID: {incident.id.slice(0, 8)} • Reported {format(new Date(incident.reported_at), 'MMM dd, yyyy HH:mm')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="rca">RCA</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
                <CardDescription>Update incident information and status</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateSubmit(handleUpdate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input {...registerUpdate('title')} />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={watchUpdate('status')} onValueChange={(value) => setUpdateValue('status', value)}>
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
                      <Select value={watchUpdate('severity')} onValueChange={(value) => setUpdateValue('severity', value)}>
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
                      <Select value={watchUpdate('assigned_to')} onValueChange={(value) => setUpdateValue('assigned_to', value)}>
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
                    <Textarea {...registerUpdate('description')} rows={4} />
                  </div>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Updating...' : 'Update Incident'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleResponseSubmit(handleAddResponse)} className="space-y-4">
                    <div>
                      <Label htmlFor="type">Response Type</Label>
                      <Select {...registerResponse('type', { value: 'update' })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="resolution">Resolution</SelectItem>
                          <SelectItem value="rca">Root Cause Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content">Response</Label>
                      <Textarea {...registerResponse('content', { required: true })} rows={3} />
                    </div>
                    <Button type="submit" disabled={responseMutation.isPending}>
                      {responseMutation.isPending ? 'Adding...' : 'Add Response'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {responses?.map((response) => (
                <Card key={response.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      {getResponseIcon(response.response_type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{response.response_type.replace('_', ' ').toUpperCase()}</Badge>
                          <span className="text-sm text-muted-foreground">
                            by {response.response_by_name} • {format(new Date(response.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm">{response.response_content}</p>
                        {response.alert_sent_to && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Alert sent to: {response.alert_sent_to}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rca">
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis</CardTitle>
                <CardDescription>Document the root cause analysis for this incident</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResponseSubmit((data) => handleAddResponse({ ...data, type: 'rca' }))} className="space-y-4">
                  <div>
                    <Label htmlFor="content">RCA Details</Label>
                    <Textarea 
                      {...registerResponse('content')} 
                      placeholder="Document the root cause, contributing factors, and analysis..."
                      rows={8}
                    />
                  </div>
                  <Button type="submit" disabled={responseMutation.isPending}>
                    {responseMutation.isPending ? 'Saving...' : 'Save RCA'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Send Alert</CardTitle>
                <CardDescription>Send alert notification to assignee or stakeholders</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAlertSubmit(handleSendAlert)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      {...registerAlert('email', { required: true })} 
                      type="email"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Alert Message</Label>
                    <Textarea 
                      {...registerAlert('message', { required: true })} 
                      placeholder="Enter alert message..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={alertMutation.isPending} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {alertMutation.isPending ? 'Sending...' : 'Send Alert'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDetailDialog;
