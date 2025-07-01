
import { HomeIcon, BarChart3, FileText, Users, Shield, Calendar, Briefcase, Settings, Globe, MessageSquare, Video, BookOpen, Brain, TrendingUp, GitBranch, Workflow, Building2, Network, AlertTriangle } from "lucide-react";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: HomeIcon,
    variant: "default" as const,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: BarChart3,
    variant: "ghost" as const,
  },
  {
    title: "Analytics Hub",
    to: "/analytics-hub",
    icon: TrendingUp,
    variant: "ghost" as const,
  },
  {
    title: "Collaboration",
    to: "/collaboration",
    icon: MessageSquare,
    variant: "ghost" as const,
  },
  {
    title: "Risk Appetite",
    to: "/risk-appetite",
    icon: AlertTriangle,
    variant: "ghost" as const,
  },
  {
    title: "Controls & KRI",
    to: "/controls-and-kri",
    icon: Shield,
    variant: "ghost" as const,
  },
  {
    title: "Third Party Risk",
    to: "/third-party-risk",
    icon: Network,
    variant: "ghost" as const,
  },
  {
    title: "Dependencies",
    to: "/dependencies",
    icon: GitBranch,
    variant: "ghost" as const,
  },
  {
    title: "Business Continuity",
    to: "/business-continuity",
    icon: Building2,
    variant: "ghost" as const,
  },
  {
    title: "Incident Log",
    to: "/incident-log",
    icon: FileText,
    variant: "ghost" as const,
  },
  {
    title: "Governance",
    to: "/governance",
    icon: Briefcase,
    variant: "ghost" as const,
  },
  {
    title: "Documents",
    to: "/documents",
    icon: FileText,
    variant: "ghost" as const,
  },
  {
    title: "Reporting",
    to: "/reporting",
    icon: BarChart3,
    variant: "ghost" as const,
  },
  {
    title: "Workflow Center",
    to: "/workflow-center",
    icon: Workflow,
    variant: "ghost" as const,
  }
];
