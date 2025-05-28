
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { businessContinuityService, ContinuityTest, ContinuityPlan } from "@/services/business-continuity-service";

interface ContinuityTestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test?: ContinuityTest;
  continuityPlans: ContinuityPlan[];
  orgId: string;
  onSuccess: () => void;
}

interface FormData {
  test_name: string;
  continuity_plan_id: string;
  test_type: 'tabletop' | 'dry_run' | 'full_scale';
  test_description: string;
  scheduled_date: string;
  test_scope: string;
  test_scenario: string;
  success_criteria: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

const ContinuityTestForm: React.FC<ContinuityTestFormProps> = ({
  open,
  onOpenChange,
  test,
  continuityPlans,
  orgId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<string[]>(test?.participants || []);
  const [newParticipant, setNewParticipant] = useState('');
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      test_name: test?.test_name || '',
      continuity_plan_id: test?.continuity_plan_id || '',
      test_type: test?.test_type || 'tabletop',
      test_description: test?.test_description || '',
      scheduled_date: test?.scheduled_date || '',
      test_scope: test?.test_scope || '',
      test_scenario: test?.test_scenario || '',
      success_criteria: test?.success_criteria || '',
      status: test?.status || 'scheduled'
    }
  });

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (participant: string) => {
    setParticipants(participants.filter(p => p !== participant));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const testData = {
        ...data,
        org_id: orgId,
        participants
      };

      if (test) {
        await businessContinuityService.updateContinuityTest(test.id, testData);
      } else {
        await businessContinuityService.createContinuityTest(testData);
      }

      toast({
        title: "Success",
        description: `Continuity test ${test ? 'updated' : 'scheduled'} successfully.`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving continuity test:', error);
      toast({
        title: "Error",
        description: "Failed to save continuity test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test ? 'Edit' : 'Schedule'} Continuity Test</DialogTitle>
          <DialogDescription>
            {test ? 'Update the' : 'Schedule a new'} business continuity test to validate recovery procedures.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="test_name"
              rules={{ required: "Test name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter test name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="continuity_plan_id"
              rules={{ required: "Continuity plan is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Continuity Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select continuity plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {continuityPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.plan_name} - {plan.business_functions?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="test_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tabletop">Tabletop Exercise</SelectItem>
                        <SelectItem value="dry_run">Dry Run</SelectItem>
                        <SelectItem value="full_scale">Full Scale Test</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduled_date"
                rules={{ required: "Scheduled date is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="test_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the test objectives and approach" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="test_scenario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Scenario</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the disruption scenario to test" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="success_criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Define what constitutes a successful test" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label>Test Participants</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add participant name/role"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                />
                <Button type="button" onClick={addParticipant} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {participants.map((participant, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {participant}
                    <button
                      type="button"
                      onClick={() => removeParticipant(participant)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="test_scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Scope</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Department-wide, System-specific" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (test ? 'Update' : 'Schedule')} Test
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContinuityTestForm;
