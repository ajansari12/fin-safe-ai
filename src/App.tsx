
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import { EnhancedAIAssistantProvider } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import AIAnalyticsDashboard from "./components/ai/AIAnalyticsDashboard";

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
                <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/app/analytics" element={<ProtectedRoute><AnalyticsHub /></ProtectedRoute>} />
                <Route path="/app/analytics/dashboards" element={<ProtectedRoute><AdvancedDashboards /></ProtectedRoute>} />
                <Route path="/app/analytics/custom-dashboard" element={<ProtectedRoute><CustomDashboard /></ProtectedRoute>} />
                <Route path="/app/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
                <Route path="/app/risk-management" element={<ProtectedRoute><RiskManagement /></ProtectedRoute>} />
                <Route path="/app/risk-management/categories" element={<ProtectedRoute><RiskCategories /></ProtectedRoute>} />
                <Route path="/app/risk-management/appetite" element={<ProtectedRoute><RiskAppetite /></ProtectedRoute>} />
                <Route path="/app/risk-management/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
                <Route path="/app/risk-management/kris" element={<ProtectedRoute><KRIManagement /></ProtectedRoute>} />
                <Route path="/app/controls" element={<ProtectedRoute><Controls /></ProtectedRoute>} />
                <Route path="/app/business-continuity" element={<ProtectedRoute><BusinessContinuity /></ProtectedRoute>} />
                <Route path="/app/third-party-risk" element={<ProtectedRoute><ThirdPartyRisk /></ProtectedRoute>} />
                <Route path="/app/governance" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
                <Route path="/app/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                <Route path="/app/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                <Route path="/app/reporting" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
                <Route path="/app/workflow-automation" element={<ProtectedRoute><WorkflowAutomation /></ProtectedRoute>} />
                <Route path="/app/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
