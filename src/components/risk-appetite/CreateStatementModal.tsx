
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

interface RiskCategory {
  category_name: string;
  category_type: 'operational' | 'financial' | 'compliance' | 'strategic';
  appetite_level: 'averse' | 'minimal' | 'cautious' | 'open' | 'seeking';
  description: string;
  rationale?: string;
}

interface QuantitativeLimit {
  category_name: string;
  metric_name: string;
  limit_value: number;
  limit_unit: string;
  warning_threshold: number;
  critical_threshold: number;
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data_source: string;
  calculation_method?: string;
}

interface QualitativeStatement {
  category: 'culture' | 'conduct' | 'compliance' | 'reputation';
  statement_text: string;
  acceptance_criteria: string[];
  rationale?: string;
}

export const CreateStatementModal: React.FC<CreateStatementModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    statement_name: '',
    description: '',
    effective_date: '',
    review_date: '',
  });

  const [riskCategories, setRiskCategories] = useState<RiskCategory[]>([
    {
      category_name: '',
      category_type: 'operational' as const,
      appetite_level: 'cautious' as const,
      description: '',
      rationale: ''
    }
  ]);

  const [quantitativeLimits, setQuantitativeLimits] = useState<QuantitativeLimit[]>([]);
  const [qualitativeStatements, setQualitativeStatements] = useState<QualitativeStatement[]>([]);

  const handleAddRiskCategory = () => {
    setRiskCategories([...riskCategories, {
      category_name: '',
      category_type: 'operational',
      appetite_level: 'cautious',
      description: '',
      rationale: ''
    }]);
  };

  const handleRemoveRiskCategory = (index: number) => {
    setRiskCategories(riskCategories.filter((_, i) => i !== index));
  };

  const handleAddQuantitativeLimit = () => {
    setQuantitativeLimits([...quantitativeLimits, {
      category_name: '',
      metric_name: '',
      limit_value: 0,
      limit_unit: '',
      warning_threshold: 0,
      critical_threshold: 0,
      measurement_frequency: 'monthly',
      data_source: '',
      calculation_method: ''
    }]);
  };

  const handleAddQualitativeStatement = () => {
    setQualitativeStatements([...qualitativeStatements, {
      category: 'culture',
      statement_text: '',
      acceptance_criteria: [''],
      rationale: ''
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.statement_name || !formData.effective_date || !formData.review_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (riskCategories.some(cat => !cat.category_name || !cat.description)) {
      toast.error('Please complete all risk categories');
      return;
    }

    setIsLoading(true);
    
    try {
      await onSave({
        statement: formData,
        riskCategories: riskCategories.filter(cat => cat.category_name && cat.description),
        quantitativeLimits,
        qualitativeStatements
      });
      
      toast.success('Risk appetite statement created successfully');
      onClose();
      
      // Reset form
      setFormData({
        statement_name: '',
        description: '',
        effective_date: '',
        review_date: '',
      });
      setRiskCategories([{
        category_name: '',
        category_type: 'operational',
        appetite_level: 'cautious',
        description: '',
        rationale: ''
      }]);
      setQuantitativeLimits([]);
      setQualitativeStatements([]);
    } catch (error) {
      console.error('Error creating statement:', error);
      toast.error('Failed to create risk appetite statement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Risk Appetite Statement</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the core details of your risk appetite statement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="statement_name">Statement Name *</Label>
                  <Input
                    id="statement_name"
                    value={formData.statement_name}
                    onChange={(e) => setFormData({...formData, statement_name: e.target.value})}
                    placeholder="e.g., 2024 Risk Appetite Statement"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="effective_date">Effective Date *</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="review_date">Review Date *</Label>
                  <Input
                    id="review_date"
                    type="date"
                    value={formData.review_date}
                    onChange={(e) => setFormData({...formData, review_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the purpose and scope of this risk appetite statement"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Risk Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Categories</CardTitle>
                  <CardDescription>
                    Define risk categories and appetite levels
                  </CardDescription>
                </div>
                <Button type="button" onClick={handleAddRiskCategory} variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskCategories.map((category, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant="secondary">Category {index + 1}</Badge>
                      {riskCategories.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRiskCategory(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Category Name *</Label>
                        <Input
                          value={category.category_name}
                          onChange={(e) => {
                            const updated = [...riskCategories];
                            updated[index].category_name = e.target.value;
                            setRiskCategories(updated);
                          }}
                          placeholder="e.g., Operational Risk"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label>Category Type</Label>
                        <Select
                          value={category.category_type}
                          onValueChange={(value) => {
                            const updated = [...riskCategories];
                            updated[index].category_type = value as any;
                            setRiskCategories(updated);
                          }}
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
                      
                      <div>
                        <Label>Appetite Level</Label>
                        <Select
                          value={category.appetite_level}
                          onValueChange={(value) => {
                            const updated = [...riskCategories];
                            updated[index].appetite_level = value as any;
                            setRiskCategories(updated);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="averse">Risk Averse</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                            <SelectItem value="cautious">Cautious</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="seeking">Risk Seeking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label>Description *</Label>
                      <Textarea
                        value={category.description}
                        onChange={(e) => {
                          const updated = [...riskCategories];
                          updated[index].description = e.target.value;
                          setRiskCategories(updated);
                        }}
                        placeholder="Describe this risk category and its boundaries"
                        rows={2}
                        required
                      />
                    </div>
                    
                    <div className="mt-4">
                      <Label>Rationale</Label>
                      <Textarea
                        value={category.rationale}
                        onChange={(e) => {
                          const updated = [...riskCategories];
                          updated[index].rationale = e.target.value;
                          setRiskCategories(updated);
                        }}
                        placeholder="Explain the reasoning behind this appetite level"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Statement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
