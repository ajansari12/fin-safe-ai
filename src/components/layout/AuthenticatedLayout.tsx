
import React, { useState } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { EnhancedAIAssistantButton } from '@/components/ai-assistant/EnhancedAIAssistantButton';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen">
          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 w-280 bg-card border-r
            transform transition-transform duration-300 ease-in-out
            ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0'}
            lg:transform-none
          `}>
            <Sidebar 
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Overlay for mobile */}
          {!sidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* Main Content Area */}
          <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header 
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              sidebarCollapsed={sidebarCollapsed}
            />
            
            {/* Main Content */}
            <main className={`
              flex-1 p-4 md:p-6 lg:p-8 
              transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'}
              max-w-full overflow-x-hidden
            `}>
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* AI Assistant Button */}
        <EnhancedAIAssistantButton />
      </div>
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;
