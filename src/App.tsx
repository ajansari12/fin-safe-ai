
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { GlobalErrorBoundary } from './components/error/GlobalErrorBoundary';
import { RouteErrorBoundary } from './components/error/RouteErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
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
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
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
                <ProtectedRoute>
                  <Navigate to="/app/dashboard" />
                </ProtectedRoute>
              } />
              <Route path="/app/onboarding" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <EnhancedOnboardingDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/app/onboarding/dashboard" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <EnhancedOnboardingDashboard />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/app/dashboard" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Dashboard" moduleName="Core">
                    <DashboardPage />
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/settings" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/app/settings/roles" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/app/governance" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Governance Framework" moduleName="Governance">
                    <GovernanceFrameworkPage />
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/risk-appetite" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Risk Appetite" moduleName="Risk Management">
                    <RiskAppetitePage />
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/impact-tolerances" element={
                <ProtectedRoute>
                  <ImpactTolerancesPage />
                </ProtectedRoute>
              } />
              <Route path="/app/business-functions" element={
                <ProtectedRoute>
                  <BusinessFunctionsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/dependencies" element={
                <ProtectedRoute>
                  <DependenciesPage />
                </ProtectedRoute>
              } />
              <Route path="/app/tolerance-framework" element={
                <ProtectedRoute>
                  <ToleranceFrameworkPage />
                </ProtectedRoute>
              } />
              <Route path="/app/controls-and-kri" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Controls & KRI" moduleName="Risk Management">
                    <ControlsAndKriPage />
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/third-party-risk" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Third-Party Risk" moduleName="Risk Management">
                    <ThirdPartyRiskPage />
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/incident-log" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Incident Log" moduleName="Risk Management">
                    <IncidentLogPage />
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/scenario-testing" element={
                <ProtectedRoute>
                  <ScenarioTestingPage />
                </ProtectedRoute>
              } />
              <Route path="/app/business-continuity" element={
                <ProtectedRoute>
                  <BusinessContinuityPage />
                </ProtectedRoute>
              } />
              <Route path="/app/audit-and-compliance" element={
                <ProtectedRoute>
                  <AuditAndCompliancePage />
                </ProtectedRoute>
              } />
              <Route path="/app/document-management" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Document Management" moduleName="Documents">
                    <DocumentManagementPage />
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/integrations" element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/analytics-hub" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Analytics Hub" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <AnalyticsHubPage />
                    </Suspense>
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/workflow-center" element={
                <ProtectedRoute>
                  <WorkflowCenterPage />
                </ProtectedRoute>
              } />
              <Route path="/app/dependency-mapping" element={
                <ProtectedRoute>
                  <DependencyMappingPage />
                </ProtectedRoute>
              } />
              <Route path="/app/deployment-center" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <DeploymentCenterPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/app/reporting" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <ReportingPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/app/billing" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <BillingPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute>
                  <SupportPage />
                </ProtectedRoute>
              } />
              <Route path="/app/analytics" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Analytics" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <AnalyticsPage />
                    </Suspense>
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/analytics/custom" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Custom Analytics" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <CustomDashboardPage />
                    </Suspense>
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/app/organizational-intelligence" element={
                <ProtectedRoute>
                  <RouteErrorBoundary routeName="Organizational Intelligence" moduleName="Analytics">
                    <Suspense fallback={<DashboardSkeleton />}>
                      <OrganizationalIntelligencePage />
                    </Suspense>
                  </RouteErrorBoundary>
                </ProtectedRoute>
              } />
              
              {/* Phase 4 Enterprise Routes */}
              <Route path="/app/enterprise-security" element={
                <ProtectedRoute>
                  <Navigate to="/app/settings" />
                </ProtectedRoute>
              } />
              <Route path="/app/regulatory-reporting" element={
                <ProtectedRoute>
                  <Navigate to="/app/reporting" />
                </ProtectedRoute>
              } />
              <Route path="/app/integration-hub" element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/performance" element={
                <ProtectedRoute>
                  <Suspense fallback={<DashboardSkeleton />}>
                    <AnalyticsPage />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/app/mobile" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
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
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
