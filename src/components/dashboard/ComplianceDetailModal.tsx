
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ComplianceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  complianceType: string;
  title: string;
}

const ComplianceDetailModal: React.FC<ComplianceDetailModalProps> = ({
  isOpen,
  onClose,
  complianceType,
  title
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - would come from real compliance service
  const complianceData = {
    overall_score: 78,
    total_requirements: 45,
    compliant: 35,
    in_progress: 7,
    overdue: 3,
    last_assessment: '2024-06-15',
    next_review: '2024-09-15'
  };

  const principleBreakdown = [
    { name: 'Governance', score: 85, status: 'compliant', requirements: 8, completed: 7 },
    { name: 'Risk Management', score: 72, status: 'in_progress', requirements: 12, completed: 9 },
    { name: 'Controls', score: 90, status: 'compliant', requirements: 10, completed: 10 },
    { name: 'Monitoring', score: 65, status: 'attention', requirements: 8, completed: 5 },
    { name: 'Reporting', score: 80, status: 'compliant', requirements: 7, completed: 6 }
  ];

  const gapAnalysis = [
    {
      area: 'Operational Risk Management',
      gap: 'Lack of automated monitoring for third-party risks',
      impact: 'High',
      timeline: '30 days',
      status: 'in_progress'
    },
    {
      area: 'Business Continuity Planning',
      gap: 'Missing scenario testing documentation',
      impact: 'Medium',
      timeline: '60 days',
      status: 'planned'
    },
    {
      area: 'Regulatory Reporting',
      gap: 'Manual data aggregation processes',
      impact: 'Medium',
      timeline: '90 days',
      status: 'identified'
    }
  ];

  const chartData = principleBreakdown.map(item => ({
    name: item.name,
    score: item.score,
    fill: item.status === 'compliant' ? '#10b981' : 
          item.status === 'in_progress' ? '#f59e0b' : '#ef4444'
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'attention': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title} Compliance Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of {complianceType} compliance status and requirements
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="principles">Principles</TabsTrigger>
            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
            <TabsTrigger value="actions">Action Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Overall Score</p>
                      <p className="text-2xl font-bold text-green-600">{complianceData.overall_score}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Compliant</p>
                      <p className="text-2xl font-bold">{complianceData.compliant}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">In Progress</p>
                      <p className="text-2xl font-bold">{complianceData.in_progress}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Overdue</p>
                      <p className="text-2xl font-bold">{complianceData.overdue}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assessment Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Assessment</span>
                    <Badge variant="outline">{complianceData.last_assessment}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Review</span>
                    <Badge variant="default">{complianceData.next_review}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assessment Frequency</span>
                    <Badge variant="secondary">Quarterly</Badge>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm font-medium mb-2">Progress to Next Review</p>
                    <Progress value={65} />
                    <p className="text-xs text-muted-foreground mt-1">65 days remaining</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="principles" className="space-y-4">
            <div className="grid gap-4">
              {principleBreakdown.map((principle, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{principle.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={principle.status === 'compliant' ? 'default' : 'secondary'}
                          className={getStatusColor(principle.status)}
                        >
                          {principle.status}
                        </Badge>
                        <span className="text-sm font-medium">{principle.score}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Progress value={principle.score} />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{principle.completed}/{principle.requirements} requirements completed</span>
                        <span>{principle.requirements - principle.completed} remaining</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            <div className="grid gap-4">
              {gapAnalysis.map((gap, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{gap.area}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{gap.gap}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant={getImpactColor(gap.impact)}>
                          {gap.impact} Impact
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          {gap.timeline}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        gap.status === 'in_progress' ? 'default' :
                        gap.status === 'planned' ? 'secondary' : 'outline'
                      }>
                        {gap.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Remediation Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium">Immediate Actions (Next 30 days)</h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Implement automated third-party risk monitoring</li>
                      <li>• Complete outstanding operational risk assessments</li>
                      <li>• Update business continuity testing documentation</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium">Short-term Actions (Next 90 days)</h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Enhance regulatory reporting automation</li>
                      <li>• Conduct comprehensive control testing</li>
                      <li>• Implement continuous monitoring framework</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Long-term Initiatives (6+ months)</h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Full regulatory technology platform implementation</li>
                      <li>• Advanced analytics and AI integration</li>
                      <li>• Industry benchmark analysis and optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceDetailModal;
