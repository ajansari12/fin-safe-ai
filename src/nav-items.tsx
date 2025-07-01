import {
  HomeIcon,
  Settings,
  BarChart3,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  TrendingUp,
  CheckSquare,
  BookOpen,
  Clock,
  Briefcase,
  Target,
  GitBranch,
  Database,
  Zap,
  Brain,
  MessageSquare,
  Calendar,
  Star,
  Wrench,
  Globe,
  UserCheck,
  PieChart,
  PlayCircle,
  Search,
  Layers,
  Activity,
  Map,
  Workflow,
  Building,
  HelpCircle,
  Mail,
  CreditCard,
  ShieldCheck
} from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  {
    title: "Home",
    to: "/",
    icon: HomeIcon,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: PieChart,
  },
  {
    title: "Risk Management",
    to: "/risk-appetite",
    icon: Target,
  },
  {
    title: "Controls & KRIs",
    to: "/controls-and-kri",
    icon: CheckSquare,
  },
  {
    title: "Incident Management",
    to: "/incident-log",
    icon: AlertTriangle,
  },
  {
    title: "Governance",
    to: "/governance-framework",
    icon: BookOpen,
  },
  {
    title: "Third Party Risk",
    to: "/third-party-risk",
    icon: Briefcase,
  },
  {
    title: "Business Functions",
    to: "/business-functions",
    icon: Building,
  },
  {
    title: "Impact Tolerances",
    to: "/impact-tolerances",
    icon: TrendingUp,
  },
  {
    title: "Business Continuity",
    to: "/business-continuity",
    icon: Shield,
  },
  {
    title: "Scenario Testing",
    to: "/scenario-testing",
    icon: PlayCircle,
  },
  {
    title: "Dependencies",
    to: "/dependencies",
    icon: Layers,
  },
  {
    title: "Dependency Mapping",
    to: "/dependency-mapping",
    icon: Map,
  },
  {
    title: "Document Management",
    to: "/document-management",
    icon: FileText,
  },
  {
    title: "Audit & Compliance",
    to: "/audit-and-compliance",
    icon: CheckSquare,
  },
  {
    title: "Analytics Hub",
    to: "/analytics-hub",
    icon: BarChart3,
  },
  {
    title: "Reporting",
    to: "/reporting",
    icon: FileText,
  },
  {
    title: "Workflow Center",
    to: "/workflow-center",
    icon: Workflow,
  },
  {
    title: "Workflow Orchestration",
    to: "/workflow-orchestration",
    icon: GitBranch,
  },
  {
    title: "Collaboration",
    to: "/collaboration-platform",
    icon: MessageSquare,
  },
  {
    title: "Integrations",
    to: "/integrations",
    icon: Database,
  },
  {
    title: "Integration Framework",
    to: "/integration-framework",
    icon: Zap,
  },
  {
    title: "Enterprise Security",
    to: "/security/enterprise-security-center",
    icon: ShieldCheck,
    badge: "New"
  },
  {
    title: "User Onboarding",
    to: "/user-onboarding",
    icon: UserCheck,
  },
  {
    title: "Enterprise Onboarding",
    to: "/enterprise-onboarding",
    icon: Star,
  },
  {
    title: "Deployment Center",
    to: "/deployment-center",
    icon: Wrench,
  },
  {
    title: "Customer Success",
    to: "/customer-success",
    icon: Users,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: Settings,
  },
  {
    title: "Support",
    to: "/support",
    icon: HelpCircle,
  }
];

export const riskManagementItems: NavItem[] = [
  {
    title: "Risk Appetite",
    to: "/risk-appetite",
    icon: Target,
  },
  {
    title: "Controls & KRIs",
    to: "/controls-and-kri",
    icon: CheckSquare,
  },
  {
    title: "Incident Management",
    to: "/incident-log",
    icon: AlertTriangle,
  },
  {
    title: "Third Party Risk",
    to: "/third-party-risk",
    icon: Briefcase,
  }
];

export const governanceItems: NavItem[] = [
  {
    title: "Governance Framework",
    to: "/governance-framework",
    icon: BookOpen,
  },
  {
    title: "Compliance",
    to: "/compliance",
    icon: CheckSquare,
  },
  {
    title: "Audit & Compliance",
    to: "/audit-and-compliance",
    icon: Shield,
  }
];

export const operationalItems: NavItem[] = [
  {
    title: "Business Functions",
    to: "/business-functions",
    icon: Building,
  },
  {
    title: "Impact Tolerances",
    to: "/impact-tolerances",
    icon: TrendingUp,
  },
  {
    title: "Business Continuity",
    to: "/business-continuity",
    icon: Shield,
  },
  {
    title: "Scenario Testing",
    to: "/scenario-testing",
    icon: PlayCircle,
  },
  {
    title: "Dependencies",
    to: "/dependencies",
    icon: Layers,
  },
  {
    title: "Dependency Mapping",
    to: "/dependency-mapping",
    icon: Map,
  }
];

export const analyticsItems: NavItem[] = [
  {
    title: "Analytics Hub",
    to: "/analytics-hub",
    icon: BarChart3,
  },
  {
    title: "Reporting",
    to: "/reporting",
    icon: FileText,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: PieChart,
  }
];

export const collaborationItems: NavItem[] = [
  {
    title: "Document Management",
    to: "/document-management",
    icon: FileText,
  },
  {
    title: "Collaboration Platform",
    to: "/collaboration-platform",
    icon: MessageSquare,
  },
  {
    title: "Workflow Center",
    to: "/workflow-center",
    icon: Workflow,
  }
];

export const integrationItems: NavItem[] = [
  {
    title: "Integrations",
    to: "/integrations",
    icon: Database,
  },
  {
    title: "Integration Framework",
    to: "/integration-framework",
    icon: Zap,
  },
  {
    title: "Workflow Orchestration",
    to: "/workflow-orchestration",
    icon: GitBranch,
  }
];

export const securityItems: NavItem[] = [
  {
    title: "Enterprise Security",
    to: "/security/enterprise-security-center",
    icon: ShieldCheck,
    badge: "New"
  }
];
