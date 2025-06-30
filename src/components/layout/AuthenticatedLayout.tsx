
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIAssistantProvider, AIAssistantButton, AIAssistantDialog } from "@/components/ai-assistant";

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
    { path: "/app/dashboard", label: "Dashboard" },
    { path: "/app/governance", label: "Governance" },
    { path: "/app/risk-appetite", label: "Risk Appetite" },
    { path: "/app/impact-tolerances", label: "Impact Tolerances" },
    { path: "/app/business-functions", label: "Business Functions" },
    { path: "/app/dependencies", label: "Dependencies" },
    { path: "/app/tolerance-framework", label: "Tolerance Framework" },
    { path: "/app/controls-and-kri", label: "Controls & KRIs" },
    { path: "/app/third-party-risk", label: "Third-Party Risk" },
    { path: "/app/incident-log", label: "Incident Log" },
    { path: "/app/scenario-testing", label: "Scenario Testing" },
    { path: "/app/business-continuity", label: "Business Continuity" },
    { path: "/app/audit-and-compliance", label: "Audit & Compliance" },
    { path: "/app/document-management", label: "Document Management" },
    { path: "/app/integrations", label: "Integrations" },
    { path: "/app/analytics-hub", label: "Analytics Hub" },
    { path: "/app/workflow-center", label: "Workflow Center" },
    { path: "/app/dependency-mapping", label: "Dependency Mapping" },
    { path: "/app/deployment-center", label: "Deployment Center" },
    { path: "/app/reporting", label: "Reporting" },
  ];

  const bottomLinks = [
    { path: "/app/settings", label: "Settings" },
    { path: "/app/billing", label: "Billing" },
    { path: "/support", label: "Support" },
  ];

  return (
    <AIAssistantProvider>
      <TooltipProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-slate-900">
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              onClick={toggleSidebar}
            />
          )}

          {/* Sidebar */}
          <aside 
            className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out lg:static lg:inset-0 ${
              isSidebarOpen 
                ? 'w-[280px] sm:w-[320px] lg:w-64 xl:w-72 2xl:w-80 translate-x-0' 
                : 'w-0 lg:w-0 -translate-x-full lg:-translate-x-full'
            }`}
          >
            {/* Sidebar header - always show logo when sidebar is open */}
            <div className="flex items-center justify-between px-4 h-16 border-b flex-shrink-0">
              <Link to="/app/dashboard" className="flex items-center min-w-0">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="ml-2 text-xl font-bold truncate">
                    ResilientFI
                  </span>
                )}
              </Link>
              
              {/* Mobile close button */}
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md lg:hidden flex-shrink-0 ml-auto"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <ScrollArea className="flex-1">
                <nav className="px-2 py-4 space-y-1">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors group min-h-[44px] ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                        } truncate`}
                      >
                        <span className="truncate">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              {/* Sidebar footer */}
              <div className="border-t p-2 flex-shrink-0">
                <nav className="space-y-1">
                  {bottomLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                        } truncate`}
                      >
                        <span className="truncate">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Navbar */}
            <header className="bg-white dark:bg-slate-800 shadow-sm z-10 flex-shrink-0">
              <div className="flex items-center justify-between h-16 px-4">
                <div className={`flex items-center gap-6 ${!isSidebarOpen ? 'ml-4 lg:ml-8' : ''}`}>
                  {/* Menu toggle button - always show with proper spacing */}
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  
                  {/* Breadcrumb or page title - with responsive spacing */}
                  <div className="hidden sm:block text-sm text-muted-foreground">
                    {navLinks.find(link => link.path === location.pathname)?.label || 'Dashboard'}
                  </div>
                </div>

                <div className="flex items-center">
                  {user && (
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="hidden sm:block text-right">
                        <div className="text-sm font-medium truncate max-w-[150px] md:max-w-[200px]">
                          {profile?.full_name || user.email}
                        </div>
                        {profile?.role && (
                          <div className="text-xs text-muted-foreground">
                            {profile.role}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={logout} className="flex-shrink-0">
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900">
              <div className="container py-4 sm:py-6 mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
        <AIAssistantButton />
        <AIAssistantDialog />
      </TooltipProvider>
    </AIAssistantProvider>
  );
};

export default AuthenticatedLayout;
