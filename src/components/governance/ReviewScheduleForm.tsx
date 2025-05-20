
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addMonths, format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createReviewSchedule, updateReviewSchedule } from "@/services/governance-service";
import { GovernanceReviewSchedule } from "@/pages/governance/types";

const formSchema = z.object({
  review_frequency_months: z.coerce.number().int().min(1).max(60),
});

interface ReviewScheduleFormProps {
  policyId: string;
  onSuccess?: (schedule: GovernanceReviewSchedule) => void;
  onCancel?: () => void;
  existingSchedule?: GovernanceReviewSchedule;
}

export default function ReviewScheduleForm({ 
  policyId, 
  onSuccess, 
  onCancel, 
  existingSchedule 
}: ReviewScheduleFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [previewDate, setPreviewDate] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      review_frequency_months: existingSchedule?.review_frequency_months || 12,
    },
  });

  // Preview next review date when frequency changes
  const updatePreviewDate = (frequency: number) => {
    const nextReview = addMonths(new Date(), frequency);
    setPreviewDate(format(nextReview, 'PPP'));
  };

  // Initialize preview
  useState(() => {
    updatePreviewDate(form.getValues().review_frequency_months);
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    try {
      const nextReviewDate = addMonths(new Date(), values.review_frequency_months);
      
      if (existingSchedule) {
        // Update existing schedule
        const updatedSchedule = await updateReviewSchedule(existingSchedule.id, {
          review_frequency_months: values.review_frequency_months,
          next_review_date: nextReviewDate.toISOString(),
        });
        
        if (updatedSchedule && onSuccess) {
          onSuccess(updatedSchedule);
        }
      } else {
        // Create new schedule
        const newSchedule = await createReviewSchedule({
          policy_id: policyId,
          review_frequency_months: values.review_frequency_months,
          next_review_date: nextReviewDate.toISOString(),
          reminder_sent: false,
        });
        
        if (newSchedule && onSuccess) {
          onSuccess(newSchedule);
        }
      }
    } catch (error) {
      console.error("Error submitting review schedule:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="review_frequency_months"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Frequency (Months)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={60} 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    updatePreviewDate(parseInt(e.target.value) || 12);
                  }}
                />
              </FormControl>
              <FormDescription>
                Next review will be due: {previewDate || 'in 12 months'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-2 justify-end">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSaving}
          >
            {isSaving 
              ? "Saving..." 
              : (existingSchedule ? "Update Schedule" : "Set Schedule")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
