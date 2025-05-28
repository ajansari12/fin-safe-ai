
import React from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IncidentRCATabProps {
  onSaveRCA: (content: string) => void;
  isSubmitting: boolean;
}

const IncidentRCATab: React.FC<IncidentRCATabProps> = ({
  onSaveRCA,
  isSubmitting,
}) => {
  const { register, handleSubmit } = useForm<{ content: string }>();

  const handleRCASubmit = (data: { content: string }) => {
    if (!data.content.trim()) return;
    onSaveRCA(data.content);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Root Cause Analysis</CardTitle>
        <CardDescription>Document the root cause analysis for this incident</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleRCASubmit)} className="space-y-4">
          <div>
            <Label htmlFor="content">RCA Details</Label>
            <Textarea 
              {...register('content')} 
              placeholder="Document the root cause, contributing factors, and analysis..."
              rows={8}
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save RCA'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncidentRCATab;
