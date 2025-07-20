
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/EnhancedAuthContext';

const riskAppetiteSchema = z.object({
  statementName: z.string().min(1, 'Statement name is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  reviewFrequency: z.enum(['quarterly', 'semi-annually', 'annually']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  riskCategories: z.array(z.object({
    category: z.string(),
    appetiteLevel: z.enum(['averse', 'minimal', 'cautious', 'open', 'seeking']),
    description: z.string(),
    threshold: z.number().min(0).max(100)
  })).min(1, 'At least one risk category is required')
});

type RiskAppetiteFormData = z.infer<typeof riskAppetiteSchema>;

interface CreateStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: RiskAppetiteFormData) => void;
}

const defaultRiskCategories = [
  { name: 'Operational Risk', description: 'Risk of loss from inadequate or failed processes, people, and systems' },
  { name: 'Credit Risk', description: 'Risk of loss from counterparty default or credit deterioration' },
  { name: 'Market Risk', description: 'Risk of loss from adverse market movements' },
  { name: 'Liquidity Risk', description: 'Risk of inability to meet obligations when due' },
  { name: 'Compliance Risk', description: 'Risk of regulatory penalties or sanctions' },
  { name: 'Reputation Risk', description: 'Risk of damage to reputation affecting stakeholder confidence' }
];

const appetiteLevels = [
  { value: 'averse', label: 'Risk Averse', color: 'bg-red-100 text-red-800' },
  { value: 'minimal', label: 'Minimal Risk', color: 'bg-orange-100 text-orange-800' },
  { value: 'cautious', label: 'Cautious', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'open', label: 'Open to Risk', color: 'bg-blue-100 text-blue-800' },
  { value: 'seeking', label: 'Risk Seeking', color: 'bg-green-100 text-green-800' }
];

export const CreateStatementModal: React.FC<CreateStatementModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<RiskAppetiteFormData>({
    resolver: zodResolver(riskAppetiteSchema),
    defaultValues: {
      riskCategories: []
    }
  });

  const handleClose = () => {
    reset();
    setCurrentStep(0);
    setSelectedCategories([]);
    onClose();
  };

  const addRiskCategory = (categoryName: string) => {
    const newCategory = {
      category: categoryName,
      appetiteLevel: 'cautious' as const,
      description: defaultRiskCategories.find(c => c.name === categoryName)?.description || '',
      threshold: 50
    };
    
    const updatedCategories = [...selectedCategories, newCategory];
    setSelectedCategories(updatedCategories);
    setValue('riskCategories', updatedCategories);
  };

  const removeRiskCategory = (index: number) => {
    const updatedCategories = selectedCategories.filter((_, i) => i !== index);
    setSelectedCategories(updatedCategories);
    setValue('riskCategories', updatedCategories);
  };

  const updateRiskCategory = (index: number, field: string, value: any) => {
    const updatedCategories = [...selectedCategories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setSelectedCategories(updatedCategories);
    setValue('riskCategories', updatedCategories);
  };

  const onSubmit = async (data: RiskAppetiteFormData) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        statement_name: data.statementName,
        description: data.description,
        effective_date: data.effectiveDate,
        review_date: data.effectiveDate, // Same as effective for now
        riskCategories: selectedCategories.map(cat => ({
          category_name: cat.category,
          category_type: 'operational' as const, // Default type
          appetite_level: cat.appetiteLevel,
          description: cat.description,
          rationale: `Threshold set at ${cat.threshold}%`
        })),
        quantitativeLimits: [],
        qualitativeStatements: []
      };
      
      onSave?.(formattedData);
      handleClose();
    } catch (error) {
      toast.error('Failed to create risk appetite statement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'Basic Information', description: 'Statement details and timeline' },
    { title: 'Risk Categories', description: 'Define appetite for each risk type' },
    { title: 'Review & Submit', description: 'Confirm and create statement' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Risk Appetite Statement</DialogTitle>
          <DialogDescription>
            Define your organization's risk appetite across different risk categories in compliance with OSFI E-21 guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-2">
                  <p className={`text-sm font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px w-8 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="statementName">Statement Name</Label>
                    <Input
                      id="statementName"
                      {...register('statementName')}
                      placeholder="e.g., Annual Risk Appetite Statement 2024"
                    />
                    {errors.statementName && (
                      <p className="text-sm text-destructive">{errors.statementName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveDate">Effective Date</Label>
                    <Input
                      id="effectiveDate"
                      type="date"
                      {...register('effectiveDate')}
                    />
                    {errors.effectiveDate && (
                      <p className="text-sm text-destructive">{errors.effectiveDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewFrequency">Review Frequency</Label>
                  <Select onValueChange={(value) => setValue('reviewFrequency', value as any)}>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Statement Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Describe the purpose and scope of this risk appetite statement..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Risk Categories */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Risk Categories</h3>
                  <Select onValueChange={addRiskCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Add Risk Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultRiskCategories
                        .filter(cat => !selectedCategories.some(sel => sel.category === cat.name))
                        .map(category => (
                          <SelectItem key={category.name} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {selectedCategories.map((category, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{category.category}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRiskCategory(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Risk Appetite Level</Label>
                          <Select
                            value={category.appetiteLevel}
                            onValueChange={(value) => updateRiskCategory(index, 'appetiteLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {appetiteLevels.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                  <div className="flex items-center gap-2">
                                    <Badge className={level.color}>{level.label}</Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Risk Threshold (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={category.threshold}
                            onChange={(e) => updateRiskCategory(index, 'threshold', parseInt(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={category.description}
                            onChange={(e) => updateRiskCategory(index, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedCategories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No risk categories selected. Please add at least one category to continue.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Statement</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium">Statement Name</Label>
                        <p className="text-sm text-muted-foreground">{watch('statementName')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Effective Date</Label>
                        <p className="text-sm text-muted-foreground">{watch('effectiveDate')}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">{watch('description')}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Risk Categories ({selectedCategories.length})</Label>
                      <div className="mt-2 space-y-2">
                        {selectedCategories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{category.category}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={appetiteLevels.find(l => l.value === category.appetiteLevel)?.color}>
                                {appetiteLevels.find(l => l.value === category.appetiteLevel)?.label}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{category.threshold}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                
                {currentStep < 2 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={currentStep === 1 && selectedCategories.length === 0}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Creating...' : 'Create Statement'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
