
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import RiskAppetite from "./pages/RiskAppetite";
import RiskManagementRiskAppetite from "./pages/risk-management/RiskAppetite";
import OSFICompliance from "./pages/OSFICompliance";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import BusinessContinuity from "./pages/BusinessContinuity";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RiskAppetiteDetailView from "@/components/risk-appetite/RiskAppetiteDetailView";
import { EnhancedAuthProvider } from "@/contexts/EnhancedAuthContext";

const queryClient = new QueryClient();

function App() {
  return (
    <EnhancedAuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/settings" element={<Settings />} />
            <Route path="/app/analytics" element={<Analytics />} />
            <Route path="/app/osfi-compliance" element={<OSFICompliance />} />
            <Route path="/app/third-party-risk" element={<ThirdPartyRisk />} />
            <Route path="/app/business-continuity" element={<BusinessContinuity />} />
            <Route path="/app/risk-appetite" element={<RiskAppetite />} />
            <Route path="/app/risk-appetite/detail/:id" element={<RiskAppetiteDetailView />} />
            <Route path="/app/risk-management/risk-appetite" element={<RiskManagementRiskAppetite />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </EnhancedAuthProvider>
  );
}

export default App;
