
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import UpdateProfile from './pages/auth/UpdatePassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="update-profile" element={<UpdateProfile />} />
              <Route path="business-functions" element={<BusinessFunctions />} />
              <Route path="risk-management" element={<RiskManagement />} />
              <Route path="compliance-management" element={<ComplianceManagement />} />
              <Route path="incident-log" element={<IncidentLog />} />
              <Route path="settings" element={<Settings />} />
              <Route path="business-impact-analysis" element={<BusinessImpactAnalysis />} />
              <Route path="continuity-plans" element={<ContinuityPlans />} />
              <Route path="analytics" element={<AnalyticsHub />} />
              <Route path="organization-management" element={<OrganizationManagement />} />
              <Route path="user-preferences" element={<UserPreferences />} />
              <Route path="regulatory-compliance" element={<RegulatoryCompliance />} />
              <Route path="third-party-management" element={<ThirdPartyManagement />} />
              <Route path="vulnerability-management" element={<VulnerabilityManagement />} />
              <Route path="risk-appetite" element={<RiskAppetite />} />
              <Route path="scenario-testing" element={<ScenarioTesting />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
