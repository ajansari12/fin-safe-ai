
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import { OrgProvider } from './contexts/OrgContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { GlobalErrorBoundary } from './components/error/GlobalErrorBoundary';
import { RouteErrorBoundary } from './components/error/RouteErrorBoundary';
import EnhancedProtectedRoute from './components/auth/EnhancedProtectedRoute';
import AuthPage from './pages/auth/AuthPage';
import IndexPage from './pages/Index';
import DashboardPage from './pages/Dashboard';
import ThirdPartyRiskPage from './pages/ThirdPartyRisk';
import ScenarioTestingPage from './pages/ScenarioTesting';
import IntegrationsPage from './pages/Integrations';
import GovernanceFrameworkPage from './pages/GovernanceFramework';
import RiskAppetitePage from './pages/RiskAppetite';
import ImpactTolerancesPage from './pages/ImpactTolerances';
import BusinessFunctionsPage from './pages/BusinessFunctions';
import DependenciesPage from './pages/Dependencies';
import ToleranceFrameworkPage from './pages/ToleranceFramework';
import ControlsAndKriPage from './pages/ControlsAndKri';
import IncidentLogPage from './pages/IncidentLog';
import BusinessContinuityPage from './pages/BusinessContinuity';
import AuditAndCompliancePage from './pages/AuditAndCompliance';
import DocumentManagementPage from './pages/DocumentManagement';
import WorkflowCenterPage from './pages/WorkflowCenter';
import DependencyMappingPage from './pages/DependencyMapping';
import SupportPage from './pages/Support';
import { DashboardSkeleton } from './components/common/SkeletonLoaders';

// Lazy load Chart.js-heavy pages
const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const AnalyticsHubPage = lazy(() => import('./pages/AnalyticsHub'));
const CustomDashboardPage = lazy(() => import('./pages/analytics/CustomDashboard'));
const OrganizationalIntelligencePage = lazy(() => import('./pages/OrganizationalIntelligence'));

