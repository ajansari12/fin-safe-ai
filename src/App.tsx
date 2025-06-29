
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import Index from './pages/Index';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/update-profile" element={<ProtectedRoute />}>
              <Route index element={<UpdateProfile />} />
            </Route>
            <Route path="/business-functions" element={<ProtectedRoute />}>
              <Route index element={<BusinessFunctions />} />
            </Route>
            <Route path="/risk-management" element={<ProtectedRoute />}>
              <Route index element={<RiskManagement />} />
            </Route>
            <Route path="/compliance-management" element={<ProtectedRoute />}>
              <Route index element={<ComplianceManagement />} />
            </Route>
            <Route path="/incident-log" element={<ProtectedRoute />}>
              <Route index element={<IncidentLog />} />
            </Route>
            <Route path="/settings" element={<ProtectedRoute />}>
              <Route index element={<Settings />} />
            </Route>
            <Route path="/business-impact-analysis" element={<ProtectedRoute />}>
              <Route index element={<BusinessImpactAnalysis />} />
            </Route>
            <Route path="/continuity-plans" element={<ProtectedRoute />}>
              <Route index element={<ContinuityPlans />} />
            </Route>
            <Route path="/analytics" element={<ProtectedRoute />}>
              <Route index element={<AnalyticsHub />} />
            </Route>
            <Route path="/organization-management" element={<ProtectedRoute />}>
              <Route index element={<OrganizationManagement />} />
            </Route>
            <Route path="/user-preferences" element={<ProtectedRoute />}>
              <Route index element={<UserPreferences />} />
            </Route>
            <Route path="/regulatory-compliance" element={<ProtectedRoute />}>
              <Route index element={<RegulatoryCompliance />} />
            </Route>
            <Route path="/third-party-management" element={<ProtectedRoute />}>
              <Route index element={<ThirdPartyManagement />} />
            </Route>
            <Route path="/vulnerability-management" element={<ProtectedRoute />}>
              <Route index element={<VulnerabilityManagement />} />
            </Route>
            <Route path="/risk-appetite" element={<ProtectedRoute />}>
              <Route index element={<RiskAppetite />} />
            </Route>
            <Route path="/scenario-testing" element={<ProtectedRoute />}>
              <Route index element={<ScenarioTesting />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
