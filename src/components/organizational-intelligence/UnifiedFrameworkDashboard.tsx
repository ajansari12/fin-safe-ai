
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Network, 
  GitBranch,
  TrendingUp,
  Users,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Brain,
  RefreshCw
} from 'lucide-react';

interface FrameworkDependency {
  id: string;
  source_framework_id: string;
  source_framework_type: string;
  dependent_framework_id: string;
  dependent_framework_type: string;
  dependency_type: 'requires' | 'influences' | 'blocks' | 'enhances';
  dependency_strength: 'weak' | 'medium' | 'strong' | 'critical';
  dependency_description?: string;
  is_active: boolean;
}

interface FrameworkVersion {
  id: string;
  framework_id: string;
  framework_type: string;
  version_number: string;
  version_description?: string;
  change_summary: string[];
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected';
  deployment_status: 'pending' | 'deployed' | 'failed' | 'rolled_back';
  is_current_version: boolean;
  created_by_name?: string;
  approved_by_name?: string;
  created_at: string;
}

interface FrameworkEffectivenessMetric {
  id: string;
  framework_id: string;
  framework_type: string;
  metric_name: string;
  metric_category: string;
  measurement_date: string;
  metric_value: number;
  target_value?: number;
  variance_percentage?: number;
  trend_direction?: 'up' | 'down' | 'stable';
}

interface ImplementationFeedback {
  id: string;
  framework_id: string;
  framework_type: string;
  feedback_type: string;
  feedback_category: string;
  feedback_content: string;
  feedback_rating?: number;
  implementation_phase?: string;
  user_role?: string;
  submitted_by_name?: string;
  would_recommend?: boolean;
  status: 'active' | 'resolved' | 'archived';
  created_at: string;
}

interface UnifiedFrameworkDashboardProps {
  orgId: string;
}

