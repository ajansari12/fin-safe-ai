import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScenarioTest } from "@/services/scenario-testing-service";

interface ScenarioBuilderProps {
  scenario?: ScenarioTest;
  onSave: (data: Partial<ScenarioTest>) => void;
  onCancel: () => void;
}

const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ scenario, onSave, onCancel }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: scenario?.title || '',
      description: scenario?.description || '',
      disruption_type: scenario?.disruption_type || '',
      severity_level: scenario?.severity_level || 'medium',
      response_plan: scenario?.response_plan || '',
    }
  });

  const disruptionTypes = [
    { value: 'cyber_attack', label: 'Cyber Attack' },
    { value: 'natural_disaster', label: 'Natural Disaster' },
    { value: 'pandemic', label: 'Pandemic' },
    { value: 'system_failure', label: 'System Failure' },
    { value: 'vendor_failure', label: 'Vendor Failure' },
    { value: 'power_outage', label: 'Power Outage' },
    { value: 'key_personnel', label: 'Key Personnel Loss' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Scenario Title *</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="Enter scenario title"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="disruption_type">Disruption Type *</Label>
            <Select onValueChange={(value) => setValue("disruption_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select disruption type" />
              </SelectTrigger>
              <SelectContent>
                {disruptionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="severity_level">Severity Level *</Label>
            <Select 
              onValueChange={(value) => setValue("severity_level", value)}
              defaultValue={watch("severity_level")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={level.color}>{level.label}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the scenario and its context"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="response_plan">Response Plan</Label>
            <Textarea
              id="response_plan"
              {...register("response_plan")}
              placeholder="Outline the expected response procedures"
              rows={4}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scenario Configuration</CardTitle>
          <CardDescription>
            Configure test parameters and success criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Additional configuration options will be available after saving the basic scenario details.
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {scenario ? 'Update Scenario' : 'Create Scenario'}
        </Button>
      </div>
    </form>
  );
};

export default ScenarioBuilder;