import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { RoleAwareComponent } from "@/components/ui/RoleAwareComponent";
import { usePermissions } from "@/contexts/PermissionContext";
import { ROUTE_PERMISSIONS, getRoutePermissions } from "@/config/permissions";

interface NavigationItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavigationItem[];
  requiredRole?: string;
  requiredAnyRole?: string[];
  requiredPermission?: string;
  requiredAnyPermission?: string[];
  adminOnly?: boolean;
}

interface RoleAwareNavigationProps {
  items: NavigationItem[];
  className?: string;
  onItemClick?: () => void;
}

export const RoleAwareNavigation: React.FC<RoleAwareNavigationProps> = ({
  items,
  className = "",
  onItemClick
}) => {
  const location = useLocation();
  const { hasPermission, hasRole, hasAnyRole, isOrgAdmin } = usePermissions();

  // TODO: LOGGER_MIGRATION - Remove excessive debug logging in navigation
  // FIXME: Replace with logger.debug in development only
  const permissionFunctionsReady = typeof hasPermission === 'function' && 
                                  typeof hasRole === 'function' && 
                                  typeof hasAnyRole === 'function' && 
                                  typeof isOrgAdmin === 'function';

  // Development debugging removed - now using structured logger where needed

  const isItemAccessible = (item: NavigationItem): boolean => {
    // EMERGENCY FALLBACK: If permission system is not ready, show basic navigation items
    if (!permissionFunctionsReady) {
      // TODO: LOGGER_MIGRATION - Replace with logger.warn
      // Show essential navigation items when permissions aren't loaded
      const basicAccessibleRoutes = [
        '/app/dashboard', 
        '/app/risk-appetite', 
        '/app/governance', 
        '/app/incident-log', 
        '/app/analytics',
        '/app/settings'
      ];
      return basicAccessibleRoutes.includes(item.url);
    }

    // Check route-specific permissions first
    const routePermissions = getRoutePermissions(item.url);
    if (routePermissions) {
      // Admin only check
      if (routePermissions.adminOnly && !isOrgAdmin()) {
        return false;
      }
      
      // Role requirements
      if (routePermissions.requiredRole && !hasRole(routePermissions.requiredRole)) {
        return false;
      }
      
      if (routePermissions.requiredAnyRole && !hasAnyRole(routePermissions.requiredAnyRole)) {
        return false;
      }
      
      // Permission requirements
      if (routePermissions.requiredPermission && !hasPermission(routePermissions.requiredPermission)) {
        return false;
      }
      
      if (routePermissions.requiredAnyPermission && 
          !routePermissions.requiredAnyPermission.some(permission => hasPermission(permission))) {
        return false;
      }
    }

    // Check item-specific permissions (fallback)
    if (item.adminOnly && !isOrgAdmin()) {
      return false;
    }
    
    if (item.requiredRole && !hasRole(item.requiredRole)) {
      return false;
    }
    
    if (item.requiredAnyRole && !hasAnyRole(item.requiredAnyRole)) {
      return false;
    }
    
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false;
    }
    
    if (item.requiredAnyPermission && 
        !item.requiredAnyPermission.some(permission => hasPermission(permission))) {
      return false;
    }

    return true;
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const accessible = isItemAccessible(item);
    
    if (!accessible) {
      return null;
    }

    const isActive = location.pathname === item.url;
    const hasAccessibleSubItems = item.items?.some(subItem => isItemAccessible(subItem));

    // If item has subitems but none are accessible, don't render
    if (item.items && !hasAccessibleSubItems) {
      return null;
    }

    return (
      <div key={item.url}>
        <Link
          to={item.url}
          onClick={onItemClick}
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors group min-h-[44px] ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
          } truncate`}
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />}
          <span className="truncate">{item.title}</span>
        </Link>
        
        {item.items && hasAccessibleSubItems && (
          <div className="ml-4 mt-1 space-y-1">
            {item.items.map(subItem => renderNavigationItem(subItem))}
          </div>
        )}
      </div>
    );
  };

  const renderedItems = items.map(item => renderNavigationItem(item)).filter(Boolean);

  return (
    <nav className={`space-y-1 ${className}`}>
      {renderedItems.length > 0 ? (
        renderedItems
      ) : (
        <div className="p-4 text-sm text-muted-foreground">
          <p className="mb-2">
            {!permissionFunctionsReady ? 'Loading permissions...' : 'No accessible items found'}
          </p>
          <p className="text-xs">
            {!permissionFunctionsReady 
              ? 'Initializing role-based navigation...' 
              : 'Your role may have limited access. Contact admin if this seems wrong.'
            }
          </p>
          {/* Emergency navigation fallback */}
          {!permissionFunctionsReady && (
            <div className="mt-3 space-y-1">
              <Link to="/app/dashboard" className="block text-xs hover:text-primary">→ Dashboard</Link>
              <Link to="/app/settings" className="block text-xs hover:text-primary">→ Settings</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default RoleAwareNavigation;