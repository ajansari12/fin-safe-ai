
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Settings, 
  Play, 
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Target,
  Bell
} from 'lucide-react';
import { intelligentAutomationEngine } from '@/services/intelligent-automation-engine';
import { AutomationRule } from '@/types/organizational-intelligence';
import { toast } from '@/hooks/use-toast';

interface IntelligentAutomationPanelProps {
  orgId: string;
}

const IntelligentAutomationPanel: React.FC<IntelligentAutomationPanelProps> = ({ 
  orgId 
}) => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [availableRules, setAvailableRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [implementingRules, setImplementingRules] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAutomationData();
  }, [orgId]);

  const loadAutomationData = async () => {
    setLoading(true);
    try {
      const [activeRules, opportunities] = await Promise.all([
        intelligentAutomationEngine.getActiveRules(orgId),
        intelligentAutomationEngine.analyzeAutomationOpportunities(orgId)
      ]);

      setAutomationRules(activeRules);
      setAvailableRules(opportunities.filter(rule => 
        !activeRules.some(active => active.name === rule.name)
      ));
    } catch (error) {
      console.error('Error loading automation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImplementRule = async (rule: AutomationRule) => {
    setImplementingRules(prev => new Set([...prev, rule.id]));
    
    try {
      const success = await intelligentAutomationEngine.implementAutomationRule(rule);
      
      if (success) {
        setAutomationRules(prev => [...prev, rule]);
        setAvailableRules(prev => prev.filter(r => r.id !== rule.id));
        
        toast({
          title: "Automation Rule Implemented",
          description: `${rule.name} has been successfully activated.`
        });
      } else {
        toast({
          title: "Implementation Failed",
          description: "Failed to implement the automation rule. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error implementing rule:', error);
      toast({
        title: "Implementation Error",
        description: "An error occurred while implementing the rule.",
        variant: "destructive"
      });
    } finally {
      setImplementingRules(prev => {
        const newSet = new Set(prev);
        newSet.delete(rule.id);
        return newSet;
      });
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    // Implementation would update the rule status in the database
    console.log(`Toggling rule ${ruleId} to ${isActive ? 'active' : 'inactive'}`);
  };

  const getRuleIcon = (ruleName: string) => {
    if (ruleName.includes('Risk')) return Target;
    if (ruleName.includes('Compliance')) return CheckCircle;
    if (ruleName.includes('Incident')) return AlertTriangle;
    if (ruleName.includes('KRI')) return BarChart3;
    return Settings;
  };

  const getRuleColor = (ruleName: string) => {
    if (ruleName.includes('Risk')) return 'text-red-500';
    if (ruleName.includes('Compliance')) return 'text-green-500';
    if (ruleName.includes('Incident')) return 'text-orange-500';
    if (ruleName.includes('KRI')) return 'text-blue-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Intelligent Automation</h2>
            <p className="text-muted-foreground">
              AI-powered automation rules and workflows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {automationRules.length} Active Rules
          </Badge>
          <Button onClick={loadAutomationData} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Automation Rules */}
      {automationRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Active Automation Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automationRules.map((rule) => {
                const IconComponent = getRuleIcon(rule.name);
                
                return (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`h-6 w-6 ${getRuleColor(rule.name)} mt-0.5`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rule.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            Triggers: {rule.trigger_conditions.length}
                          </span>
                          <span>
                            Actions: {rule.actions.length}
                          </span>
                          <span>
                            Created: {new Date(rule.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Automation Opportunities */}
      {availableRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Recommended Automation Opportunities
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              AI-identified opportunities to automate manual processes
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableRules.map((rule) => {
                const IconComponent = getRuleIcon(rule.name);
                const isImplementing = implementingRules.has(rule.id);
                
                return (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <IconComponent className={`h-6 w-6 ${getRuleColor(rule.name)} mt-0.5`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.description}
                          </p>
                          
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-sm font-medium">Trigger Conditions:</span>
                              <ul className="text-sm text-muted-foreground mt-1 ml-4">
                                {rule.trigger_conditions.map((condition, index) => (
                                  <li key={index}>
                                    • {condition.metric} {condition.operator} {condition.value}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium">Automated Actions:</span>
                              <ul className="text-sm text-muted-foreground mt-1 ml-4">
                                {rule.actions.map((action, index) => (
                                  <li key={index}>
                                    • {action.type}: {JSON.stringify(action.parameters).slice(0, 50)}...
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleImplementRule(rule)}
                        disabled={isImplementing}
                        className="ml-4"
                      >
                        {isImplementing ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Implementing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Implement
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {automationRules.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Rules</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {availableRules.length}
              </div>
              <div className="text-sm text-muted-foreground">Opportunities</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((automationRules.length / (automationRules.length + availableRules.length)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Automation Coverage</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">Monitoring Active</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentAutomationPanel;
