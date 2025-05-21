
import React from 'react';
import { useForm } from 'react-hook-form';
import { RiskCategory, RiskThreshold } from '@/pages/risk-management/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface RiskCategoryFormProps {
  category: RiskCategory;
  initialData?: Partial<RiskThreshold>;
  onSubmit: (data: Partial<RiskThreshold>) => void;
}

export function RiskCategoryForm({ category, initialData, onSubmit }: RiskCategoryFormProps) {
  const form = useForm<Partial<RiskThreshold>>({
    defaultValues: {
      category_id: category.id,
      tolerance_level: initialData?.tolerance_level || 'medium',
      description: initialData?.description || '',
      escalation_trigger: initialData?.escalation_trigger || '',
      ...(initialData?.id ? { id: initialData.id } : {})
    }
  });

  const handleSubmit = (data: Partial<RiskThreshold>) => {
    onSubmit(data);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        <CardDescription>{category.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tolerance_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tolerance Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tolerance level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Set the tolerance level for this risk category
                  </FormDescription>
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
                    <Textarea placeholder="Describe the risk appetite for this category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="escalation_trigger"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escalation Trigger</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., 2 major incidents per quarter" {...field} />
                  </FormControl>
                  <FormDescription>
                    Define when this risk should be escalated to senior management
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
