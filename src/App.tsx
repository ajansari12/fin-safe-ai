
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Compliance from "./pages/Compliance";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";

// Authenticated pages
import Dashboard from "./pages/Dashboard";
import OrganizationSetup from "./pages/setup/OrganizationSetup";
import GovernanceFramework from "./pages/GovernanceFramework";
import RiskAppetite from "./pages/RiskAppetite";
import ImpactTolerances from "./pages/ImpactTolerances";
import BusinessFunctions from "./pages/BusinessFunctions";
import Dependencies from "./pages/Dependencies";
import ScenarioTesting from "./pages/ScenarioTesting";
import BusinessContinuity from "./pages/BusinessContinuity";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import ControlsAndKri from "./pages/ControlsAndKri";
import IncidentLog from "./pages/IncidentLog";
import AuditAndCompliance from "./pages/AuditAndCompliance";
import WorkflowCenter from "./pages/WorkflowCenter";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/compliance" element={<Compliance />} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/verify" element={<Verify />} />

            {/* Authenticated Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/setup/organization" element={
              <ProtectedRoute>
                <OrganizationSetup />
              </ProtectedRoute>
            } />
            <Route path="/governance-framework" element={
              <ProtectedRoute>
                <GovernanceFramework />
              </ProtectedRoute>
            } />
            <Route path="/risk-appetite" element={
              <ProtectedRoute>
                <RiskAppetite />
              </ProtectedRoute>
            } />
            <Route path="/impact-tolerances" element={
              <ProtectedRoute>
                <ImpactTolerances />
              </ProtectedRoute>
            } />
            <Route path="/business-functions" element={
              <ProtectedRoute>
                <BusinessFunctions />
              </ProtectedRoute>
            } />
            <Route path="/dependencies" element={
              <ProtectedRoute>
                <Dependencies />
              </ProtectedRoute>
            } />
            <Route path="/scenario-testing" element={
              <ProtectedRoute>
                <ScenarioTesting />
              </ProtectedRoute>
            } />
            <Route path="/business-continuity" element={
              <ProtectedRoute>
                <BusinessContinuity />
              </ProtectedRoute>
            } />
            <Route path="/third-party-risk" element={
              <ProtectedRoute>
                <ThirdPartyRisk />
              </ProtectedRoute>
            } />
            <Route path="/controls-and-kri" element={
              <ProtectedRoute>
                <ControlsAndKri />
              </ProtectedRoute>
            } />
            <Route path="/incident-log" element={
              <ProtectedRoute>
                <IncidentLog />
              </ProtectedRoute>
            } />
            <Route path="/audit-and-compliance" element={
              <ProtectedRoute>
                <AuditAndCompliance />
              </ProtectedRoute>
            } />
            <Route path="/workflow-center" element={
              <ProtectedRoute>
                <WorkflowCenter />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
