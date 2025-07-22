
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
      {/* Main Grid Layout - Fixed responsive grid implementation */}
      <div className="grid min-h-screen transition-all duration-300 ease-in-out lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Fixed positioning and responsiveness */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 bg-card border-r
          transform transition-transform duration-300 ease-in-out
          w-280 lg:w-280
          ${isCollapsed 
            ? '-translate-x-full lg:translate-x-0 lg:w-16' 
            : 'translate-x-0'
          }
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

        {/* Main Content Area - Proper spacing and overflow handling */}
        <div className="flex flex-col min-h-screen lg:ml-0">
          {/* Header */}
          <Header 
            onToggleSidebar={toggleSidebar}
            sidebarCollapsed={isCollapsed}
          />
          
          {/* Main Content - Proper padding and overflow handling */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-full mx-auto">
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
