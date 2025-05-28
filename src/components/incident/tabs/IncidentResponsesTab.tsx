
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Send } from "lucide-react";
import { format } from "date-fns";
import { IncidentResponse } from "@/services/incident-service";

interface IncidentResponsesTabProps {
  responses: IncidentResponse[] | undefined;
  onAddResponse: (data: { content: string; type: string }) => void;
  isSubmitting: boolean;
}

const IncidentResponsesTab: React.FC<IncidentResponsesTabProps> = ({
  responses,
  onAddResponse,
  isSubmitting,
}) => {
  const { register, handleSubmit, reset } = useForm<{ content: string; type: string }>();

  const handleAddResponseSubmit = (data: { content: string; type: string }) => {
    if (!data.content.trim()) return;
    onAddResponse(data);
    reset();
  };

  const getResponseIcon = (type: string) => {
    switch (type) {
      case 'rca': return <FileText className="h-4 w-4" />;
      case 'alert': return <Send className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Response</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleAddResponseSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="type">Response Type</Label>
              <Select {...register('type', { value: 'update' })}>
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
              <Textarea {...register('content', { required: true })} rows={3} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Response'}
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
  );
};

export default IncidentResponsesTab;
