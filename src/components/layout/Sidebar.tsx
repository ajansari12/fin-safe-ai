
import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { navItems } from '@/nav-items';
import RoleAwareNavigation from '@/components/navigation/RoleAwareNavigation';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();

  return (
    <TooltipProvider>
      <div className={cn(
        "h-full bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-280"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-foreground">FinSafe AI</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2 overflow-y-auto">
          <RoleAwareNavigation 
            items={navItems}
            isCollapsed={collapsed}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
