
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface IncidentAlertsTabProps {
  onSendAlert: (email: string, message: string) => void;
  isSubmitting: boolean;
}

const IncidentAlertsTab: React.FC<IncidentAlertsTabProps> = ({
  onSendAlert,
  isSubmitting,
}) => {
  const { register, handleSubmit, reset } = useForm<{ email: string; message: string }>();

  const handleAlertSubmit = (data: { email: string; message: string }) => {
    if (!data.email || !data.message.trim()) return;
    onSendAlert(data.email, data.message);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Alert</CardTitle>
        <CardDescription>Send alert notification to assignee or stakeholders</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleAlertSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input 
              {...register('email', { required: true })} 
              type="email"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label htmlFor="message">Alert Message</Label>
            <Textarea 
              {...register('message', { required: true })} 
              placeholder="Enter alert message..."
              rows={4}
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Alert'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentAlertsTab;
