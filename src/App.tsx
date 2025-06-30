
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { queryClientConfig } from "./lib/performance/cache-utils";
import { QueryOptimizer } from "./lib/performance/query-optimizer";
import { Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy load major components for code splitting
const Index = lazy(() => import("./pages/Index"));
const IntegrationFramework = lazy(() => import("./pages/IntegrationFramework"));
const PersonalizedDashboard = lazy(() => import("./pages/PersonalizedDashboard"));
const WorkflowCenter = lazy(() => import("./pages/WorkflowCenter"));

// Lazy load auth components
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/auth/UpdatePassword"));
const Verify = lazy(() => import("./pages/auth/Verify"));

// Create optimized query client
const queryClient = new QueryClient(queryClientConfig);
QueryOptimizer.setQueryClient(queryClient);

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/update-password" element={<UpdatePassword />} />
                <Route path="/auth/verify" element={<Verify />} />
                <Route path="/integration-framework" element={<IntegrationFramework />} />
                <Route path="/personalized-dashboard" element={<PersonalizedDashboard />} />
                <Route path="/workflow-center" element={<WorkflowCenter />} />
                {navItems.map(({ to, page: PageComponent }) => (
                  <Route 
                    key={to} 
                    path={to} 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <PageComponent />
                      </Suspense>
                    } 
                  />
                ))}
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
