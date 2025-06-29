
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { AIAssistantProvider } from '@/components/ai-assistant';
import { EnhancedAIAssistantProvider } from '@/components/ai-assistant/EnhancedAIAssistantContext';
import { EnhancedAIAssistantButton } from '@/components/ai-assistant/EnhancedAIAssistantButton';
import { EnhancedAIAssistantDialog } from '@/components/ai-assistant/EnhancedAIAssistantDialog';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

// Page imports
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import IncidentLog from '@/pages/IncidentLog';
import GovernanceFramework from '@/pages/GovernanceFramework';
import FrameworkDetail from '@/pages/governance/FrameworkDetail';
import BusinessContinuity from '@/pages/BusinessContinuity';
import ThirdPartyRisk from '@/pages/ThirdPartyRisk';
import Dependencies from '@/pages/Dependencies';
import ControlsAndKRI from '@/pages/ControlsAndKRI';
import WorkflowCenter from '@/pages/WorkflowCenter';
import RiskAppetite from '@/pages/RiskAppetite';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

console.log('App component rendering');

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AIAssistantProvider>
              <EnhancedAIAssistantProvider>
                <Router>
                  <div className="min-h-screen bg-background">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/incident-log"
                        element={
                          <ProtectedRoute>
                            <IncidentLog />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/governance-framework"
                        element={
                          <ProtectedRoute>
                            <GovernanceFramework />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/governance-framework/:frameworkId"
                        element={
                          <ProtectedRoute>
                            <FrameworkDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/governance-framework/new"
                        element={
                          <ProtectedRoute>
                            <FrameworkDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/business-continuity"
                        element={
                          <ProtectedRoute>
                            <BusinessContinuity />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/third-party-risk"
                        element={
                          <ProtectedRoute>
                            <ThirdPartyRisk />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dependencies"
                        element={
                          <ProtectedRoute>
                            <Dependencies />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/controls-and-kri"
                        element={
                          <ProtectedRoute>
                            <ControlsAndKRI />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/workflow-center"
                        element={
                          <ProtectedRoute>
                            <WorkflowCenter />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/risk-appetite"
                        element={
                          <ProtectedRoute>
                            <RiskAppetite />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                    <EnhancedAIAssistantButton />
                    <EnhancedAIAssistantDialog />
                  </div>
                </Router>
              </EnhancedAIAssistantProvider>
            </AIAssistantProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
