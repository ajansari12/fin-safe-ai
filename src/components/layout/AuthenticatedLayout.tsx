
import React from 'react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { EnhancedAIAssistantButton } from '@/components/ai-assistant/EnhancedAIAssistantButton';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayoutContent: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { isCollapsed, toggleSidebar, closeSidebar } = useSidebar();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Grid Layout - Responsive to sidebar state */}
      <div className={`
        grid min-h-screen transition-all duration-300 ease-in-out
        ${isCollapsed 
          ? 'grid-cols-1 lg:grid-cols-[64px_1fr]' 
          : 'grid-cols-1 lg:grid-cols-[280px_1fr]'
        }
      `}>
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 bg-card border-r
          transform transition-transform duration-300 ease-in-out
          ${isCollapsed 
            ? '-translate-x-full lg:translate-x-0 lg:w-16 w-280' 
            : 'translate-x-0 w-280'
          }
          lg:transform-none
        `}>
          <Sidebar 
            collapsed={isCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>

        {/* Overlay for mobile */}
        {!isCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <Header 
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={isCollapsed}
          />
          
          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* AI Assistant Button */}
      <EnhancedAIAssistantButton />
    </div>
  );
};

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AuthenticatedLayoutContent>
        {children}
      </AuthenticatedLayoutContent>
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;
