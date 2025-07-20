
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavigationItem[];
}

interface RoleAwareNavigationProps {
  items: NavigationItem[];
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

const RoleAwareNavigation: React.FC<RoleAwareNavigationProps> = ({
  items,
  isCollapsed = false,
  onItemClick
}) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set());

  // Keep groups open if they contain the active route
  React.useEffect(() => {
    const activeGroups = new Set<string>();
    items.forEach(item => {
      if (item.items) {
        const hasActiveChild = item.items.some(child => 
          location.pathname === child.url || 
          location.pathname.startsWith(child.url + '/') ||
          (child.url.includes('?') && location.pathname === child.url.split('?')[0])
        );
        if (hasActiveChild || location.pathname === item.url) {
          activeGroups.add(item.url);
        }
      }
    });
    setOpenGroups(activeGroups);
  }, [location.pathname, items]);

  const toggleGroup = (groupUrl: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupUrl)) {
        newSet.delete(groupUrl);
      } else {
        newSet.add(groupUrl);
      }
      return newSet;
    });
  };

  const isActiveUrl = (url: string) => {
    if (url.includes('?')) {
      // Handle URLs with query parameters
      const baseUrl = url.split('?')[0];
      return location.pathname === baseUrl;
    }
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = isActiveUrl(item.url);
    const hasChildren = item.items && item.items.length > 0;
    const isGroupOpen = openGroups.has(item.url);

    if (isCollapsed) {
      // Collapsed state - show only icons with tooltips
      return (
        <Tooltip key={item.url}>
          <TooltipTrigger asChild>
            <Link
              to={item.url}
              onClick={onItemClick}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (hasChildren) {
      // Parent item with children
      return (
        <Collapsible
          key={item.url}
          open={isGroupOpen}
          onOpenChange={() => toggleGroup(item.url)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors min-h-[44px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center min-w-0">
                {Icon && <Icon className="h-5 w-5 mr-3 flex-shrink-0" />}
                <span className="truncate">{item.title}</span>
              </div>
              {isGroupOpen ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-8 mt-1 space-y-1">
              {item.items?.map(subItem => (
                <Link
                  key={subItem.url}
                  to={subItem.url}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors min-h-[36px]",
                    isActiveUrl(subItem.url)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <span className="truncate">{subItem.title}</span>
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Single item without children
    return (
      <Link
        key={item.url}
        to={item.url}
        onClick={onItemClick}
        className={cn(
          "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors min-h-[44px]",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <div className="flex items-center min-w-0">
          {Icon && <Icon className="h-5 w-5 mr-3 flex-shrink-0" />}
          <span className="truncate">{item.title}</span>
        </div>
      </Link>
    );
  };

  return (
    <nav className="space-y-1">
      {items.map(renderNavigationItem)}
    </nav>
  );
};

export default RoleAwareNavigation;
