import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import RiskAppetite from "./pages/RiskAppetite";
import RiskManagementRiskAppetite from "./pages/risk-management/RiskAppetite";
import OSFICompliance from "./pages/OSFICompliance";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import BusinessContinuity from "./pages/BusinessContinuity";
import OperationalResilience from "./pages/OperationalResilience";
import FrameworkManagement from "./pages/FrameworkManagement";
import GovernanceFramework from "./pages/GovernanceFramework";
import Home from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/Verify";
import RiskAppetiteDetailView from "@/components/risk-appetite/RiskAppetiteDetailView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { EnhancedAIAssistantProvider } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import TechnologyCyberRisk from "./pages/TechnologyCyberRisk";
import ScenarioTesting from "./pages/ScenarioTesting";
import AIIntelligence from "./pages/AIIntelligence";
import WorkflowAutomation from "./pages/WorkflowAutomation";
import OrganizationalIntelligence from "./pages/OrganizationalIntelligence";
import IntegrationsHub from "./pages/IntegrationsHub";

// Create a stable QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAuthProvider>
        <EnhancedAIAssistantProvider>
          <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            
            {/* Authentication routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify" element={<Verify />} />
            
            {/* Legacy redirects for compatibility */}
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
            
            {/* Protected app routes */}
            <Route path="/app/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/app/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/app/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/app/osfi-compliance" element={
              <ProtectedRoute>
                <OSFICompliance />
              </ProtectedRoute>
            } />
            <Route path="/app/third-party-risk" element={
              <ProtectedRoute>
                <ThirdPartyRisk />
              </ProtectedRoute>
            } />
            <Route path="/app/technology-cyber-risk" element={
              <ProtectedRoute>
                <TechnologyCyberRisk />
              </ProtectedRoute>
            } />
            <Route path="/app/business-continuity" element={
              <ProtectedRoute>
                <BusinessContinuity />
              </ProtectedRoute>
            } />
            <Route path="/app/operational-resilience" element={
              <ProtectedRoute>
                <OperationalResilience />
              </ProtectedRoute>
            } />
            <Route path="/app/framework-management" element={
              <ProtectedRoute>
                <FrameworkManagement />
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
            <Route path="/app/risk-appetite/detail/:id" element={
              <ProtectedRoute>
                <RiskAppetiteDetailView />
              </ProtectedRoute>
            } />
            <Route path="/app/risk-management/risk-appetite" element={
              <ProtectedRoute>
                <RiskManagementRiskAppetite />
              </ProtectedRoute>
            } />
            <Route path="/app/scenario-testing" element={
              <ProtectedRoute>
                <ScenarioTesting />
              </ProtectedRoute>
            } />
            <Route path="/app/ai-intelligence" element={
              <ProtectedRoute>
                <AIIntelligence />
              </ProtectedRoute>
            } />
            <Route path="/app/workflow-automation" element={
              <ProtectedRoute>
                <WorkflowAutomation />
              </ProtectedRoute>
            } />
            <Route path="/app/organizational-intelligence" element={
              <ProtectedRoute>
                <OrganizationalIntelligence />
              </ProtectedRoute>
            } />
            <Route path="/app/integrations" element={
              <ProtectedRoute>
                <IntegrationsHub />
              </ProtectedRoute>
            } />
          </Routes>
          </Router>
          <Toaster />
        </EnhancedAIAssistantProvider>
      </EnhancedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
