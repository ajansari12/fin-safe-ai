
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { TypeSafeErrorBoundary } from "./components/error/TypeSafeErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";

// Import marketing pages
import Home from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Compliance from "./pages/Compliance";

// Import auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";
import Verify from "./pages/auth/Verify";

// Import app pages
import PersonalizedDashboard from "./pages/PersonalizedDashboard";
import GovernanceFramework from "./pages/GovernanceFramework";
import RiskAppetite from "./pages/RiskAppetite";
import ImpactTolerances from "./pages/ImpactTolerances";
import BusinessFunctions from "./pages/BusinessFunctions";
import Dependencies from "./pages/Dependencies";
import ToleranceFramework from "./pages/ToleranceFramework";
import ControlsAndKri from "./pages/ControlsAndKri";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import IncidentLog from "./pages/IncidentLog";
import ScenarioTesting from "./pages/ScenarioTesting";
import BusinessContinuity from "./pages/BusinessContinuity";
import AuditAndCompliance from "./pages/AuditAndCompliance";
import DocumentManagement from "./pages/DocumentManagement";
import Integrations from "./pages/Integrations";
import AnalyticsHubPage from "./pages/AnalyticsHub";
import WorkflowOrchestrationPage from "./pages/WorkflowOrchestration";
import DependencyMapping from "./pages/DependencyMapping";
import DeploymentCenter from "./pages/DeploymentCenter";
import Reporting from "./pages/Reporting";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on type errors or 4xx errors
        if (error instanceof TypeError || 
            (error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  return (
    <TypeSafeErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <OnboardingProvider>
                <Routes>
                  {/* Marketing Website Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/compliance" element={<Compliance />} />
                  
                  {/* Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                  <Route path="/auth/update-password" element={<UpdatePassword />} />
                  <Route path="/auth/verify" element={<Verify />} />
                  
                  {/* Protected Application Routes */}
                  <Route path="/app/dashboard" element={
                    <ProtectedRoute>
                      <PersonalizedDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/governance" element={
                    <ProtectedRoute>
                      <GovernanceFramework />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/risk-appetite" element={
                    <ProtectedRoute>
                      <RiskAppetite />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/impact-tolerances" element={
                    <ProtectedRoute>
                      <ImpactTolerances />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/business-functions" element={
                    <ProtectedRoute>
                      <BusinessFunctions />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/dependencies" element={
                    <ProtectedRoute>
                      <Dependencies />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/tolerance-framework" element={
                    <ProtectedRoute>
                      <ToleranceFramework />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/controls-and-kri" element={
                    <ProtectedRoute>
                      <ControlsAndKri />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/third-party-risk" element={
                    <ProtectedRoute>
                      <ThirdPartyRisk />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/incident-log" element={
                    <ProtectedRoute>
                      <IncidentLog />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/scenario-testing" element={
                    <ProtectedRoute>
                      <ScenarioTesting />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/business-continuity" element={
                    <ProtectedRoute>
                      <BusinessContinuity />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/audit-and-compliance" element={
                    <ProtectedRoute>
                      <AuditAndCompliance />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/document-management" element={
                    <ProtectedRoute>
                      <DocumentManagement />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/integrations" element={
                    <ProtectedRoute>
                      <Integrations />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/analytics-hub" element={
                    <ProtectedRoute>
                      <AnalyticsHubPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/workflow-center" element={
                    <ProtectedRoute>
                      <WorkflowOrchestrationPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/dependency-mapping" element={
                    <ProtectedRoute>
                      <DependencyMapping />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/deployment-center" element={
                    <ProtectedRoute>
                      <DeploymentCenter />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/reporting" element={
                    <ProtectedRoute>
                      <Reporting />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/app/billing" element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/support" element={<Support />} />
                  
                  {/* Legacy route redirects */}
                  <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/modules" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/modules/governance" element={<Navigate to="/app/governance" replace />} />
                  <Route path="/modules/risk-management" element={<Navigate to="/app/risk-appetite" replace />} />
                  <Route path="/modules/self-assessment" element={<Navigate to="/app/dashboard" replace />} />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </OnboardingProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </TypeSafeErrorBoundary>
  );
};

export default App;
