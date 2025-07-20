
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  FileText,
  Users,
  Settings,
  Building2,
  BookOpen,
  TrendingUp,
  BarChart3,
  Bell,
  Workflow,
  Activity,
  PieChart
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<any>;
  isActive?: boolean;
  items?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    url: "/app/analytics",
    icon: BarChart3,
    items: [
      {
        title: "Analytics Hub",
        url: "/app/analytics",
        icon: TrendingUp,
      },
      {
        title: "Advanced Dashboards",
        url: "/app/analytics/dashboards",
        icon: PieChart,
      },
      {
        title: "Custom Dashboard",
        url: "/app/analytics/custom-dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Risk Management",
    url: "/app/risk-management",
    icon: AlertTriangle,
    items: [
      {
        title: "Risk Categories",
        url: "/app/risk-management/categories",
        icon: AlertTriangle,
      },
      {
        title: "Risk Appetite",
        url: "/app/risk-management/appetite",
        icon: TrendingUp,
      },
      {
        title: "Incidents",
        url: "/app/risk-management/incidents",
        icon: AlertTriangle,
      },
      {
        title: "KRI Management",
        url: "/app/risk-management/kris",
        icon: Activity,
      },
    ],
  },
  {
    title: "Controls",
    url: "/app/controls",
    icon: Shield,
  },
  {
    title: "Business Continuity",
    url: "/app/business-continuity",
    icon: Building2,
  },
  {
    title: "Third Party Risk",
    url: "/app/third-party-risk",
    icon: Users,
  },
  {
    title: "Governance",
    url: "/app/governance",
    icon: FileText,
  },
  {
    title: "Documents",
    url: "/app/documents",
    icon: BookOpen,
  },
  {
    title: "Workflow Automation",
    url: "/app/workflow-automation",
    icon: Workflow,
  },
  {
    title: "Notifications",
    url: "/app/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];
