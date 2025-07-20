import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useKRI } from '@/hooks/useKRI';
import { toast } from 'sonner';

const kriSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['operational', 'financial', 'compliance', 'strategic']),
  subcategory: z.string().optional(),
  owner: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  data_source: z.string().optional(),
  calculation_method: z.string().optional(),
  unit: z.string().optional(),
  target_value: z.number().optional(),
  warning_threshold: z.number().min(0, 'Warning threshold must be positive'),
  critical_threshold: z.number().min(0, 'Critical threshold must be positive'),
  escalation_procedure: z.string().optional(),
  tags: z.array(z.string()).default([]),
  related_controls: z.array(z.string()).default([])
});

type KRIFormData = z.infer<typeof kriSchema>;

interface KRICreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Partial<KRIFormData>;
}

export const KRICreationForm: React.FC<KRICreationFormProps> = ({
  open,
  onOpenChange,
  onSuccess,
  initialData
}) => {
  const { createKRI } = useKRI();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');
  const [controlInput, setControlInput] = React.useState('');

  const form = useForm<KRIFormData>({
    resolver: zodResolver(kriSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'operational',
      subcategory: '',
      owner: '',
      frequency: 'monthly',
      data_source: '',
      calculation_method: '',
      unit: '',
      target_value: undefined,
      warning_threshold: 0,
      critical_threshold: 0,
      escalation_procedure: '',
      tags: [],
      related_controls: [],
      ...initialData
    }
  });

  const handleSubmit = async (data: KRIFormData) => {
    // Validate thresholds
    if (data.critical_threshold <= data.warning_threshold) {
      toast.error('Critical threshold must be greater than warning threshold');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createKRI({
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        owner: data.owner,
        frequency: data.frequency,
        data_source: data.data_source,
        calculation_method: data.calculation_method,
        unit: data.unit,
        target_value: data.target_value,
        warning_threshold: data.warning_threshold,
        critical_threshold: data.critical_threshold,
        tags: data.tags,
        related_controls: data.related_controls,
        escalation_procedure: data.escalation_procedure
      });
      if (result) {
        toast.success('KRI created successfully');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating KRI:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.getValues('tags').includes(tagInput.trim())) {
      const currentTags = form.getValues('tags');
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const addControl = () => {
    if (controlInput.trim() && !form.getValues('related_controls').includes(controlInput.trim())) {
      const currentControls = form.getValues('related_controls');
      form.setValue('related_controls', [...currentControls, controlInput.trim()]);
      setControlInput('');
    }
  };

  const removeControl = (controlToRemove: string) => {
    const currentControls = form.getValues('related_controls');
    form.setValue('related_controls', currentControls.filter(control => control !== controlToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New KRI</DialogTitle>
          <DialogDescription>
            Define a new Key Risk Indicator for monitoring operational risk
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KRI Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., System Availability" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="strategic">Strategic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this KRI measures and its importance"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., IT Systems" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input placeholder="Risk owner name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Measurement Frequency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Data Source and Calculation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Source</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monitoring System, Manual Collection" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where the data for this KRI comes from
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit of Measurement</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., %, count, minutes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="calculation_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calculation Method</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe how this KRI value is calculated"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thresholds */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="target_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="Optimal value"
                          {...field} 
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Ideal value for this KRI</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warning_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Threshold *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="Warning level"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Yellow alert level</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="critical_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Critical Threshold *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="Critical level"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Red alert level</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Escalation Procedure */}
            <FormField
              control={form.control}
              name="escalation_procedure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escalation Procedure</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what actions to take when thresholds are breached"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div className="space-y-3">
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('tags').map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Related Controls */}
            <div className="space-y-3">
              <FormLabel>Related Controls</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add control reference"
                  value={controlInput}
                  onChange={(e) => setControlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addControl())}
                />
                <Button type="button" variant="outline" onClick={addControl}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('related_controls').map((control) => (
                  <Badge key={control} variant="outline" className="flex items-center gap-1">
                    {control}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeControl(control)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create KRI'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};