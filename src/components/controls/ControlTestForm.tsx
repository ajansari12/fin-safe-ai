
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CreateControlTestData } from "@/services/control-tests";

const controlTestSchema = z.object({
  test_date: z.string().min(1, "Test date is required"),
  test_type: z.enum(["effectiveness", "design", "operational"]),
  test_method: z.enum(["manual", "automated"]),
  test_result: z.enum(["pass", "fail", "partial"]),
  effectiveness_rating: z.number().min(1).max(5).optional(),
  risk_reduction_impact: z.number().min(1).max(10).optional(),
  test_description: z.string().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  tested_by_name: z.string().optional(),
  remediation_required: z.boolean().default(false),
  remediation_deadline: z.string().optional(),
  remediation_status: z.enum(["not_required", "pending", "in_progress", "completed"]).default("not_required")
});

interface ControlTestFormProps {
  controlId: string;
  controlName: string;
  onSubmit: (data: CreateControlTestData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ControlTestForm: React.FC<ControlTestFormProps> = ({
  controlId,
  controlName,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const form = useForm<z.infer<typeof controlTestSchema>>({
    resolver: zodResolver(controlTestSchema),
    defaultValues: {
      test_date: new Date().toISOString().split('T')[0],
      test_type: "effectiveness",
      test_method: "manual",
      test_result: "pass",
      remediation_required: false,
      remediation_status: "not_required"
    }
  });

  const handleSubmit = (values: z.infer<typeof controlTestSchema>) => {
    // Ensure all required fields are present for CreateControlTestData
    const submitData: CreateControlTestData = {
      control_id: controlId,
      test_date: values.test_date,
      test_type: values.test_type,
      test_method: values.test_method,
      test_result: values.test_result,
      effectiveness_rating: values.effectiveness_rating,
      risk_reduction_impact: values.risk_reduction_impact,
      test_description: values.test_description,
      findings: values.findings,
      recommendations: values.recommendations,
      tested_by_name: values.tested_by_name,
      remediation_required: values.remediation_required,
      remediation_deadline: values.remediation_deadline,
      remediation_status: values.remediation_status
    };
    
    onSubmit(submitData);
  };

  const remediationRequired = form.watch("remediation_required");

  return (
    <div className="space-y-6">
      <div>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="mb-4"
        >
          ← Back to Controls
        </Button>
        <h2 className="text-2xl font-bold">Test Control: {controlName}</h2>
        <p className="text-muted-foreground">Record the results of a control test</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Control Test Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="test_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="effectiveness">Effectiveness</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automated">Automated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test_result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Result</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pass">Pass</SelectItem>
                          <SelectItem value="fail">Fail</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveness_rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effectiveness Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={5} 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="risk_reduction_impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Reduction Impact (1-10)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          max={10} 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tested_by_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tested By</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tester name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="test_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the test methodology and scope..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Findings</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail the test findings and observations..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommendations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommendations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide recommendations for improvement..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remediation_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Remediation Required</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Does this control require remediation actions?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {remediationRequired && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="remediation_deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remediation Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="remediation_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remediation Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Test Results"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlTestForm;
