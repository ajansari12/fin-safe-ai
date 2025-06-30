import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { DeviceCapabilitiesProvider } from "@/components/mobile/DeviceCapabilitiesProvider";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import IncidentLog from "@/pages/IncidentLog";
import Governance from "@/pages/Governance";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import UpdatePassword from "@/pages/UpdatePassword";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DeviceCapabilitiesProvider>
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <TooltipProvider>
                <Toaster />
                <OfflineIndicator />
                <Routes>
                  <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth/verify" element={<VerifyEmail />} />
                  <Route path="/auth/update-password" element={<UpdatePassword />} />

                  <Route
                    path="/app/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/app/incidents"
                    element={
                      <ProtectedRoute>
                        <IncidentLog />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/app/governance"
                    element={
                      <ProtectedRoute>
                        <Governance />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/app/onboarding/*"
                    element={
                      <ProtectedRoute>
                        <OnboardingWizard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                </Routes>
              </TooltipProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </DeviceCapabilitiesProvider>
    </QueryClientProvider>
  );
};

export default App;
