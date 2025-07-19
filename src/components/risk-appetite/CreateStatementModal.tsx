
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';

const basicInfoSchema = z.object({
  statementName: z.string().min(1, 'Statement name is required'),
  description: z.string().optional(),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  reviewFrequency: z.enum(['quarterly', 'semi-annually', 'annually']),
});

const riskCategorySchema = z.object({
  categoryName: z.string().min(1, 'Category name is required'),
  categoryType: z.enum(['operational', 'financial', 'compliance', 'strategic']),
  appetiteLevel: z.enum(['averse', 'minimal', 'cautious', 'open', 'seeking']),
  description: z.string().min(1, 'Description is required'),
  rationale: z.string().optional(),
});

const quantitativeLimitSchema = z.object({
  metricName: z.string().min(1, 'Metric name is required'),
  limitValue: z.number().min(0, 'Limit value must be positive'),
  limitUnit: z.string().min(1, 'Unit is required'),
  warningThreshold: z.number().min(0, 'Warning threshold must be positive'),
  criticalThreshold: z.number().min(0, 'Critical threshold must be positive'),
  measurementFrequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
  dataSource: z.string().min(1, 'Data source is required'),
});

const qualitativeStatementSchema = z.object({
  category: z.enum(['culture', 'conduct', 'compliance', 'reputation']),
  statementText: z.string().min(1, 'Statement text is required'),
  acceptanceCriteria: z.array(z.string().min(1, 'Criteria cannot be empty')),
  rationale: z.string().optional(),
});

