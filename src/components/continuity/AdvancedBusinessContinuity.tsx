import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  TestTube, 
  Calendar, 
  Clock, 
  Play,
  Pause,
  RotateCcw,
  FileText,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ContinuityScenario {
  id: string;
  scenario_name: string;
  scenario_type: string;
  severity_level: string;
  scenario_description: string;
  trigger_conditions: any[];
  impact_assessment: any;
  response_procedures: any[];
  recovery_objectives: any;
  testing_frequency_days: number;
  last_tested_date?: string;
  next_test_date?: string;
  test_results?: any;
  lessons_learned?: string;
  scenario_status: string;
  created_at: string;
}

const AdvancedBusinessContinuity: React.FC = () => {
  const [scenarios, setScenarios] = useState<ContinuityScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ContinuityScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testingScenario, setTestingScenario] = useState<string | null>(null);
  const { toast } = useToast();

  const scenarioTypes = [
    { value: 'cyber_attack', label: 'Cyber Attack', color: 'text-red-600 bg-red-50' },
    { value: 'natural_disaster', label: 'Natural Disaster', color: 'text-orange-600 bg-orange-50' },
    { value: 'pandemic', label: 'Pandemic', color: 'text-purple-600 bg-purple-50' },
    { value: 'technology_failure', label: 'Technology Failure', color: 'text-blue-600 bg-blue-50' },
    { value: 'key_personnel_loss', label: 'Key Personnel Loss', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'third_party_failure', label: 'Third Party Failure', color: 'text-gray-600 bg-gray-50' }
  ];

  const severityLevels = [
    { value: 'minor', label: 'Minor', color: 'bg-green-500' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500' },
    { value: 'major', label: 'Major', color: 'bg-orange-500' },
    { value: 'severe', label: 'Severe', color: 'bg-red-500' },
    { value: 'catastrophic', label: 'Catastrophic', color: 'bg-purple-500' }
  ];

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_continuity_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScenarios(data || []);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to load business continuity scenarios",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createScenario = async (scenarioData: Partial<ContinuityScenario>) => {
    try {
      const { error } = await supabase
        .from('business_continuity_scenarios')
        .insert([{
          ...scenarioData,
          trigger_conditions: scenarioData.trigger_conditions || [],
          impact_assessment: scenarioData.impact_assessment || {},
          response_procedures: scenarioData.response_procedures || [],
          recovery_objectives: scenarioData.recovery_objectives || {}
        }]);

      if (error) throw error;

      toast({
        title: "Scenario Created",
        description: "New business continuity scenario has been created"
      });

      setShowCreateDialog(false);
      loadScenarios();
    } catch (error) {
      console.error('Error creating scenario:', error);
      toast({
        title: "Error",
        description: "Failed to create scenario",
        variant: "destructive"
      });
    }
  };

  const executeScenarioTest = async (scenarioId: string) => {
    try {
      setTestingScenario(scenarioId);
      
      // Simulate scenario testing process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const testResults = {
        test_date: new Date().toISOString(),
        test_duration_minutes: Math.floor(Math.random() * 120) + 30,
        participants: Math.floor(Math.random() * 10) + 5,
        objectives_met: Math.floor(Math.random() * 100) + 70,
        issues_identified: Math.floor(Math.random() * 5),
        rto_achieved: Math.random() > 0.3,
        overall_score: Math.floor(Math.random() * 30) + 70
      };

      const { error } = await supabase
        .from('business_continuity_scenarios')
        .update({
          test_results: testResults,
          last_tested_date: new Date().toISOString().split('T')[0],
          next_test_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
        .eq('id', scenarioId);

      if (error) throw error;

      toast({
        title: "Test Completed",
        description: `Scenario test completed with score: ${testResults.overall_score}%`
      });

      loadScenarios();
    } catch (error) {
      console.error('Error executing test:', error);
      toast({
        title: "Error",
        description: "Failed to execute scenario test",
        variant: "destructive"
      });
    } finally {
      setTestingScenario(null);
    }
  };

  const getScenarioTypeColor = (type: string) => {
    const scenarioType = scenarioTypes.find(st => st.value === type);
    return scenarioType ? scenarioType.color : 'text-gray-600 bg-gray-50';
  };

  const getSeverityColor = (severity: string) => {
    const severityLevel = severityLevels.find(sl => sl.value === severity);
    return severityLevel ? severityLevel.color : 'bg-gray-500';
  };

  const getDaysUntilTest = (nextTestDate?: string) => {
    if (!nextTestDate) return null;
    const nextTest = new Date(nextTestDate);
    const now = new Date();
    const diffTime = nextTest.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Business Continuity</h1>
          <p className="text-muted-foreground">
            Comprehensive scenario testing and recovery planning
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Business Continuity Scenario</DialogTitle>
              <DialogDescription>
                Define a new scenario for business continuity testing
              </DialogDescription>
            </DialogHeader>
            <ScenarioForm onSubmit={createScenario} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scenarios</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scenarios.length}</div>
            <p className="text-xs text-muted-foreground">Active continuity scenarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Due</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {scenarios.filter(s => {
                const daysUntilTest = getDaysUntilTest(s.next_test_date);
                return daysUntilTest !== null && daysUntilTest <= 7;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Scenarios</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {scenarios.filter(s => ['severe', 'catastrophic'].includes(s.severity_level)).length}
            </div>
            <p className="text-xs text-muted-foreground">High impact scenarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Test Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scenarios.filter(s => s.test_results?.overall_score).length > 0
                ? Math.round(
                    scenarios
                      .filter(s => s.test_results?.overall_score)
                      .reduce((sum, s) => sum + s.test_results.overall_score, 0) /
                    scenarios.filter(s => s.test_results?.overall_score).length
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Latest test results</p>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const daysUntilTest = getDaysUntilTest(scenario.next_test_date);
          const isTestDue = daysUntilTest !== null && daysUntilTest <= 0;
          const isTestingSoon = daysUntilTest !== null && daysUntilTest <= 7 && daysUntilTest > 0;

          return (
            <Card key={scenario.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`px-2 py-1 rounded-full text-xs ${getScenarioTypeColor(scenario.scenario_type)}`}>
                    {scenarioTypes.find(st => st.value === scenario.scenario_type)?.label}
                  </div>
                  <Badge className={getSeverityColor(scenario.severity_level)}>
                    {scenario.severity_level}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{scenario.scenario_name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {scenario.scenario_description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Test Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Last Tested:</span>
                    <span className="text-muted-foreground">
                      {scenario.last_tested_date 
                        ? format(new Date(scenario.last_tested_date), 'MMM dd, yyyy')
                        : 'Never'
                      }
                    </span>
                  </div>
                  
                  {scenario.next_test_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Next Test:</span>
                      <span className={`${isTestDue ? 'text-red-600 font-medium' : isTestingSoon ? 'text-orange-600' : 'text-muted-foreground'}`}>
                        {isTestDue ? 'Overdue' : 
                         isTestingSoon ? `${daysUntilTest} days` :
                         format(new Date(scenario.next_test_date), 'MMM dd, yyyy')
                        }
                      </span>
                    </div>
                  )}
                  
                  {scenario.test_results?.overall_score && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Last Score:</span>
                        <span className="font-medium">{scenario.test_results.overall_score}%</span>
                      </div>
                      <Progress value={scenario.test_results.overall_score} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => executeScenarioTest(scenario.id)}
                    disabled={testingScenario === scenario.id}
                  >
                    {testingScenario === scenario.id ? (
                      <>
                        <div className="animate-spin h-3 w-3 mr-1 border border-white border-t-transparent rounded-full" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-3 w-3 mr-1" />
                        Test
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                </div>

                {/* Status Indicators */}
                {isTestDue && (
                  <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 p-2 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    Test overdue
                  </div>
                )}
                
                {isTestingSoon && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    <Clock className="h-3 w-3" />
                    Test due soon
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {scenarios.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No scenarios found</h3>
            <p className="text-sm mb-4">Create your first business continuity scenario to get started.</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Shield className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Scenario Form Component
const ScenarioForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    scenario_name: '',
    scenario_type: '',
    severity_level: '',
    scenario_description: '',
    testing_frequency_days: 90
  });

  const scenarioTypes = [
    { value: 'cyber_attack', label: 'Cyber Attack' },
    { value: 'natural_disaster', label: 'Natural Disaster' },
    { value: 'pandemic', label: 'Pandemic' },
    { value: 'technology_failure', label: 'Technology Failure' },
    { value: 'key_personnel_loss', label: 'Key Personnel Loss' },
    { value: 'third_party_failure', label: 'Third Party Failure' }
  ];

  const severityLevels = [
    { value: 'minor', label: 'Minor' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'major', label: 'Major' },
    { value: 'severe', label: 'Severe' },
    { value: 'catastrophic', label: 'Catastrophic' }
  ];

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Scenario Name</label>
        <Input
          placeholder="e.g., Ransomware Attack Response"
          value={formData.scenario_name}
          onChange={(e) => setFormData(prev => ({ ...prev, scenario_name: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Scenario Type</label>
          <Select 
            value={formData.scenario_type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, scenario_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {scenarioTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Severity Level</label>
          <Select 
            value={formData.severity_level} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, severity_level: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {severityLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          placeholder="Describe the scenario and its potential impact..."
          value={formData.scenario_description}
          onChange={(e) => setFormData(prev => ({ ...prev, scenario_description: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Testing Frequency (days)</label>
        <Input
          type="number"
          value={formData.testing_frequency_days}
          onChange={(e) => setFormData(prev => ({ ...prev, testing_frequency_days: parseInt(e.target.value) }))}
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>Create Scenario</Button>
      </div>
    </div>
  );
};

export default AdvancedBusinessContinuity;