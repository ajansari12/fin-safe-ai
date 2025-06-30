
import React from "react";
import { LucideIcon } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";
import WorkflowCenter from "./pages/WorkflowCenter";

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
  },
  {
    title: "Workflow Center",
    to: "/workflow-center",
    page: WorkflowCenter,
  }
];