interface CreateStatementModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateStatementModal: React.FC<CreateStatementModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data storage
  const [basicInfo, setBasicInfo] = useState<any>({});
  const [riskCategories, setRiskCategories] = useState<any[]>([]);
  const [quantitativeLimits, setQuantitativeLimits] = useState<any[]>([]);
  const [qualitativeStatements, setQualitativeStatements] = useState<any[]>([]);

  const basicInfoForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      statementName: '',
      description: '',
      effectiveDate: '',
      reviewFrequency: 'annually' as const,
    }
  });

  const riskCategoryForm = useForm({
    resolver: zodResolver(riskCategorySchema),
    defaultValues: {
      categoryName: '',
      categoryType: 'operational' as const,
      appetiteLevel: 'cautious' as const,
      description: '',
      rationale: '',
    }
  });

  const quantitativeLimitForm = useForm({
    resolver: zodResolver(quantitativeLimitSchema),
    defaultValues: {
      metricName: '',
      limitValue: 0,
      limitUnit: '',
      warningThreshold: 0,
      criticalThreshold: 0,
      measurementFrequency: 'monthly' as const,
      dataSource: '',
    }
  });

  const qualitativeStatementForm = useForm({
    resolver: zodResolver(qualitativeStatementSchema),
    defaultValues: {
      category: 'culture' as const,
      statementText: '',
      acceptanceCriteria: [''],
      rationale: '',
    }
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Statement name and effective dates' },
    { id: 2, title: 'Risk Categories', description: 'Define appetite levels for each risk category' },
    { id: 3, title: 'Quantitative Limits', description: 'Set numerical limits and thresholds' },
    { id: 4, title: 'Qualitative Statements', description: 'Define cultural and conduct expectations' },
    { id: 5, title: 'Review & Submit', description: 'Summary and approval workflow' },
  ];

  const getStepProgress = () => (currentStep / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBasicInfoSubmit = (data: any) => {
    setBasicInfo(data);
    handleNextStep();
  };

  const handleAddRiskCategory = (data: any) => {
    setRiskCategories([...riskCategories, { ...data, id: Date.now() }]);
    riskCategoryForm.reset();
  };

  const handleAddQuantitativeLimit = (data: any) => {
    setQuantitativeLimits([...quantitativeLimits, { ...data, id: Date.now() }]);
    quantitativeLimitForm.reset();
  };

  const handleAddQualitativeStatement = (data: any) => {
    setQualitativeStatements([...qualitativeStatements, { ...data, id: Date.now() }]);
    qualitativeStatementForm.reset();
  };

  const handleRemoveItem = (items: any[], setItems: any, id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleFinalSubmit = async () => {
    if (!profile?.organization_id) {
      toast.error('Organization not found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate review date based on frequency
      const effectiveDate = new Date(basicInfo.effectiveDate);
      const reviewDate = new Date(effectiveDate);
      
      switch (basicInfo.reviewFrequency) {
        case 'quarterly':
          reviewDate.setMonth(reviewDate.getMonth() + 3);
          break;
        case 'semi-annually':
          reviewDate.setMonth(reviewDate.getMonth() + 6);
          break;
        case 'annually':
          reviewDate.setFullYear(reviewDate.getFullYear() + 1);
          break;
      }

      // Create risk appetite statement
      const { data: statement, error: statementError } = await supabase
        .from('risk_appetite_statements')
        .insert({
          organization_id: profile.organization_id,
          statement_name: basicInfo.statementName,
          description: basicInfo.description,
          effective_date: basicInfo.effectiveDate,
          review_date: reviewDate.toISOString().split('T')[0],
          next_review_date: reviewDate.toISOString().split('T')[0],
          approval_status: 'draft',
          created_by: profile.id,
        })
        .select()
        .single();

      if (statementError) throw statementError;

      // Create risk categories
      if (riskCategories.length > 0) {
        const { error: categoriesError } = await supabase
          .from('risk_categories')
          .insert(
            riskCategories.map(category => ({
              statement_id: statement.id,
              category_name: category.categoryName,
              category_type: category.categoryType,
              appetite_level: category.appetiteLevel,
              description: category.description,
              rationale: category.rationale,
            }))
          );

        if (categoriesError) throw categoriesError;
      }

      // Create quantitative limits
      if (quantitativeLimits.length > 0) {
        const { error: limitsError } = await supabase
          .from('quantitative_limits')
          .insert(
            quantitativeLimits.map(limit => ({
              statement_id: statement.id,
              metric_name: limit.metricName,
              limit_value: limit.limitValue,
              limit_unit: limit.limitUnit,
              warning_threshold: limit.warningThreshold,
              critical_threshold: limit.criticalThreshold,
              measurement_frequency: limit.measurementFrequency,
              data_source: limit.dataSource,
            }))
          );

        if (limitsError) throw limitsError;
      }

      // Create qualitative statements
      if (qualitativeStatements.length > 0) {
        const { error: statementsError } = await supabase
          .from('qualitative_statements')
          .insert(
            qualitativeStatements.map(statement => ({
              statement_id: statement.id,
              category: statement.category,
              statement_text: statement.statementText,
              acceptance_criteria: statement.acceptanceCriteria,
              rationale: statement.rationale,
            }))
          );

        if (statementsError) throw statementsError;
      }

      toast.success('Risk appetite statement created successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating risk appetite statement:', error);
      toast.error(error.message || 'Failed to create risk appetite statement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statementName">Statement Name</Label>
              <Input 
                id="statementName"
                {...basicInfoForm.register('statementName')}
                placeholder="e.g., Annual Risk Appetite Statement 2024"
              />
              {basicInfoForm.formState.errors.statementName && (
                <p className="text-sm text-red-500">{basicInfoForm.formState.errors.statementName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description"
                {...basicInfoForm.register('description')}
                placeholder="Brief description of the risk appetite statement"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input 
                id="effectiveDate"
                type="date"
                {...basicInfoForm.register('effectiveDate')}
              />
              {basicInfoForm.formState.errors.effectiveDate && (
                <p className="text-sm text-red-500">{basicInfoForm.formState.errors.effectiveDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewFrequency">Review Frequency</Label>
              <Select 
                value={basicInfoForm.watch('reviewFrequency')} 
                onValueChange={(value) => basicInfoForm.setValue('reviewFrequency', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select review frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-6">
            <form onSubmit={riskCategoryForm.handleSubmit(handleAddRiskCategory)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input 
                    id="categoryName"
                    {...riskCategoryForm.register('categoryName')}
                    placeholder="e.g., Operational Risk"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryType">Category Type</Label>
                  <Select 
                    value={riskCategoryForm.watch('categoryType')} 
                    onValueChange={(value) => riskCategoryForm.setValue('categoryType', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="strategic">Strategic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appetiteLevel">Appetite Level</Label>
                <Select 
                  value={riskCategoryForm.watch('appetiteLevel')} 
                  onValueChange={(value) => riskCategoryForm.setValue('appetiteLevel', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="averse">Averse</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="cautious">Cautious</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="seeking">Seeking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  {...riskCategoryForm.register('description')}
                  placeholder="Describe the risk category and appetite level"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rationale">Rationale (Optional)</Label>
                <Textarea 
                  id="rationale"
                  {...riskCategoryForm.register('rationale')}
                  placeholder="Explain the reasoning behind this appetite level"
                  rows={2}
                />
              </div>

              <Button type="submit" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </form>

            {riskCategories.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Added Categories ({riskCategories.length})</h4>
                <div className="grid gap-3">
                  {riskCategories.map((category, index) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{category.categoryName}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{category.appetiteLevel}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(riskCategories, setRiskCategories, category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
              <p className="text-sm text-muted-foreground">
                Review your risk appetite statement before submission
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {basicInfo.statementName}</div>
                    <div><strong>Effective Date:</strong> {basicInfo.effectiveDate}</div>
                    <div><strong>Review Frequency:</strong> {basicInfo.reviewFrequency}</div>
                    {basicInfo.description && (
                      <div><strong>Description:</strong> {basicInfo.description}</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Categories ({riskCategories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {riskCategories.length > 0 ? (
                    <div className="space-y-2">
                      {riskCategories.map((category, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{category.categoryName}</span>
                          <Badge variant="outline">{category.appetiteLevel}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No risk categories added</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quantitative Limits ({quantitativeLimits.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {quantitativeLimits.length > 0 ? (
                    <div className="space-y-2">
                      {quantitativeLimits.map((limit, index) => (
                        <div key={index} className="p-2 bg-muted rounded">
                          <div className="font-medium">{limit.metricName}</div>
                          <div className="text-sm text-muted-foreground">
                            Limit: {limit.limitValue} {limit.limitUnit} | 
                            Warning: {limit.warningThreshold} | 
                            Critical: {limit.criticalThreshold}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No quantitative limits added</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qualitative Statements ({qualitativeStatements.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {qualitativeStatements.length > 0 ? (
                    <div className="space-y-2">
                      {qualitativeStatements.map((statement, index) => (
                        <div key={index} className="p-2 bg-muted rounded">
                          <div className="font-medium capitalize">{statement.category}</div>
                          <div className="text-sm text-muted-foreground">{statement.statementText}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No qualitative statements added</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Statement'}
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground">
            Step {currentStep} is under development
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create Risk Appetite Statement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  step.id === currentStep ? 'text-primary' : 
                  step.id < currentStep ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step.id === currentStep ? 'border-primary bg-primary text-primary-foreground' :
                  step.id < currentStep ? 'border-green-600 bg-green-600 text-white' :
                  'border-muted-foreground'
                }`}>
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm">{step.id}</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
