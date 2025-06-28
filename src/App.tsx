
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import UpdateProfile from './pages/auth/UpdatePassword';
import PrivateRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import BusinessFunctions from './pages/BusinessFunctions';
import RiskManagement from './pages/risk-management/RiskAppetite';
import ComplianceManagement from './pages/AuditAndCompliance';
import IncidentLog from './pages/IncidentLog';
import Settings from './pages/Settings';
import BusinessImpactAnalysis from './pages/BusinessContinuity';
import ContinuityPlans from './pages/BusinessContinuity';
import AnalyticsHub from './components/analytics/AnalyticsHub';
import OrganizationManagement from './components/settings/OrganizationManagement';
import UserPreferences from './components/settings/UserPreferences';
import RegulatoryCompliance from './pages/AuditAndCompliance';
import ThirdPartyManagement from './pages/ThirdPartyRisk';
import VulnerabilityManagement from './pages/ThirdPartyRisk';
import RiskAppetite from './pages/RiskAppetite';
import ScenarioTesting from "@/pages/ScenarioTesting";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/update-profile"
              element={
                <PrivateRoute>
                  <UpdateProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/business-functions"
              element={
                <PrivateRoute>
                  <BusinessFunctions />
                </PrivateRoute>
              }
            />
            <Route
              path="/risk-management"
              element={
                <PrivateRoute>
                  <RiskManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/compliance-management"
              element={
                <PrivateRoute>
                  <ComplianceManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/incident-log"
              element={
                <PrivateRoute>
                  <IncidentLog />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/business-impact-analysis"
              element={
                <PrivateRoute>
                  <BusinessImpactAnalysis />
                </PrivateRoute>
              }
            />
            <Route
              path="/continuity-plans"
              element={
                <PrivateRoute>
                  <ContinuityPlans />
                </PrivateRoute>
              }
            />
             <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AnalyticsHub />
                </PrivateRoute>
              }
            />
            <Route
              path="/organization-management"
              element={
                <PrivateRoute>
                  <OrganizationManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/user-preferences"
              element={
                <PrivateRoute>
                  <UserPreferences />
                </PrivateRoute>
              }
            />
            <Route
              path="/regulatory-compliance"
              element={
                <PrivateRoute>
                  <RegulatoryCompliance />
                </PrivateRoute>
              }
            />
            <Route
              path="/third-party-management"
              element={
                <PrivateRoute>
                  <ThirdPartyManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/vulnerability-management"
              element={
                <PrivateRoute>
                  <VulnerabilityManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/risk-appetite"
              element={
                <PrivateRoute>
                  <RiskAppetite />
                </PrivateRoute>
              }
            />
            <Route 
              path="/scenario-testing" 
              element={
                <PrivateRoute>
                  <ScenarioTesting />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
