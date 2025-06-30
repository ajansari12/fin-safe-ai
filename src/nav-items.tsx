
import React from "react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon?: LucideIcon;
  page: React.ComponentType;
}

// Empty nav items for now since the specific navigation structure isn't defined
export const navItems: NavItem[] = [];
