
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
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';
import type { AutomationRule } from '@/types/organizational-intelligence';

interface IntelligentAutomationPanelProps {
  orgId: string;
}

const IntelligentAutomationPanel: React.FC<IntelligentAutomationPanelProps> = ({ orgId }) => {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomationRules();
  }, [orgId]);

  const loadAutomationRules = async () => {
    try {
      setLoading(true);
      
      // Mock automation rules - in real implementation, this would come from the database
      const mockRules: AutomationRule[] = [
        {
          id: 'auto-1',
          name: 'Risk Threshold Monitoring',
          description: 'Automatically alert when risk scores exceed acceptable thresholds',
          trigger_conditions: [
            { metric: 'risk_score', operator: 'gt', value: 75 }
          ],
          actions: [
            { type: 'alert', parameters: { recipients: ['risk-team'], severity: 'high' } },
            { type: 'escalate', parameters: { level: 2, department: 'risk_management' } }
          ],
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'auto-2',
          name: 'Compliance Violation Detection',
          description: 'Automatically detect and report compliance violations',
          trigger_conditions: [
            { metric: 'compliance_score', operator: 'lt', value: 80 }
          ],
          actions: [
            { type: 'alert', parameters: { recipients: ['compliance-team'], severity: 'critical' } },
            { type: 'report', parameters: { template: 'compliance_violation', frequency: 'immediate' } }
          ],
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'auto-3',
          name: 'Performance Optimization',
          description: 'Automatically optimize system performance based on usage patterns',
          trigger_conditions: [
            { metric: 'system_load', operator: 'gt', value: 85 }
          ],
          actions: [
            { type: 'remediate', parameters: { action: 'scale_resources', threshold: 90 } },
            { type: 'alert', parameters: { recipients: ['ops-team'], severity: 'medium' } }
          ],
          is_active: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'auto-4',
          name: 'Incident Response Automation',
          description: 'Automatically initiate incident response procedures',
          trigger_conditions: [
            { metric: 'incident_severity', operator: 'gte', value: 4 }
          ],
          actions: [
            { type: 'escalate', parameters: { level: 3, notify_executive: true } },
            { type: 'remediate', parameters: { action: 'activate_continuity_plan' } }
          ],
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      setAutomationRules(mockRules);
    } catch (error) {
      console.error('Error loading automation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: isActive } : rule
        )
      );
      
      // In real implementation, this would update the database
      console.log(`Automation rule ${ruleId} ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling automation rule:', error);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'alert': return AlertTriangle;
      case 'escalate': return TrendingUp;
      case 'remediate': return Settings;
      case 'report': return BarChart3;
      default: return Zap;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'alert': return 'text-yellow-600 bg-yellow-50';
      case 'escalate': return 'text-red-600 bg-red-50';
      case 'remediate': return 'text-blue-600 bg-blue-50';
      case 'report': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Zap className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p>Loading automation rules...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeRules = automationRules.filter(rule => rule.is_active).length;
  const totalActions = automationRules.reduce((sum, rule) => sum + rule.actions.length, 0);

  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            Intelligent Automation
          </CardTitle>
          <p className="text-sm text-gray-600">
            AI-powered automation rules for proactive risk and compliance management
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{activeRules}</div>
              <div className="text-sm text-gray-600">Active Rules</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalActions}</div>
              <div className="text-sm text-gray-600">Total Actions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-600">Monitoring</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">85%</div>
              <div className="text-sm text-gray-600">Efficiency Gain</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Automation Rules</CardTitle>
            <Button size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure Rules
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {automationRules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {rule.is_active ? (
                      <Play className="h-5 w-5 text-green-500" />
                    ) : (
                      <Pause className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-medium">{rule.name}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => toggleAutomationRule(rule.id, checked)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-sm mb-2">Trigger Conditions</h4>
                  <div className="space-y-1">
                    {rule.trigger_conditions.map((condition, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{condition.metric}</span>
                        <span className="mx-2">{condition.operator}</span>
                        <span className="font-medium">{condition.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Automated Actions</h4>
                  <div className="space-y-2">
                    {rule.actions.map((action, index) => {
                      const ActionIcon = getActionIcon(action.type);
                      return (
                        <div key={index} className={`flex items-center gap-2 text-sm p-2 rounded ${getActionColor(action.type)}`}>
                          <ActionIcon className="h-4 w-4" />
                          <span className="font-medium">{action.type.replace('_', ' ')}</span>
                          {action.parameters.severity && (
                            <Badge variant="outline" className="text-xs">
                              {action.parameters.severity}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created {new Date(rule.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>98.5% reliability</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-green-600">99.8%</div>
              <div className="text-sm text-gray-600">Uptime</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">1,247</div>
              <div className="text-sm text-gray-600">Actions Executed</div>
              <div className="text-xs text-gray-500 mt-1">This month</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-purple-600">2.3s</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
              <div className="text-xs text-gray-500 mt-1">From trigger to action</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentAutomationPanel;
