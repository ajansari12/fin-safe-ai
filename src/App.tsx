
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { TypeSafeErrorBoundary } from "./components/error/TypeSafeErrorBoundary";
import "./App.css";

// Import page components
import Home from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ModulesOverview from "./pages/modules/ModulesOverview";
import GovernanceModule from "./pages/modules/GovernanceModule";
import RiskManagementModule from "./pages/modules/RiskManagementModule";
import SelfAssessmentModule from "./pages/modules/SelfAssessmentModule";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on type errors or 4xx errors
        if (error instanceof TypeError || 
            (error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  return (
    <TypeSafeErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <OnboardingProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/modules" element={<ModulesOverview />} />
                  <Route path="/modules/governance" element={<GovernanceModule />} />
                  <Route path="/modules/risk-management" element={<RiskManagementModule />} />
                  <Route path="/modules/self-assessment" element={<SelfAssessmentModule />} />
                  {/* Add other routes as needed */}
                </Routes>
              </OnboardingProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </TypeSafeErrorBoundary>
  );
};

export default App;
