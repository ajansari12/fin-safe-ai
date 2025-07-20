import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Trash2,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ValidationRule {
  id: string;
  name: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'format' | 'business_logic';
  severity: 'error' | 'warning' | 'info';
  condition: string;
  errorMessage: string;
  autoRemediation: boolean;
  isActive: boolean;
  executionCount: number;
  passRate: number;
  description: string;
}

const ValidationRulesManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual service call
  const validationRules: ValidationRule[] = [
    {
      id: '1',
      name: 'KRI Value Completeness',
      type: 'completeness',
      severity: 'error',
      condition: 'kri_value IS NOT NULL AND kri_value != ""',
      errorMessage: 'KRI value is required and cannot be empty',
      autoRemediation: false,
      isActive: true,
      executionCount: 45,
      passRate: 98.5,
      description: 'Ensures all KRI entries have valid values'
    },
    {
      id: '2',
      name: 'Date Range Validation',
      type: 'business_logic',
      severity: 'error',
      condition: 'reporting_period_start < reporting_period_end',
      errorMessage: 'Start date must be before end date',
      autoRemediation: false,
      isActive: true,
      executionCount: 32,
      passRate: 100,
      description: 'Validates that reporting periods have logical date ranges'
    },
    {
      id: '3',
      name: 'Currency Format Check',
      type: 'format',
      severity: 'warning',
      condition: 'amount REGEXP "^[0-9]+\\.?[0-9]*$"',
      errorMessage: 'Amount must be in valid currency format',
      autoRemediation: true,
      isActive: true,
      executionCount: 67,
      passRate: 94.2,
      description: 'Ensures monetary amounts are properly formatted'
    },
    {
      id: '4',
      name: 'Threshold Breach Consistency',
      type: 'consistency',
      severity: 'warning',
      condition: 'breach_severity MATCHES actual_value_vs_threshold',
      errorMessage: 'Breach severity inconsistent with actual threshold comparison',
      autoRemediation: true,
      isActive: true,
      executionCount: 23,
      passRate: 89.7,
      description: 'Checks consistency between breach severity and actual threshold values'
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variant = severity === 'error' ? 'destructive' : severity === 'warning' ? 'default' : 'secondary';
    return <Badge variant={variant}>{severity}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'completeness':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'accuracy':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'consistency':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'format':
        return <Settings className="h-4 w-4 text-orange-500" />;
      case 'business_logic':
        return <Zap className="h-4 w-4 text-pink-500" />;
      default:
        return <FileCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCreateRule = (formData: FormData) => {
    const ruleData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      severity: formData.get('severity') as string,
      condition: formData.get('condition') as string,
      errorMessage: formData.get('errorMessage') as string,
      description: formData.get('description') as string,
      autoRemediation: formData.get('autoRemediation') === 'on',
    };

    // Mock creation - replace with actual service call
    toast({
      title: "Validation rule created",
      description: "New validation rule has been created successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleToggleRule = (ruleId: string) => {
    toast({
      title: "Rule updated",
      description: "Validation rule status has been updated.",
    });
  };

  const handleTestRule = (ruleId: string) => {
    toast({
      title: "Rule test initiated",
      description: "Testing validation rule against current data set.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Validation Rules</h2>
          <p className="text-muted-foreground">
            Manage data validation rules for automated report generation
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Validation Rule</DialogTitle>
              <DialogDescription>
                Define a new validation rule for automated data quality checks.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateRule(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Data Completeness Check"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Rule Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completeness">Completeness</SelectItem>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="consistency">Consistency</SelectItem>
                      <SelectItem value="format">Format</SelectItem>
                      <SelectItem value="business_logic">Business Logic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level</Label>
                <Select name="severity" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Validation Condition</Label>
                <Textarea
                  id="condition"
                  name="condition"
                  placeholder="value IS NOT NULL AND value > 0"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="errorMessage">Error Message</Label>
                <Input
                  id="errorMessage"
                  name="errorMessage"
                  placeholder="Value must be greater than zero"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what this rule validates..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="autoRemediation" name="autoRemediation" />
                <Label htmlFor="autoRemediation">Enable Auto-Remediation</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Rule</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Validation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validationRules.length}</div>
            <p className="text-xs text-muted-foreground">
              Active validation rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(validationRules.reduce((sum, r) => sum + r.passRate, 0) / validationRules.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average validation success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {validationRules.reduce((sum, r) => sum + r.executionCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total rule executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Remediation</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {validationRules.filter(r => r.autoRemediation).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Rules with auto-fix enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Rules List */}
      <div className="grid gap-4">
        {validationRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(rule.type)}
                  <div>
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityIcon(rule.severity)}
                  {getSeverityBadge(rule.severity)}
                  {rule.autoRemediation && (
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      Auto-Fix
                    </Badge>
                  )}
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggleRule(rule.id)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestRule(rule.id)}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Validation Condition:</p>
                  <code className="text-xs">{rule.condition}</code>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Rule Type</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {rule.type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Executions</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.executionCount} times
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pass Rate</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.passRate}% success
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Error Message</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ValidationRulesManager;