
import React from 'react';
import { useForm } from 'react-hook-form';
import { KRIDefinition } from '@/pages/risk-management/types';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface KRIFormProps {
  thresholdId: string;
  initialData?: Partial<KRIDefinition>;
  onSubmit: (data: Partial<KRIDefinition>) => void;
  onCancel: () => void;
}

export function KRIForm({ thresholdId, initialData, onSubmit, onCancel }: KRIFormProps) {
  const form = useForm<Partial<KRIDefinition>>({
    defaultValues: {
      threshold_id: thresholdId,
      name: initialData?.name || '',
      description: initialData?.description || '',
      measurement_frequency: initialData?.measurement_frequency || 'monthly',
      target_value: initialData?.target_value || '',
      warning_threshold: initialData?.warning_threshold || '',
      critical_threshold: initialData?.critical_threshold || '',
      ...(initialData?.id ? { id: initialData.id } : {})
    }
  });

  const handleSubmit = (data: Partial<KRIDefinition>) => {
    onSubmit(data);
  };

  return (
    <div className="border p-4 rounded-md mb-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KRI Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter KRI name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe this KRI" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="measurement_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Frequency</FormLabel>
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
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How often this KRI should be measured
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="target_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target</FormLabel>
                  <FormControl>
                    <Input placeholder="Target value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="warning_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warning Threshold</FormLabel>
                  <FormControl>
                    <Input placeholder="Warning threshold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="critical_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Critical Threshold</FormLabel>
                  <FormControl>
                    <Input placeholder="Critical threshold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save KRI</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
