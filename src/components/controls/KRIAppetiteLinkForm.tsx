
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enhancedKRIService } from "@/services/kri/enhanced-kri-service";
import { useToast } from "@/hooks/use-toast";

const kriAppetiteLinkSchema = z.object({
  risk_appetite_statement_id: z.string().min(1, "Risk appetite statement is required"),
  appetite_threshold: z.number().min(0, "Threshold must be positive"),
  warning_percentage: z.number().min(0).max(100).default(10),
  breach_percentage: z.number().min(0).max(100).default(25),
});

interface KRIAppetiteLinkFormProps {
  kriId: string;
  kriName: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const KRIAppetiteLinkForm: React.FC<KRIAppetiteLinkFormProps> = ({
  kriId,
  kriName,
  onSubmit,
  onCancel,
}) => {
  const [riskAppetiteStatements, setRiskAppetiteStatements] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof kriAppetiteLinkSchema>>({
    resolver: zodResolver(kriAppetiteLinkSchema),
    defaultValues: {
      warning_percentage: 10,
      breach_percentage: 25,
    },
  });

  useEffect(() => {
    loadRiskAppetiteStatements();
  }, []);

  const loadRiskAppetiteStatements = async () => {
    try {
      const statements = await enhancedKRIService.getRiskAppetiteStatements();
      setRiskAppetiteStatements(statements);
    } catch (error) {
      console.error('Error loading risk appetite statements:', error);
      toast({
        title: "Error",
        description: "Failed to load risk appetite statements",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (values: z.infer<typeof kriAppetiteLinkSchema>) => {
    try {
      setIsSubmitting(true);
      await enhancedKRIService.createKRIAppetiteLink({
        kri_id: kriId,
        ...values,
      });
      toast({
        title: "Success",
        description: "KRI appetite link created successfully",
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating KRI appetite link:', error);
      toast({
        title: "Error",
        description: "Failed to create KRI appetite link",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link KRI to Risk Appetite - {kriName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="risk_appetite_statement_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Appetite Statement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk appetite statement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {riskAppetiteStatements.map((statement) => (
                        <SelectItem key={statement.id} value={statement.id}>
                          {statement.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appetite_threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appetite Threshold</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="warning_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warning Threshold (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breach_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breach Threshold (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Link"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default KRIAppetiteLinkForm;
