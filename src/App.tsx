import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import SettingsPage from './pages/Settings';
import ThirdPartyRiskPage from './pages/ThirdPartyRisk';
import ScenarioTestingPage from './pages/ScenarioTesting';
import IntegrationPage from './pages/Integration';
import AnalyticsPage from './pages/Analytics';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';
import { EnhancedAIAssistantProvider } from './components/ai-assistant/EnhancedAIAssistantContext';

const queryClient = new QueryClient();

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    if (!user) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <QueryClient defaultOptions={{
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    }}>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <EnhancedAIAssistantProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/third-party-risk" element={
                  <ProtectedRoute>
                    <ThirdPartyRiskPage />
                  </ProtectedRoute>
                } />
                <Route path="/scenario-testing" element={
                  <ProtectedRoute>
                    <ScenarioTestingPage />
                  </ProtectedRoute>
                } />
                <Route path="/integration" element={
                  <ProtectedRoute>
                    <IntegrationPage />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </EnhancedAIAssistantProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </QueryClient>
  );
}

export default App;
