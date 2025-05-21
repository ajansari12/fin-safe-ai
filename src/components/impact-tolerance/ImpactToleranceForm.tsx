
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  max_tolerable_downtime: z.string().min(1, "Required"),
  recovery_time_objective: z.string().min(1, "Required"),
  financial_impact: z.string().optional(),
  reputational_impact: z.string().optional(),
  compliance_impact: z.string().optional(),
  quantitative_threshold: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ImpactToleranceFormProps {
  functionId: string;
  onSave: (values: FormValues & { function_id: string }) => Promise<void>;
  onPublish?: (values: FormValues & { function_id: string }) => Promise<void>;
  initialValues?: Partial<FormValues>;
  isEdit?: boolean;
}

const ImpactToleranceForm: React.FC<ImpactToleranceFormProps> = ({
  functionId,
  onSave,
  onPublish,
  initialValues,
  isEdit = false
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      max_tolerable_downtime: "",
      recovery_time_objective: "",
      financial_impact: "",
      reputational_impact: "",
      compliance_impact: "",
      quantitative_threshold: "",
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSave = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...values,
        function_id: functionId,
      });
      toast.success(`Impact tolerance ${isEdit ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving impact tolerance:', error);
      toast.error('Failed to save impact tolerance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    const valid = await form.trigger();
    if (!valid || !onPublish) return;
    
    setIsSubmitting(true);
    try {
      await onPublish({
        ...form.getValues(),
        function_id: functionId,
      });
      toast.success('Impact tolerance published successfully');
    } catch (error) {
      console.error('Error publishing impact tolerance:', error);
      toast.error('Failed to publish impact tolerance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit' : 'Define'} Impact Tolerance</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="max_tolerable_downtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Tolerable Downtime (MTD)</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select MTD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15min">15 minutes</SelectItem>
                          <SelectItem value="1hour">1 hour</SelectItem>
                          <SelectItem value="4hours">4 hours</SelectItem>
                          <SelectItem value="8hours">8 hours</SelectItem>
                          <SelectItem value="24hours">24 hours</SelectItem>
                          <SelectItem value="48hours">48 hours</SelectItem>
                          <SelectItem value="1week">1 week</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recovery_time_objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Time Objective (RTO)</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select RTO" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15min">15 minutes</SelectItem>
                          <SelectItem value="30min">30 minutes</SelectItem>
                          <SelectItem value="1hour">1 hour</SelectItem>
                          <SelectItem value="2hours">2 hours</SelectItem>
                          <SelectItem value="4hours">4 hours</SelectItem>
                          <SelectItem value="8hours">8 hours</SelectItem>
                          <SelectItem value="24hours">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="quantitative_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantitative Threshold</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., < 4 hours downtime per quarter" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Impact Assessment</h3>
              
              <FormField
                control={form.control}
                name="financial_impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Impact</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe potential financial impact" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reputational_impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reputational Impact</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe potential reputational impact" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="compliance_impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compliance Impact</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe potential regulatory compliance impact" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
              
              {onPublish && (
                <Button 
                  type="button"
                  onClick={handlePublish}
                  variant="default" 
                  disabled={isSubmitting}
                >
                  Publish
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ImpactToleranceForm;
