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
  icon: LucideIcon;
  items?: NavigationItem[];
}

export const navItems: NavigationItem[] = [
  {
    title: "Home",
    url: "/app",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Risk Appetite",
    url: "/app/risk-appetite",
    icon: Scale,
  },
  {
    title: "Controls",
    url: "/app/controls",
    icon: ListChecks,
  },
  {
    title: "Third Party Risk",
    url: "/app/third-party-risk",
    icon: Network,
    items: [
      {
        title: "Vendor Profiles",
        url: "/app/third-party-risk",
      },
      {
        title: "Risk Assessments",
        url: "/app/third-party-risk/assessments",
      },
      {
        title: "Supply Chain",
        url: "/app/third-party-risk/supply-chain",
      },
    ],
  },
  {
    title: "Scenario Testing",
    url: "/app/scenario-testing",
    icon: FileSliders,
  },
  {
    title: "Integrations",
    url: "/app/integrations",
    icon: Zap,
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
    title: "Knowledge Base",
    url: "/app/knowledge-base",
    icon: HelpCircle,
  },
  {
    title: "Incident Management",
    url: "/app/incident-management",
    icon: AlertTriangle,
    items: [
      {
        title: "Incident Logs",
        url: "/app/incident-management",
      },
      {
        title: "Playbooks",
        url: "/app/incident-management/playbooks",
      },
    ],
  },
  {
    title: "Policy Management",
    url: "/app/policy-management",
    icon: KanbanSquare,
    items: [
      {
        title: "Policies",
        url: "/app/policy-management",
      },
      {
        title: "Exceptions",
        url: "/app/policy-management/exceptions",
      },
    ],
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: Settings,
  },
];