// Lazy load admin/low-priority routes
const SettingsPage = lazy(() => import('./pages/Settings'));
const DeploymentCenterPage = lazy(() => import('./pages/DeploymentCenter'));
const ReportingPage = lazy(() => import('./pages/Reporting'));
const BillingPage = lazy(() => import('./pages/Billing'));
const EnhancedOrganizationSetup = lazy(() => import('./pages/setup/EnhancedOrganizationSetup'));
const EnhancedOnboardingDashboard = lazy(() => import('./components/onboarding/EnhancedOnboardingDashboard'));
const InvitationAcceptance = lazy(() => import('./components/auth/InvitationAcceptance'));
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { EnhancedAIAssistantProvider } from './components/ai-assistant/EnhancedAIAssistantContext';
import ErrorMonitor from './components/error/ErrorMonitor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <GlobalErrorBoundary>
      <ErrorMonitor />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster />
          <BrowserRouter>
          <EnhancedAuthProvider>
            <OrgProvider>
              <PermissionProvider>
                <OnboardingProvider>
                  <EnhancedAIAssistantProvider>
            <Routes>
              {/* Public website homepage */}
              <Route path="/" element={<IndexPage />} />
              
              {/* Authentication */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/auth/login" element={<AuthPage />} />
              <Route path="/auth/register" element={<AuthPage />} />
              <Route path="/auth/forgot-password" element={<AuthPage />} />
              <Route path="/auth/verify" element={<AuthPage />} />
              <Route path="/auth/update-password" element={<AuthPage />} />
              
              {/* Organization Setup Routes */}
              <Route path="/setup/enhanced" element={
                <Suspense fallback={<DashboardSkeleton />}>
                  <EnhancedOrganizationSetup />
                </Suspense>
              } />
              
              {/* Protected application routes */}
              <Route path="/app" element={
                <EnhancedProtectedRoute>
                  <Navigate to="/app/dashboard" />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/onboarding" element={
                <EnhancedProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <EnhancedOnboardingDashboard />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/onboarding/dashboard" element={
                <EnhancedProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <EnhancedOnboardingDashboard />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/dashboard" element={
                <EnhancedProtectedRoute>
                  <RouteErrorBoundary routeName="Dashboard" moduleName="Core">
                    <DashboardPage />
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/settings" element={
                <EnhancedProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <SettingsPage />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/settings/roles" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'super_admin']}>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <SettingsPage />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/settings/members" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'super_admin']}>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <SettingsPage />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/accept-invitation" element={
                <Suspense fallback={<DashboardSkeleton />}>
                  <InvitationAcceptance />
                </Suspense>
              } />
              <Route path="/app/governance" element={
                <EnhancedProtectedRoute requiredPermission="frameworks:read">
                  <RouteErrorBoundary routeName="Governance Framework" moduleName="Governance">
                    <GovernanceFrameworkPage />
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/governance-framework/new" element={
                <EnhancedProtectedRoute requiredPermission="frameworks:write">
                  <RouteErrorBoundary routeName="New Framework" moduleName="Governance">
                    <Suspense fallback={<DashboardSkeleton />}>
                      {React.createElement(lazy(() => import('./pages/governance/FrameworkForm')))}
                    </Suspense>
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/governance-framework/:frameworkId" element={
                <EnhancedProtectedRoute requiredPermission="frameworks:read">
                  <RouteErrorBoundary routeName="Framework Detail" moduleName="Governance">
                    {React.createElement(lazy(() => import('./pages/governance/FrameworkDetail')))}
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/risk-appetite" element={
                <EnhancedProtectedRoute>
                  <RouteErrorBoundary routeName="Risk Appetite" moduleName="Risk Management">
                    <RiskAppetitePage />
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/impact-tolerances" element={
                <EnhancedProtectedRoute>
                  <ImpactTolerancesPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/business-functions" element={
                <EnhancedProtectedRoute>
                  <BusinessFunctionsPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/dependencies" element={
                <EnhancedProtectedRoute>
                  <DependenciesPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/tolerance-framework" element={
                <EnhancedProtectedRoute>
                  <ToleranceFrameworkPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/controls-and-kri" element={
                <EnhancedProtectedRoute requiredPermission="controls:read">
                  <RouteErrorBoundary routeName="Controls & KRI" moduleName="Risk Management">
                    <ControlsAndKriPage />
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/third-party-risk" element={
                <EnhancedProtectedRoute>
                  <RouteErrorBoundary routeName="Third-Party Risk" moduleName="Risk Management">
                    <ThirdPartyRiskPage />
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/incident-log" element={
                <EnhancedProtectedRoute requiredPermission="incidents:read">
                  <RouteErrorBoundary routeName="Incident Log" moduleName="Risk Management">
                    <IncidentLogPage />
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/scenario-testing" element={
                <EnhancedProtectedRoute>
                  <ScenarioTestingPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/business-continuity" element={
                <EnhancedProtectedRoute>
                  <BusinessContinuityPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/audit-and-compliance" element={
                <EnhancedProtectedRoute requiredPermission="audit:read">
                  <AuditAndCompliancePage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/document-management" element={
                <EnhancedProtectedRoute>
                  <RouteErrorBoundary routeName="Document Management" moduleName="Documents">
                    <DocumentManagementPage />
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/integrations" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'manager']}>
                  <IntegrationsPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/analytics-hub" element={
                <EnhancedProtectedRoute requiredPermission="reporting:read">
                  <RouteErrorBoundary routeName="Analytics Hub" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <AnalyticsHubPage />
                    </Suspense>
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/workflow-center" element={
                <EnhancedProtectedRoute>
                  <WorkflowCenterPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/dependency-mapping" element={
                <EnhancedProtectedRoute>
                  <DependencyMappingPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/deployment-center" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'super_admin']}>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <DeploymentCenterPage />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/reporting" element={
                <EnhancedProtectedRoute requiredPermission="reporting:read">
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ReportingPage />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/billing" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'super_admin']}>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <BillingPage />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/support" element={
                <EnhancedProtectedRoute>
                  <SupportPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/analytics" element={
                <EnhancedProtectedRoute requiredPermission="reporting:read">
                  <RouteErrorBoundary routeName="Analytics" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <AnalyticsPage />
                    </Suspense>
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/analytics/custom" element={
                <EnhancedProtectedRoute requiredPermission="reporting:write">
                  <RouteErrorBoundary routeName="Custom Analytics" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <CustomDashboardPage />
                    </Suspense>
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/organizational-intelligence" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'manager', 'analyst']}>
                  <RouteErrorBoundary routeName="Organizational Intelligence" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <OrganizationalIntelligencePage />
                    </Suspense>
                  </RouteErrorBoundary>
                </EnhancedProtectedRoute>
              } />
              
              {/* Phase 4 Enterprise Routes */}
              <Route path="/app/enterprise-security" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'super_admin']}>
                  <Navigate to="/app/settings" />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/regulatory-reporting" element={
                <EnhancedProtectedRoute requiredPermission="reporting:read">
                  <Navigate to="/app/reporting" />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/integration-hub" element={
                <EnhancedProtectedRoute requiredAnyRole={['admin', 'manager']}>
                  <IntegrationsPage />
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/performance" element={
                <EnhancedProtectedRoute requiredPermission="reporting:read">
                  <Suspense fallback={<DashboardSkeleton />}>
                    <AnalyticsPage />
                  </Suspense>
                </EnhancedProtectedRoute>
              } />
              <Route path="/app/mobile" element={
                <EnhancedProtectedRoute>
                  <DashboardPage />
                </EnhancedProtectedRoute>
              } />
              
              {/* Legacy routes - redirect to new structure */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
              <Route path="/settings" element={<Navigate to="/app/settings" />} />
              <Route path="/third-party-risk" element={<Navigate to="/app/third-party-risk" />} />
              <Route path="/scenario-testing" element={<Navigate to="/app/scenario-testing" />} />
              <Route path="/integrations" element={<Navigate to="/app/integrations" />} />
              <Route path="/analytics" element={<Navigate to="/app/analytics" />} />
              <Route path="/organizational-intelligence" element={<Navigate to="/app/organizational-intelligence" />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
                  </EnhancedAIAssistantProvider>
                </OnboardingProvider>
              </PermissionProvider>
            </OrgProvider>
          </EnhancedAuthProvider>
        </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
