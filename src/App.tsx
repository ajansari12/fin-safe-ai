
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import RiskManagement from "./pages/RiskManagement";
import RiskCategories from "./pages/risk-management/RiskCategories";
import RiskAppetite from "./pages/risk-management/RiskAppetite";
import Incidents from "./pages/risk-management/Incidents";
import KRIManagement from "./pages/risk-management/KRIManagement";
import Controls from "./pages/Controls";
import BusinessContinuity from "./pages/BusinessContinuity";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import Governance from "./pages/Governance";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import AnalyticsHub from "./pages/analytics/AnalyticsHub";
import CustomDashboard from "./pages/analytics/CustomDashboard";
import AdvancedDashboards from "./pages/analytics/AdvancedDashboards";
import WorkflowAutomation from "./pages/WorkflowAutomation";
import NotificationsPage from "./pages/NotificationsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedAuthProvider>
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
              <Route path="/app/workflow-automation" element={<WorkflowAutomation />} />
              <Route path="/app/notifications" element={<NotificationsPage />} />
              <Route path="/app/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </EnhancedAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
