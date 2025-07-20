
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
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
import Home from "./pages/Index";
import RiskAppetiteDetailView from "@/components/risk-appetite/RiskAppetiteDetailView";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";
import { EnhancedAIAssistantProvider } from "@/components/ai-assistant/EnhancedAIAssistantContext";

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
      <SimpleAuthProvider>
        <EnhancedAIAssistantProvider>
          <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/settings" element={<Settings />} />
            <Route path="/app/analytics" element={<Analytics />} />
            <Route path="/app/osfi-compliance" element={<OSFICompliance />} />
            <Route path="/app/third-party-risk" element={<ThirdPartyRisk />} />
            <Route path="/app/business-continuity" element={<BusinessContinuity />} />
            <Route path="/app/risk-appetite" element={<RiskAppetite />} />
            <Route path="/app/risk-appetite/detail/:id" element={<RiskAppetiteDetailView />} />
            <Route path="/app/risk-management/risk-appetite" element={<RiskManagementRiskAppetite />} />
          </Routes>
          </Router>
          <Toaster />
        </EnhancedAIAssistantProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
