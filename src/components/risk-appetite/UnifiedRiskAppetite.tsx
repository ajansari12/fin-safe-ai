
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlusCircle, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Settings,
  FileText,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { CreateStatementModal } from './CreateStatementModal';
import RiskAppetiteDashboard from './RiskAppetiteDashboard';
import AppetiteBreachAlerts from './AppetiteBreachAlerts';
import RiskPostureChart from './RiskPostureChart';
import TrendChart from './TrendChart';
import RiskPostureHeatmap from './RiskPostureHeatmap';
import EscalationWorkflow from './EscalationWorkflow';
import BoardReportGenerator from './BoardReportGenerator';

const UnifiedRiskAppetite = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statements, setStatements] = useState([]);

  // Mock data for demonstration
  const mockStatements = [
    {
      id: '1',
      name: 'Annual Risk Appetite Statement 2024',
      status: 'active',
      effectiveDate: '2024-01-01',
      reviewDate: '2024-12-31',
      categoriesCount: 6,
      complianceScore: 85
    },
    {
      id: '2',
      name: 'Operational Risk Appetite 2024',
      status: 'draft',
      effectiveDate: '2024-07-01',
      reviewDate: '2024-06-30',
      categoriesCount: 4,
      complianceScore: 72
    }
  ];

  useEffect(() => {
    setStatements(mockStatements);
  }, []);

  const handleCreateStatement = (data: any) => {
    const newStatement = {
      id: Date.now().toString(),
      name: data.statementName,
      status: 'draft',
      effectiveDate: data.effectiveDate,
      reviewDate: new Date(new Date(data.effectiveDate).setFullYear(new Date(data.effectiveDate).getFullYear() + 1)).toISOString().split('T')[0],
      categoriesCount: data.riskCategories.length,
      complianceScore: Math.floor(Math.random() * 30) + 70
    };
    setStatements([...statements, newStatement]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Risk Appetite Management</h2>
          <p className="text-muted-foreground">
            Comprehensive risk appetite framework with automated monitoring and OSFI E-21 compliance
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Statement
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Statements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statements.filter(s => s.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {statements.length} total statements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statements.length > 0 ? Math.round(statements.reduce((acc, s) => acc + s.complianceScore, 0) / statements.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              OSFI E-21 compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Categories</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statements.reduce((acc, s) => acc + s.categoriesCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all statements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Statements
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="escalation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Escalation
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <RiskAppetiteDashboard />
        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          <div className="grid gap-4">
            {statements.map((statement) => (
              <Card key={statement.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{statement.name}</CardTitle>
                      <CardDescription>
                        Effective: {new Date(statement.effectiveDate).toLocaleDateString()} - 
                        Review: {new Date(statement.reviewDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(statement.status)}>
                        {statement.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Risk Categories</p>
                      <p className="text-2xl font-bold">{statement.categoriesCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Compliance Score</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">{statement.complianceScore}%</p>
                        <Progress value={statement.complianceScore} className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {statement.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {statements.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Risk Appetite Statements</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first risk appetite statement to get started with comprehensive risk management.
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Statement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TrendChart />
            <RiskPostureChart />
          </div>
          <RiskPostureHeatmap />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AppetiteBreachAlerts />
        </TabsContent>

        <TabsContent value="escalation" className="space-y-6">
          <EscalationWorkflow />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <BoardReportGenerator />
        </TabsContent>
      </Tabs>

      {/* Create Statement Modal */}
      <CreateStatementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateStatement}
      />
    </div>
  );
};

export default UnifiedRiskAppetite;
