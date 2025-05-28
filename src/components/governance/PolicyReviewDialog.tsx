
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { GovernancePolicy } from "@/pages/governance/types";
import { submitPolicyReview } from "@/services/governance-service";
import { toast } from "sonner";

const formSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  comments: z.string().min(1, "Comments are required"),
});

interface PolicyReviewDialogProps {
  policy: GovernancePolicy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function PolicyReviewDialog({
  policy,
  open,
  onOpenChange,
  onSuccess,
}: PolicyReviewDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comments: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!reviewAction) return;
    
    setIsSubmitting(true);
    
    try {
      await submitPolicyReview(policy.id, {
        status: reviewAction,
        comments: values.comments,
      });
      
      toast.success(`Policy ${reviewAction} successfully`);
      onSuccess();
      onOpenChange(false);
      form.reset();
      setReviewAction(null);
    } catch (error) {
      console.error("Error submitting policy review:", error);
      toast.error("Failed to submit policy review");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleActionSelect = (action: 'approved' | 'rejected') => {
    setReviewAction(action);
    form.setValue('status', action);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Policy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Policy Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{policy.title}</h4>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Version {policy.version}</span>
              <Badge variant="outline">{policy.status}</Badge>
              {policy.review_due_date && (
                <span>Due: {format(new Date(policy.review_due_date), 'PPP')}</span>
              )}
            </div>
            {policy.description && (
              <p className="mt-2 text-sm text-gray-700">{policy.description}</p>
            )}
          </div>

          {/* Review Action Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Review Decision</label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={reviewAction === 'approved' ? 'default' : 'outline'}
                className={reviewAction === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 hover:bg-green-50'}
                onClick={() => handleActionSelect('approved')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                type="button"
                variant={reviewAction === 'rejected' ? 'default' : 'outline'}
                className={reviewAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 hover:bg-red-50'}
                onClick={() => handleActionSelect('rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>

          {/* Review Form */}
          {reviewAction && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Review Comments 
                        {reviewAction === 'rejected' && <span className="text-red-500">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            reviewAction === 'approved' 
                              ? "Provide feedback on the policy approval..."
                              : "Explain why this policy is being rejected and what needs to be changed..."
                          }
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      setReviewAction(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    variant={reviewAction === 'approved' ? 'default' : 'destructive'}
                  >
                    {isSubmitting 
                      ? "Submitting..." 
                      : `Submit ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`
                    }
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
