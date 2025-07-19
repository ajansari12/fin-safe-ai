import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./contexts/EnhancedAuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UpdateProfile from "./pages/UpdateProfile";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Policies from "./pages/Policies";
import KRI from "./pages/KRI";
import Vendors from "./pages/Vendors";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import RiskAppetite from "./pages/RiskAppetite";
import RiskManagementRiskAppetite from "./pages/risk-management/RiskAppetite";
import OSFICompliance from "./pages/OSFICompliance";
import DataPrivacy from "./pages/DataPrivacy";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import BusinessContinuity from "./pages/BusinessContinuity";
import RegulatoryCompliance from "./pages/RegulatoryCompliance";
import IncidentDetails from "./pages/IncidentDetails";
import PolicyDetails from "./pages/PolicyDetails";
import KRIDetails from "./pages/KRIDetails";
import VendorDetails from "./pages/VendorDetails";
import CreateIncident from "./pages/CreateIncident";
import CreatePolicy from "./pages/CreatePolicy";
import CreateKRI from "./pages/CreateKRI";
import CreateVendor from "./pages/CreateVendor";
import EditIncident from "./pages/EditIncident";
import EditPolicy from "./pages/EditPolicy";
import EditKRI from "./pages/EditKRI";
import EditVendor from "./pages/EditVendor";
import AuditLogs from "./pages/AuditLogs";
import AccessControl from "./pages/AccessControl";
import UserManagement from "./pages/UserManagement";
import GroupManagement from "./pages/GroupManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RecentIncidents from "./components/dashboard/RecentIncidents";
import RiskAppetiteDetailView from "@/components/risk-appetite/RiskAppetiteDetailView";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme="system"
        storageKey="accent-override"
        attribute="class"
      >
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
              path="/update-profile"
              element={
                <ProtectedRoute>
                  <UpdateProfile />
                </ProtectedRoute>
              }
            />
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
                  <Incidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/policies"
              element={
                <ProtectedRoute>
                  <Policies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/kri"
              element={
                <ProtectedRoute>
                  <KRI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/vendors"
              element={
                <ProtectedRoute>
                  <Vendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/osfi-compliance"
              element={
                <ProtectedRoute>
                  <OSFICompliance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/data-privacy"
              element={
                <ProtectedRoute>
                  <DataPrivacy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/third-party-risk"
              element={
                <ProtectedRoute>
                  <ThirdPartyRisk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/business-continuity"
              element={
                <ProtectedRoute>
                  <BusinessContinuity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/regulatory-compliance"
              element={
                <ProtectedRoute>
                  <RegulatoryCompliance />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/incidents/:id"
              element={
                <ProtectedRoute>
                  <IncidentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/policies/:id"
              element={
                <ProtectedRoute>
                  <PolicyDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/kri/:id"
              element={
                <ProtectedRoute>
                  <KRIDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/vendors/:id"
              element={
                <ProtectedRoute>
                  <VendorDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/incidents/create"
              element={
                <ProtectedRoute>
                  <CreateIncident />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/policies/create"
              element={
                <ProtectedRoute>
                  <CreatePolicy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/kri/create"
              element={
                <ProtectedRoute>
                  <CreateKRI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/vendors/create"
              element={
                <ProtectedRoute>
                  <CreateVendor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/app/incidents/edit/:id"
              element={
                <ProtectedRoute>
                  <EditIncident />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/policies/edit/:id"
              element={
                <ProtectedRoute>
                  <EditPolicy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/kri/edit/:id"
              element={
                <ProtectedRoute>
                  <EditKRI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/vendors/edit/:id"
              element={
                <ProtectedRoute>
                  <EditVendor />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <AdminRoute>
                  <AuditLogs />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/access-control"
              element={
                <AdminRoute>
                  <AccessControl />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/user-management"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/group-management"
              element={
                <AdminRoute>
                  <GroupManagement />
                </AdminRoute>
              }
            />

            {/* Risk Management Routes */}
            <Route path="/app/risk-appetite" element={<RiskAppetite />} />
            <Route path="/app/risk-appetite/detail/:id" element={<RiskAppetiteDetailView />} />
            <Route path="/app/risk-management/risk-appetite" element={<RiskManagementRiskAppetite />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
