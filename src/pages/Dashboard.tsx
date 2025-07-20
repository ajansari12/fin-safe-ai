
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, TrendingUp, Users, BarChart3, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "@/services/dashboard-analytics-service";
import IncidentTrendsChart from "@/components/dashboard/IncidentTrendsChart";
import KRIBreachesChart from "@/components/dashboard/KRIBreachesChart";
import RecentIncidents from "@/components/dashboard/RecentIncidents";
import ComplianceScoreCard from "@/components/dashboard/ComplianceScoreCard";
import KRICard from "@/components/dashboard/KRICard";
import { EnhancedAIInsights } from "@/components/analytics/EnhancedAIInsights";
import { useDetailModal } from "@/hooks/useDetailModal";
import DetailViewRouter from "@/components/common/DetailViewRouter";

const Dashboard = () => {
  const { user, userContext } = useAuth();
  const navigate = useNavigate();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const { modalState, openModal, closeModal } = useDetailModal();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboardMetrics', userContext?.organizationId],
    queryFn: () => getDashboardMetrics(userContext?.organizationId || ''),
    enabled: !!userContext?.organizationId
  });

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your operational risk management
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAIInsights(!showAIInsights)}
              variant={showAIInsights ? "default" : "outline"}
            >
              <Brain className="mr-2 h-4 w-4" />
              {showAIInsights ? 'Hide AI Insights' : 'Generate Insights'}
            </Button>
            <Button onClick={() => navigate('/app/analytics')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Advanced Analytics
            </Button>
          </div>
        </div>

        {/* AI Insights Section */}
        {showAIInsights && (
          <div className="mb-6">
            <EnhancedAIInsights />
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.total_incidents}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.high_severity_incidents} high severity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Controls</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.active_controls}</div>
                  <p className="text-xs text-muted-foreground">
                    of {metrics.total_controls} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">KRIs Monitored</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.total_kris}</div>
                  <p className="text-xs text-muted-foreground">
                    Key risk indicators
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Risk Vendors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.high_risk_vendors}</div>
                  <p className="text-xs text-muted-foreground">
                    of {metrics.total_vendors} vendors
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Enhanced Compliance Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Compliance Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComplianceScoreCard
              title="OSFI E-21"
              score={78}
              totalRequirements={45}
              compliantCount={35}
              trend="up"
              complianceType="OSFI E-21"
              lastAssessment="2024-06-15"
            />
            <ComplianceScoreCard
              title="Basel III"
              score={85}
              totalRequirements={32}
              compliantCount={27}
              trend="stable"
              complianceType="Basel III"
              lastAssessment="2024-05-20"
            />
            <ComplianceScoreCard
              title="PIPEDA"
              score={92}
              totalRequirements={18}
              compliantCount={16}
              trend="up"
              complianceType="PIPEDA"
              lastAssessment="2024-06-01"
            />
          </div>
        </div>

        {/* Enhanced KRI Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Key Risk Indicators</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <KRICard
              name="System Availability"
              currentValue={99.2}
              threshold={99.5}
              status="warning"
              trend="decreasing"
              unit="%"
              lastUpdated="2 hours ago"
            />
            <KRICard
              name="Processing Errors"
              currentValue={15}
              threshold={20}
              status="normal"
              trend="stable"
              unit=" per day"
              lastUpdated="1 hour ago"
            />
            <KRICard
              name="Third-Party SLA Breaches"
              currentValue={3}
              threshold={5}
              status="normal"
              trend="increasing"
              unit=" this month"
              lastUpdated="30 minutes ago"
            />
            <KRICard
              name="Data Quality Score"
              currentValue={87}
              threshold={90}
              status="warning"
              trend="stable"
              unit="%"
              lastUpdated="4 hours ago"
            />
            <KRICard
              name="Cyber Security Events"
              currentValue={12}
              threshold={10}
              status="critical"
              trend="increasing"
              unit=" this week"
              lastUpdated="15 minutes ago"
            />
            <KRICard
              name="Regulatory Changes"
              currentValue={2}
              threshold={5}
              status="normal"
              trend="stable"
              unit=" pending"
              lastUpdated="1 day ago"
            />
          </div>
        </div>

        {/* Charts Section - Now using full width */}
        <div className="grid gap-6 lg:grid-cols-2">
          <IncidentTrendsChart />
          <KRIBreachesChart />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentIncidents onViewDetails={openModal} />
          </CardContent>
        </Card>

        {/* Detail View Router */}
        <DetailViewRouter modalState={modalState} onClose={closeModal} />
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
