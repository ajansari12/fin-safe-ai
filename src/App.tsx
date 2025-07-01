
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/Login';
import IndexPage from './pages/Index';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/Settings';
import ThirdPartyRiskPage from './pages/ThirdPartyRisk';
import ScenarioTestingPage from './pages/ScenarioTesting';
import IntegrationsPage from './pages/Integrations';
import AnalyticsPage from './pages/Analytics';
import OrganizationalIntelligencePage from './pages/OrganizationalIntelligence';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { EnhancedAIAssistantProvider } from './components/ai-assistant/EnhancedAIAssistantContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    if (!user) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <EnhancedAIAssistantProvider>
            <Routes>
              {/* Public website homepage */}
              <Route path="/" element={<IndexPage />} />
              
              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected application routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Navigate to="/app/dashboard" />
                </ProtectedRoute>
              } />
              <Route path="/app/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/app/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/third-party-risk" element={
                <ProtectedRoute>
                  <ThirdPartyRiskPage />
                </ProtectedRoute>
              } />
              <Route path="/app/scenario-testing" element={
                <ProtectedRoute>
                  <ScenarioTestingPage />
                </ProtectedRoute>
              } />
              <Route path="/app/integrations" element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/app/organizational-intelligence" element={
                <ProtectedRoute>
                  <OrganizationalIntelligencePage />
                </ProtectedRoute>
              } />
              
              {/* Legacy routes - redirect to new structure */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
              <Route path="/settings" element={<Navigate to="/app/settings" />} />
              <Route path="/third-party-risk" element={<Navigate to="/app/third-party-risk" />} />
              <Route path="/scenario-testing" element={<Navigate to="/app/scenario-testing" />} />
              <Route path="/integrations" element={<Navigate to="/app/integrations" />} />
              <Route path="/analytics" element={<Navigate to="/app/analytics" />} />
              <Route path="/organizational-intelligence" element={<Navigate to="/app/organizational-intelligence" />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </EnhancedAIAssistantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
