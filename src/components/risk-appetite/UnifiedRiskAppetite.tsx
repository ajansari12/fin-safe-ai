
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
import { useRiskAppetite } from '@/hooks/useRiskAppetite';
import { CreateStatementModal } from './CreateStatementModal';
import RiskAppetiteDashboard from './RiskAppetiteDashboard';
import AppetiteBreachAlerts from './AppetiteBreachAlerts';
import RiskPostureChart from './RiskPostureChart';
import TrendChart from './TrendChart';
import RiskPostureHeatmap from './RiskPostureHeatmap';
import EscalationWorkflow from './EscalationWorkflow';
import BoardReportGenerator from './BoardReportGenerator';
import RiskAppetiteDetailModal from './RiskAppetiteDetailModal';

const UnifiedRiskAppetite = () => {
  const { userContext } = useAuth();
  const { statements, isLoading, createStatement } = useRiskAppetite();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleCreateStatement = async (data: any) => {
    await createStatement(data);
    setIsCreateModalOpen(false);
  };

  const handleViewDetails = (statement: any) => {
    setSelectedStatement(statement);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header - Improved responsive design */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Risk Appetite Management</h2>
          <p className="text-muted-foreground">
            Comprehensive risk appetite framework with automated monitoring and OSFI E-21 compliance
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Statement
        </Button>
      </div>

      {/* Quick Stats - Improved responsive grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Statements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statements.filter(s => s.approval_status === 'approved').length}</div>
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
              85%
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
              {statements.length * 4}
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

      {/* Main Content Tabs - Improved responsive design */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-6 min-w-[600px] lg:min-w-0">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="statements" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Statements</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="escalation" className="flex items-center gap-2 text-xs sm:text-sm">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Escalation</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <RiskAppetiteDashboard />
        </TabsContent>

        <TabsContent value="statements" className="space-y-6">
          <div className="grid gap-4">
            {statements.map((statement) => (
              <Card key={statement.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{statement.statement_name}</CardTitle>
                      <CardDescription>
                        Effective: {new Date(statement.effective_date).toLocaleDateString()} - 
                        Review: {new Date(statement.review_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={getStatusColor(statement.approval_status)}>
                        {statement.approval_status.replace('_', ' ')}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(statement)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Risk Categories</p>
                      <p className="text-2xl font-bold">4</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Compliance Score</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">85%</p>
                        <Progress value={85} className="flex-1" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {statement.approval_status.replace('_', ' ')}
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

      {/* Detail Modal */}
      <RiskAppetiteDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        statement={selectedStatement}
      />
    </div>
  );
};

export default UnifiedRiskAppetite;
