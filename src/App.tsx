
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { EnhancedAIAssistantProvider } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import RiskManagement from "./pages/OperationalResilience";
import RiskCategories from "./pages/RiskAppetite";
import RiskAppetite from "./pages/RiskAppetite";
import Incidents from "./pages/IncidentLog";
import KRIManagement from "./pages/ControlsAndKri";
import Controls from "./pages/ControlsAndKri";
import BusinessContinuity from "./pages/BusinessContinuity";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import Governance from "./pages/GovernanceFramework";
import Documents from "./pages/DocumentManagement";
import Settings from "./pages/Settings";
import AnalyticsHub from "./pages/AnalyticsHub";
import CustomDashboard from "./pages/analytics/CustomDashboard";
import AdvancedDashboards from "./pages/analytics/AdvancedDashboards";
import WorkflowAutomation from "./pages/WorkflowAutomation";
import NotificationsPage from "./pages/NotificationsPage";
import PerformancePage from "./pages/performance/PerformancePage";
import Integrations from "./pages/Integrations";
import Reporting from "./pages/Reporting";
import IntegrationFramework from "./pages/IntegrationFramework";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAuthProvider>
        <EnhancedAIAssistantProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/app/dashboard" element={<Dashboard />} />
                <Route path="/app/analytics" element={<AnalyticsHub />} />
                <Route path="/app/analytics/dashboards" element={<AdvancedDashboards />} />
                <Route path="/app/analytics/custom-dashboard" element={<CustomDashboard />} />
                <Route path="/app/performance" element={<PerformancePage />} />
                <Route path="/app/risk-management" element={<RiskManagement />} />
                <Route path="/app/risk-management/categories" element={<RiskCategories />} />
                <Route path="/app/risk-management/appetite" element={<RiskAppetite />} />
                <Route path="/app/risk-management/incidents" element={<Incidents />} />
                <Route path="/app/risk-management/kris" element={<KRIManagement />} />
                <Route path="/app/controls" element={<Controls />} />
                <Route path="/app/business-continuity" element={<BusinessContinuity />} />
                <Route path="/app/third-party-risk" element={<ThirdPartyRisk />} />
                <Route path="/app/governance" element={<Governance />} />
                <Route path="/app/documents" element={<Documents />} />
                <Route path="/app/integrations" element={<Integrations />} />
                <Route path="/app/reporting" element={<Reporting />} />
                <Route path="/app/workflow-automation" element={<WorkflowAutomation />} />
                <Route path="/app/notifications" element={<NotificationsPage />} />
                <Route path="/app/settings" element={<Settings />} />
                <Route path="/integration-framework" element={<IntegrationFramework />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </EnhancedAIAssistantProvider>
      </EnhancedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
