
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EnhancedAIAssistantProvider } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import { EnhancedAIAssistantButton } from "@/components/ai-assistant/EnhancedAIAssistantButton";
import { EnhancedAIAssistantWithVoice } from "@/components/ai-assistant/EnhancedAIAssistantWithVoice";
import { navItems } from "@/nav-items";
import RoleAwareNavigation from "@/components/navigation/RoleAwareNavigation";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

// Sidebar state management
const useSidebarState = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On mobile, sidebar should be closed by default
      if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      // On desktop, restore sidebar state from localStorage
      if (!mobile) {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState !== null) {
          setIsCollapsed(JSON.parse(savedState));
        }
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsed));
    }
  };

  return {
    isSidebarOpen,
    isCollapsed,
    isMobile,
    toggleSidebar,
    setIsSidebarOpen
  };
};

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const { isSidebarOpen, isCollapsed, isMobile, toggleSidebar, setIsSidebarOpen } = useSidebarState();

  // Convert nav items to navigation format
  const navigationItems = navItems.map(item => ({
    title: item.title,
    url: item.url,
    icon: item.icon,
    items: item.items?.map(subItem => ({
      title: subItem.title,
      url: subItem.url,
    })),
  }));

  const bottomLinks = [
    { path: "/app/settings", label: "Settings" },
    { path: "/app/billing", label: "Billing" },
    { path: "/support", label: "Support" },
  ];

  // Calculate sidebar width classes
  const getSidebarClasses = () => {
    if (isMobile) {
      return isSidebarOpen 
        ? "w-80 translate-x-0" 
        : "w-80 -translate-x-full";
    }
    
    if (isCollapsed) {
      return "w-16";
    }
    
    return "w-64 xl:w-72 2xl:w-80";
  };

  return (
    <EnhancedAIAssistantProvider>
      <TooltipProvider>
        <div className="grid grid-cols-[auto_1fr] min-h-screen w-full bg-gray-100 dark:bg-slate-900">
          {/* Mobile overlay */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside 
            className={`${getSidebarClasses()} ${
              isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'
            } flex flex-col bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 ease-in-out`}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 h-16 border-b flex-shrink-0">
              <Link to="/app/dashboard" className="flex items-center min-w-0">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-2 text-xl font-bold truncate">
                    ResilientFI
                  </span>
                )}
              </Link>
              
              {/* Toggle button - only show on desktop when not collapsed */}
              {!isMobile && !isCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sidebar content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="px-2 py-4">
                  <RoleAwareNavigation 
                    items={navigationItems}
                    isCollapsed={isCollapsed && !isMobile}
                    onItemClick={() => {
                      if (isMobile) {
                        setIsSidebarOpen(false);
                      }
                    }}
                  />
                </div>
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
                          if (isMobile) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                        } ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
                        title={isCollapsed && !isMobile ? link.label : undefined}
                      >
                        {!isCollapsed || isMobile ? (
                          <span className="truncate">{link.label}</span>
                        ) : (
                          <span className="text-xs">{link.label.charAt(0)}</span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex flex-col min-w-0 overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-sm z-10 flex-shrink-0">
              <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center gap-4">
                  {/* Menu toggle button */}
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                    aria-label={isMobile ? (isSidebarOpen ? 'Close menu' : 'Open menu') : (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
                  >
                    {isMobile ? (
                      <Menu className="h-5 w-5" />
                    ) : isCollapsed ? (
                      <Menu className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Page title */}
                  <div className="hidden sm:block text-sm text-muted-foreground">
                    {navItems.find(item => item.url === location.pathname)?.title || 
                     navItems.flatMap(item => item.items || [])
                            .find(subItem => subItem.url === location.pathname)?.title || 'Dashboard'}
                  </div>
                </div>

                {/* User section */}
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
        <EnhancedAIAssistantButton />
        <EnhancedAIAssistantWithVoice />
      </TooltipProvider>
    </EnhancedAIAssistantProvider>
  );
};

export default AuthenticatedLayout;
