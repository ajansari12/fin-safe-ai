
import {
  Home,
  LayoutDashboard,
  Scale,
  ShieldAlert,
  Settings,
  Building2,
  BarChart3,
  Zap,
  LucideIcon,
  ListChecks,
  FileSliders,
  Network,
  HelpCircle,
  AlertTriangle,
  KanbanSquare,
} from "lucide-react";

interface NavigationItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavigationItem[];
}

export const navItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Risk Management",
    url: "/app/risk-appetite",
    icon: Scale,
    items: [
      {
        title: "Risk Appetite",
        url: "/app/risk-appetite",
      },
      {
        title: "Controls & KRIs",
        url: "/app/controls-and-kri",
      },
      {
        title: "Impact Tolerances", 
        url: "/app/impact-tolerances",
      },
    ],
  },
  {
    title: "Governance",
    url: "/app/governance",
    icon: Building2,
    items: [
      {
        title: "Framework",
        url: "/app/governance",
      },
      {
        title: "Business Functions",
        url: "/app/business-functions",
      },
      {
        title: "Dependencies",
        url: "/app/dependencies",
      },
    ],
  },
  {
    title: "Third Party Risk",
    url: "/app/third-party-risk",
    icon: Network,
  },
  {
    title: "Incident Management",
    url: "/app/incident-log",
    icon: AlertTriangle,
  },
  {
    title: "Business Continuity",
    url: "/app/business-continuity",
    icon: ShieldAlert,
    items: [
      {
        title: "Continuity Plans",
        url: "/app/business-continuity",
      },
      {
        title: "Scenario Testing",
        url: "/app/scenario-testing",
      },
      {
        title: "Dependency Mapping",
        url: "/app/dependency-mapping",
      },
    ],
  },
  {
    title: "Analytics",
    url: "/app/analytics",
    icon: BarChart3,
    items: [
      {
        title: "Analytics Hub",
        url: "/app/analytics",
      },
      {
        title: "Organizational Intelligence",
        url: "/app/organizational-intelligence",
      },
    ],
  },
  {
    title: "Enterprise",
    url: "/app/integrations",
    icon: Zap,
    items: [
      {
        title: "Integrations",
        url: "/app/integrations",
      },
      {
        title: "Document Management",
        url: "/app/document-management",
      },
      {
        title: "Audit & Compliance",
        url: "/app/audit-and-compliance",
      },
      {
        title: "Reporting",
        url: "/app/reporting",
      },
    ],
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];
