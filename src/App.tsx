
import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import IncidentLog from "@/pages/IncidentLog";
import ThirdPartyRisk from "@/pages/ThirdPartyRisk";
import BusinessContinuity from "@/pages/BusinessContinuity";
import GovernanceFramework from "@/pages/GovernanceFramework";
import FrameworkDetail from "@/pages/governance/FrameworkDetail";
import BusinessFunctions from "@/pages/BusinessFunctions";
import ImpactTolerances from "@/pages/ImpactTolerances";
import Dependencies from "@/pages/Dependencies";
import DependencyMapping from "@/pages/DependencyMapping";
import ScenarioTesting from "@/pages/ScenarioTesting";
import ControlsAndKri from "@/pages/ControlsAndKri";
import AuditAndCompliance from "@/pages/AuditAndCompliance";
import WorkflowCenter from "@/pages/WorkflowCenter";
import RiskAppetite from "@/pages/RiskAppetite";
import RiskAppetiteMain from "@/pages/risk-management/RiskAppetite";
import RiskAppetiteWorkflow from "@/pages/risk-management/RiskAppetiteWorkflow";
import Compliance from "@/pages/Compliance";
import AnalyticsHub from "@/pages/AnalyticsHub";
import OrganizationSetup from "@/pages/setup/OrganizationSetup";
import Settings from "@/pages/Settings";
import Billing from "@/pages/Billing";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Contact from "@/pages/Contact";
import Support from "@/pages/Support";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import UpdatePassword from "@/pages/auth/UpdatePassword";
import Verify from "@/pages/auth/Verify";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.status === 404 || error?.code === '42501') {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/support" element={<Support />} />
                  
                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/verify" element={<Verify />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/incident-log" element={<IncidentLog />} />
                    <Route path="/third-party-risk" element={<ThirdPartyRisk />} />
                    <Route path="/business-continuity" element={<BusinessContinuity />} />
                    <Route path="/governance-framework" element={<GovernanceFramework />} />
                    <Route path="/governance/:id" element={<FrameworkDetail />} />
                    <Route path="/business-functions" element={<BusinessFunctions />} />
                    <Route path="/impact-tolerances" element={<ImpactTolerances />} />
                    <Route path="/dependencies" element={<Dependencies />} />
                    <Route path="/dependency-mapping" element={<DependencyMapping />} />
                    <Route path="/scenario-testing" element={<ScenarioTesting />} />
                    <Route path="/controls-and-kri" element={<ControlsAndKri />} />
                    <Route path="/audit-compliance" element={<AuditAndCompliance />} />
                    <Route path="/workflow-center" element={<WorkflowCenter />} />
                    <Route path="/risk-appetite-old" element={<RiskAppetite />} />
                    <Route path="/risk-appetite" element={<RiskAppetiteMain />} />
                    <Route path="/risk-appetite/create" element={<RiskAppetiteWorkflow />} />
                    <Route path="/risk-appetite/edit/:id" element={<RiskAppetiteWorkflow />} />
                    <Route path="/compliance" element={<Compliance />} />
                    <Route path="/analytics" element={<AnalyticsHub />} />
                    <Route path="/setup" element={<OrganizationSetup />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/billing" element={<Billing />} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
              <Sonner />
            </div>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
