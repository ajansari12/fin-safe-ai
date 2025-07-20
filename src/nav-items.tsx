
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
  Shield,
  Target,
  Cog,
  Brain,
  Workflow,
  Globe,
  FileText,
  Bell,
} from "lucide-react";

interface NavigationItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavigationItem[];
  badge?: string;
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
    title: "Operational Resilience",
    url: "/app/operational-resilience",
    icon: Target,
  },
  {
    title: "Framework Management", 
    url: "/app/framework-management",
    icon: Cog,
  },
  {
    title: "Technology & Cyber Risk",
    url: "/app/technology-cyber-risk",
    icon: Shield,
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
    title: "Regulatory Reporting",
    url: "/app/regulatory-reporting",
    icon: FileText,
    badge: "New"
  },
  {
    title: "Notifications",
    url: "/app/notifications",
    icon: Bell,
  },
  {
    title: "OSFI E-21 Compliance",
    url: "/app/osfi-compliance",
    icon: Shield,
    items: [
      {
        title: "Compliance Dashboard",
        url: "/app/osfi-compliance",
      },
      {
        title: "Governance Oversight",
        url: "/app/osfi-compliance?tab=governance",
      },
      {
        title: "Risk Framework",
        url: "/app/osfi-compliance?tab=risk-taxonomy",
      },
      {
        title: "Real-time Monitoring",
        url: "/app/osfi-compliance?tab=monitoring",
      },
      {
        title: "Scenario Testing",
        url: "/app/osfi-compliance?tab=scenarios",
      },
    ],
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
    title: "AI Intelligence",
    url: "/app/ai-intelligence",
    icon: Brain,
  },
  {
    title: "Workflow Automation",
    url: "/app/workflow-automation", 
    icon: Workflow,
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