const UnifiedFrameworkDashboard: React.FC<UnifiedFrameworkDashboardProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dependencies, setDependencies] = useState<FrameworkDependency[]>([]);
  const [versions, setVersions] = useState<FrameworkVersion[]>([]);
  const [effectiveness, setEffectiveness] = useState<FrameworkEffectivenessMetric[]>([]);
  const [feedback, setFeedback] = useState<ImplementationFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFrameworkData();
  }, [orgId]);

  const loadFrameworkData = async () => {
    setLoading(true);
    try {
      // Mock data for unified framework management
      const mockDependencies: FrameworkDependency[] = [
        {
          id: '1',
          source_framework_id: 'gov-001',
          source_framework_type: 'governance',
          dependent_framework_id: 'risk-001',
          dependent_framework_type: 'risk_appetite',
          dependency_type: 'requires',
          dependency_strength: 'strong',
          dependency_description: 'Risk appetite framework requires governance structure to be established',
          is_active: true
        },
        {
          id: '2',
          source_framework_id: 'risk-001',
          source_framework_type: 'risk_appetite',
          dependent_framework_id: 'ctrl-001',
          dependent_framework_type: 'control',
          dependency_type: 'influences',
          dependency_strength: 'medium',
          dependency_description: 'Control framework design influenced by risk appetite statements',
          is_active: true
        }
      ];

      const mockVersions: FrameworkVersion[] = [
        {
          id: '1',
          framework_id: 'gov-001',
          framework_type: 'governance',
          version_number: '2.1',
          version_description: 'Updated committee structures and reporting lines',
          change_summary: [
            'Added Technology Risk Committee',
            'Updated escalation procedures',
            'Enhanced board reporting requirements'
          ],
          approval_status: 'approved',
          deployment_status: 'deployed',
          is_current_version: true,
          created_by_name: 'Risk Manager',
          approved_by_name: 'Chief Risk Officer',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          framework_id: 'risk-001',
          framework_type: 'risk_appetite',
          version_number: '1.3',
          version_description: 'Quarterly risk threshold adjustments',
          change_summary: [
            'Updated operational risk thresholds',
            'Added ESG risk considerations',
            'Refined KRI definitions'
          ],
          approval_status: 'pending',
          deployment_status: 'pending',
          is_current_version: false,
          created_by_name: 'Risk Analyst',
          created_at: '2024-01-18T14:30:00Z'
        }
      ];

      const mockEffectiveness: FrameworkEffectivenessMetric[] = [
        {
          id: '1',
          framework_id: 'gov-001',
          framework_type: 'governance',
          metric_name: 'Policy Compliance Rate',
          metric_category: 'compliance',
          measurement_date: '2024-01-15',
          metric_value: 94.2,
          target_value: 95.0,
          variance_percentage: -0.8,
          trend_direction: 'up'
        },
        {
          id: '2',
          framework_id: 'risk-001',
          framework_type: 'risk_appetite',
          metric_name: 'Risk Threshold Breaches',
          metric_category: 'performance',
          measurement_date: '2024-01-15',
          metric_value: 3,
          target_value: 2,
          variance_percentage: 50,
          trend_direction: 'down'
        }
      ];

      const mockFeedback: ImplementationFeedback[] = [
        {
          id: '1',
          framework_id: 'gov-001',
          framework_type: 'governance',
          feedback_type: 'improvement',
          feedback_category: 'usability',
          feedback_content: 'The new committee structure has improved decision-making speed significantly',
          feedback_rating: 4,
          implementation_phase: 'post_deployment',
          user_role: 'manager',
          submitted_by_name: 'Operations Manager',
          would_recommend: true,
          status: 'active',
          created_at: '2024-01-16T09:00:00Z'
        },
        {
          id: '2',
          framework_id: 'risk-001',
          framework_type: 'risk_appetite',
          feedback_type: 'issue',
          feedback_category: 'functionality',
          feedback_content: 'Some KRI thresholds seem too sensitive, causing frequent false alarms',
          feedback_rating: 2,
          implementation_phase: 'deployment',
          user_role: 'analyst',
          submitted_by_name: 'Risk Analyst',
          would_recommend: false,
          status: 'active',
          created_at: '2024-01-17T11:30:00Z'
        }
      ];

      setDependencies(mockDependencies);
      setVersions(mockVersions);
      setEffectiveness(mockEffectiveness);
      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Error loading framework data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDependencyStrengthColor = (strength: string) => {
    switch (strength) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'strong': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          <Network className="h-8 w-8 text-indigo-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Unified Framework Management</h2>
            <p className="text-muted-foreground">
              Centralized framework orchestration, versioning, and continuous improvement
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Frameworks
          </Button>
          <Button className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Optimization
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Frameworks</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Network className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dependencies</p>
                <p className="text-2xl font-bold">{dependencies.filter(d => d.is_active).length}</p>
              </div>
              <GitBranch className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Effectiveness</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Satisfaction</p>
                <p className="text-2xl font-bold">4.2/5</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Framework Health Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Governance Framework</span>
                    <div className="flex items-center gap-2">
                      <Progress value={94} className="w-20 h-2" />
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Appetite Framework</span>
                    <div className="flex items-center gap-2">
                      <Progress value={87} className="w-20 h-2" />
                      <span className="text-sm font-medium">87%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Control Framework</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-20 h-2" />
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {versions.slice(0, 3).map((version) => (
                    <div key={version.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getApprovalStatusIcon(version.approval_status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {version.framework_type} v{version.version_number}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {version.approval_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {version.version_description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4">
          <div className="space-y-4">
            {dependencies.map((dependency) => (
              <Card key={dependency.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GitBranch className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {dependency.source_framework_type}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium capitalize">
                            {dependency.dependent_framework_type}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {dependency.dependency_description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {dependency.dependency_type}
                      </Badge>
                      <Badge className={getDependencyStrengthColor(dependency.dependency_strength)}>
                        {dependency.dependency_strength}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <div className="space-y-4">
            {versions.map((version) => (
              <Card key={version.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getApprovalStatusIcon(version.approval_status)}
                      <div>
                        <CardTitle className="text-lg capitalize">
                          {version.framework_type} Framework v{version.version_number}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">{version.version_description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{version.approval_status}</Badge>
                      <Badge variant="outline">{version.deployment_status}</Badge>
                      {version.is_current_version && (
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created By:</span>
                      <div className="font-medium">{version.created_by_name || 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Approved By:</span>
                      <div className="font-medium">{version.approved_by_name || 'Pending'}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Change Summary:</span>
                    <div className="mt-2 space-y-1">
                      {version.change_summary.map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {change}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    {version.approval_status === 'pending' && (
                      <Button size="sm">Review & Approve</Button>
                    )}
                    {version.deployment_status === 'pending' && version.approval_status === 'approved' && (
                      <Button size="sm">Deploy</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-4">
          <div className="space-y-4">
            {effectiveness.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{metric.metric_name}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {metric.framework_type} • {metric.metric_category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">{metric.metric_value}
                          {metric.metric_name.toLowerCase().includes('rate') && '%'}
                        </div>
                        {metric.target_value && (
                          <div className="text-sm text-muted-foreground">
                            Target: {metric.target_value}
                            {metric.metric_name.toLowerCase().includes('rate') && '%'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend_direction || 'stable')}
                        {metric.variance_percentage && (
                          <span className={`text-sm font-medium ${
                            metric.variance_percentage > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {metric.variance_percentage > 0 ? '+' : ''}{metric.variance_percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {item.framework_type} Framework Feedback
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">{item.feedback_type}</Badge>
                        <Badge variant="outline" className="capitalize">{item.feedback_category}</Badge>
                        {item.feedback_rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">Rating:</span>
                            <span className="font-medium">{item.feedback_rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{item.submitted_by_name}</div>
                      <div>{item.user_role}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.feedback_content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Phase: {item.implementation_phase}</span>
                      {item.would_recommend !== undefined && (
                        <span>• Would recommend: {item.would_recommend ? 'Yes' : 'No'}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Respond</Button>
                      <Button size="sm">Mark Resolved</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedFrameworkDashboard;
