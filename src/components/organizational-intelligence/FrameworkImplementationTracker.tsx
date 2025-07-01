
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar,
  TrendingUp,
  Target,
  FileText,
  Settings
} from 'lucide-react';

interface FrameworkImplementationTrackerProps {
  orgId: string;
  frameworkId?: string;
}

const FrameworkImplementationTracker: React.FC<FrameworkImplementationTrackerProps> = ({ 
  orgId, 
  frameworkId 
}) => {
  const [implementations, setImplementations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImplementations();
  }, [orgId, frameworkId]);

  const loadImplementations = async () => {
    setLoading(true);
    // Mock implementation data - replace with actual API call
    setTimeout(() => {
      setImplementations([
        {
          id: '1',
          framework_name: 'Governance Structure Framework',
          framework_type: 'governance',
          status: 'in_progress',
          progress: 65,
          start_date: '2024-01-15',
          target_date: '2024-04-15',
          assigned_team: 'Governance Team',
          milestones: [
            { name: 'Board Structure Design', status: 'completed', due_date: '2024-02-01' },
            { name: 'Committee Charters', status: 'in_progress', due_date: '2024-02-15' },
            { name: 'Policy Framework', status: 'pending', due_date: '2024-03-01' },
            { name: 'Training & Rollout', status: 'pending', due_date: '2024-03-30' }
          ],
          components_completed: 8,
          total_components: 12,
          risk_level: 'low'
        },
        {
          id: '2',
          framework_name: 'Risk Appetite Framework',
          framework_type: 'risk_appetite',
          status: 'planning',
          progress: 25,
          start_date: '2024-02-01',
          target_date: '2024-05-01',
          assigned_team: 'Risk Management',
          milestones: [
            { name: 'Risk Categories Definition', status: 'completed', due_date: '2024-02-15' },
            { name: 'Threshold Setting', status: 'in_progress', due_date: '2024-03-01' },
            { name: 'KRI Implementation', status: 'pending', due_date: '2024-03-30' },
            { name: 'Board Approval', status: 'pending', due_date: '2024-04-20' }
          ],
          components_completed: 3,
          total_components: 15,
          risk_level: 'medium'
        },
        {
          id: '3',
          framework_name: 'Control Framework',
          framework_type: 'control',
          status: 'completed',
          progress: 100,
          start_date: '2023-11-01',
          target_date: '2024-01-31',
          assigned_team: 'Internal Audit',
          milestones: [
            { name: 'Control Design', status: 'completed', due_date: '2023-12-01' },
            { name: 'Implementation', status: 'completed', due_date: '2023-12-30' },
            { name: 'Testing', status: 'completed', due_date: '2024-01-15' },
            { name: 'Documentation', status: 'completed', due_date: '2024-01-30' }
          ],
          components_completed: 25,
          total_components: 25,
          risk_level: 'low'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Settings;
      case 'planning': return Clock;
      case 'at_risk': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in_progress': return 'text-blue-500';
      case 'planning': return 'text-yellow-500';
      case 'at_risk': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'pending': return 'text-gray-500';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const calculateOverallProgress = () => {
    if (implementations.length === 0) return 0;
    const totalProgress = implementations.reduce((sum, impl) => sum + impl.progress, 0);
    return Math.round(totalProgress / implementations.length);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Implementation Tracker</h2>
            <p className="text-muted-foreground">Loading implementation progress...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Implementation Tracker</h2>
            <p className="text-muted-foreground">
              Monitor framework implementation progress and milestones
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {calculateOverallProgress()}%
          </div>
          <div className="text-sm text-muted-foreground">Overall Progress</div>
        </div>
      </div>

      {/* Overall Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {implementations.filter(i => i.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {implementations.filter(i => i.status === 'in_progress').length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {implementations.filter(i => i.status === 'planning').length}
              </div>
              <div className="text-sm text-muted-foreground">Planning</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {implementations.filter(i => i.risk_level === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">At Risk</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{calculateOverallProgress()}%</span>
            </div>
            <Progress value={calculateOverallProgress()} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Progress</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {implementations.map((impl) => {
              const StatusIcon = getStatusIcon(impl.status);
              
              return (
                <Card key={impl.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-6 w-6 ${getStatusColor(impl.status)}`} />
                        <div>
                          <CardTitle className="text-lg">{impl.framework_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {impl.assigned_team} • Started {new Date(impl.start_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadgeColor(impl.status)}>
                          {impl.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getRiskBadgeColor(impl.risk_level)}>
                          {impl.risk_level} risk
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{impl.progress}%</span>
                      </div>
                      <Progress value={impl.progress} className="w-full" />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {impl.components_completed}/{impl.total_components} Components
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">
                          Due {new Date(impl.target_date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">{impl.assigned_team}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {implementations.map((impl) => (
            <Card key={impl.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {impl.framework_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div>Start Date: {new Date(impl.start_date).toLocaleDateString()}</div>
                      <div>Target Date: {new Date(impl.target_date).toLocaleDateString()}</div>
                      <div>Days Remaining: {Math.ceil((new Date(impl.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Team & Resources</h4>
                    <div className="space-y-2 text-sm">
                      <div>Assigned Team: {impl.assigned_team}</div>
                      <div>Components: {impl.components_completed}/{impl.total_components}</div>
                      <div>Risk Level: <Badge className={getRiskBadgeColor(impl.risk_level)}>{impl.risk_level}</Badge></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Implementation Progress</span>
                    <span className="text-sm text-muted-foreground">{impl.progress}%</span>
                  </div>
                  <Progress value={impl.progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          {implementations.map((impl) => (
            <Card key={impl.id}>
              <CardHeader>
                <CardTitle>{impl.framework_name} - Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {impl.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{milestone.name}</h5>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={getMilestoneStatusColor(milestone.status)}
                            >
                              {milestone.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(milestone.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FrameworkImplementationTracker;
