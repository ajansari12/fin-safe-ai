
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/governance-framework", label: "Governance Framework" },
    { path: "/risk-appetite", label: "Risk Appetite" },
    { path: "/impact-tolerances", label: "Impact Tolerances" },
    { path: "/business-functions", label: "Business Functions" },
    { path: "/dependencies", label: "Dependencies" },
    { path: "/scenario-testing", label: "Scenario Testing" },
    { path: "/business-continuity", label: "Business Continuity" },
    { path: "/third-party-risk", label: "Third-Party Risk" },
    { path: "/controls-and-kri", label: "Controls & KRIs" },
    { path: "/incident-log", label: "Incident Log" },
    { path: "/audit-and-compliance", label: "Audit & Compliance" },
    { path: "/workflow-center", label: "Workflow Center" },
  ];

  const bottomLinks = [
    { path: "/settings", label: "Settings" },
    { path: "/billing", label: "Billing" },
    { path: "/support", label: "Support" },
  ];

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-slate-900">
        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-slate-800 shadow-lg transition-transform duration-300 ease-in-out lg:static lg:inset-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 h-16 border-b">
            <Link to="/dashboard" className="flex items-center">
              <Shield className="h-6 w-6 text-primary" />
              {isSidebarOpen && (
                <span className="ml-2 text-xl font-bold">ResilientFI</span>
              )}
            </Link>
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <nav className="space-y-1">
              {bottomLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <header className="bg-white dark:bg-slate-800 shadow-sm z-10">
            <div className="flex items-center justify-between h-16 px-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center">
                {user && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">
                      {profile?.full_name || user.email} 
                      {profile?.role && <span className="ml-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">({profile.role})</span>}
                    </span>
                    <Button variant="outline" size="sm" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
            <div className="container py-6 mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AuthenticatedLayout;
