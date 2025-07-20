import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Shield, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/app/dashboard',
    icon: Home,
  },
  {
    title: 'OSFI Compliance',
    href: '/app/osfi-compliance',
    icon: Shield,
  },
  {
    title: 'Risk Appetite',
    href: '/app/risk-appetite',
    icon: TrendingUp,
  },
  {
    title: 'Third Party Risk',
    href: '/app/third-party-risk',
    icon: Users,
  },
  {
    title: 'Business Continuity',
    href: '/app/business-continuity',
    icon: AlertTriangle,
  },
  {
    title: 'Analytics',
    href: '/app/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();

  return (
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
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;