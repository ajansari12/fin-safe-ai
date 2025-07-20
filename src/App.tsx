
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
import Home from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/Verify";
import RiskAppetiteDetailView from "@/components/risk-appetite/RiskAppetiteDetailView";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
            <Route path="/app/business-continuity" element={
              <ProtectedRoute>
                <BusinessContinuity />
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
          </Routes>
          </Router>
          <Toaster />
        </EnhancedAIAssistantProvider>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
