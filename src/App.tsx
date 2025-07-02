
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/Login';
import IndexPage from './pages/Index';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/Settings';
import ThirdPartyRiskPage from './pages/ThirdPartyRisk';
import ScenarioTestingPage from './pages/ScenarioTesting';
import IntegrationsPage from './pages/Integrations';
import AnalyticsPage from './pages/Analytics';
import OrganizationalIntelligencePage from './pages/OrganizationalIntelligence';
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
import AnalyticsHubPage from './pages/AnalyticsHub';
import WorkflowCenterPage from './pages/WorkflowCenter';
import DependencyMappingPage from './pages/DependencyMapping';
import DeploymentCenterPage from './pages/DeploymentCenter';
import ReportingPage from './pages/Reporting';
import BillingPage from './pages/Billing';
import SupportPage from './pages/Support';
import EnhancedOrganizationSetup from './pages/setup/EnhancedOrganizationSetup';
import EnhancedOnboardingDashboard from './components/onboarding/EnhancedOnboardingDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { EnhancedAIAssistantProvider } from './components/ai-assistant/EnhancedAIAssistantContext';

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
    <ErrorBoundary>
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
              <Route path="/login" element={<LoginPage />} />
              
              {/* Organization Setup Routes */}
              <Route path="/setup/enhanced" element={<EnhancedOrganizationSetup />} />
              
              {/* Protected application routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Navigate to="/app/dashboard" />
                </ProtectedRoute>
              } />
              <Route path="/app/onboarding" element={
                <ProtectedRoute>
                  <EnhancedOnboardingDashboard />
                </ProtectedRoute>
              } />
              <Route path="/app/onboarding/dashboard" element={
                <ProtectedRoute>
                  <EnhancedOnboardingDashboard />
                </ProtectedRoute>
              } />
              <Route path="/app/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/app/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/governance" element={
                <ProtectedRoute>
                  <GovernanceFrameworkPage />
                </ProtectedRoute>
              } />
              <Route path="/app/risk-appetite" element={
                <ProtectedRoute>
                  <RiskAppetitePage />
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
                  <ControlsAndKriPage />
                </ProtectedRoute>
              } />
              <Route path="/app/third-party-risk" element={
                <ProtectedRoute>
                  <ThirdPartyRiskPage />
                </ProtectedRoute>
              } />
              <Route path="/app/incident-log" element={
                <ProtectedRoute>
                  <IncidentLogPage />
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
                  <DocumentManagementPage />
                </ProtectedRoute>
              } />
              <Route path="/app/integrations" element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/analytics-hub" element={
                <ProtectedRoute>
                  <AnalyticsHubPage />
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
                  <DeploymentCenterPage />
                </ProtectedRoute>
              } />
              <Route path="/app/reporting" element={
                <ProtectedRoute>
                  <ReportingPage />
                </ProtectedRoute>
              } />
              <Route path="/app/billing" element={
                <ProtectedRoute>
                  <BillingPage />
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute>
                  <SupportPage />
                </ProtectedRoute>
              } />
              <Route path="/app/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/organizational-intelligence" element={
                <ProtectedRoute>
                  <OrganizationalIntelligencePage />
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
                  <AnalyticsPage />
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
    </ErrorBoundary>
  );
}

export default App;
