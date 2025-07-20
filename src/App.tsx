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
import Home from "./pages/Index";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RiskAppetiteDetailView from "@/components/risk-appetite/RiskAppetiteDetailView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log('App rendering, React:', typeof React, typeof React.useState);
  
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;