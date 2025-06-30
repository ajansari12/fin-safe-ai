
import React from "react";
import { LucideIcon } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";

export interface NavItem {
  title: string;
  to: string;
  icon?: LucideIcon;
  page: React.ComponentType;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    to: "/dashboard",
    page: Dashboard,
  },
  {
    title: "Personalized Dashboard",
    to: "/personalized-dashboard",
    page: PersonalizedDashboard,
  }
];
