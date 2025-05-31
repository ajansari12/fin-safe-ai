
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { enhancedAuditService, AuditSchedule } from "@/services/enhanced-audit-service";

const auditScheduleSchema = z.object({
  audit_name: z.string().min(1, "Audit name is required"),
  audit_type: z.enum(["internal", "external", "regulatory", "compliance"]),
  audit_scope: z.string().optional(),
  scheduled_start_date: z.date(),
  scheduled_end_date: z.date(),
  assigned_auditor_name: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  regulatory_framework: z.enum(["", "OSFI_B10", "OSFI_B13", "OSFI_E21"]).optional(),
  audit_frequency: z.enum(["", "monthly", "quarterly", "semi_annual", "annual"]).optional(),
  estimated_hours: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type AuditScheduleFormData = z.infer<typeof auditScheduleSchema>;

interface AuditScheduleFormProps {
  orgId: string;
  schedule?: AuditSchedule | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AuditScheduleForm: React.FC<AuditScheduleFormProps> = ({
  orgId,
  schedule,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<AuditScheduleFormData>({
    resolver: zodResolver(auditScheduleSchema),
    defaultValues: {
      audit_name: "",
      audit_type: "internal",
      audit_scope: "",
      priority: "medium",
      regulatory_framework: "",
      audit_frequency: "",
      estimated_hours: undefined,
      notes: "",
    }
  });

  useEffect(() => {
    if (schedule) {
      form.reset({
        audit_name: schedule.audit_name,
        audit_type: schedule.audit_type as any,
        audit_scope: schedule.audit_scope || "",
        scheduled_start_date: new Date(schedule.scheduled_start_date),
        scheduled_end_date: new Date(schedule.scheduled_end_date),
        assigned_auditor_name: schedule.assigned_auditor_name || "",
        priority: schedule.priority as any,
        regulatory_framework: schedule.regulatory_framework as any || "",
        audit_frequency: schedule.audit_frequency as any || "",
        estimated_hours: schedule.estimated_hours || undefined,
        notes: schedule.notes || "",
      });
    }
  }, [schedule, form]);

  const onSubmit = async (data: AuditScheduleFormData) => {
    try {
      setLoading(true);
      
      const auditData = {
        ...data,
        org_id: orgId,
        scheduled_start_date: format(data.scheduled_start_date, 'yyyy-MM-dd'),
        scheduled_end_date: format(data.scheduled_end_date, 'yyyy-MM-dd'),
        status: schedule?.status || 'scheduled',
        completion_percentage: schedule?.completion_percentage || 0,
      };

      if (schedule) {
        await enhancedAuditService.updateAuditSchedule(schedule.id, auditData);
      } else {
        await enhancedAuditService.createAuditSchedule(auditData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving audit schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="audit_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audit Name</FormLabel>
                <FormControl>
                  <Input placeholder="Annual SOX Audit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audit Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audit type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="audit_scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audit Scope</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the scope and objectives of this audit..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduled_start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assigned_auditor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned Auditor</FormLabel>
                <FormControl>
                  <Input placeholder="John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="regulatory_framework"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regulatory Framework</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="OSFI_B10">OSFI B-10</SelectItem>
                    <SelectItem value="OSFI_B13">OSFI B-13</SelectItem>
                    <SelectItem value="OSFI_E21">OSFI E-21</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="40"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes and requirements..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AuditScheduleForm;
