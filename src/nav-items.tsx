
import { 
  Home, 
  FileText, 
  Shield, 
  Users, 
  TrendingUp, 
  Settings, 
  AlertTriangle, 
  CheckSquare, 
  Database, 
  Zap,
  Activity,
  BarChart3,
  Cloud,
  GitBranch,
  Network,
  Server,
  Globe,
  Target,
  Layers,
  Briefcase,
  UserCheck,
  Book,
  Wrench,
  Phone,
  HelpCircle
} from "lucide-react";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: Home,
    variant: "default" as const,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: BarChart3,
    variant: "default" as const,
  },
  {
    title: "Modules",
    icon: Layers,
    variant: "default" as const,
    submenu: [
      {
        title: "Overview",
        to: "/modules",
        icon: Layers,
      },
      {
        title: "Governance",
        to: "/modules/governance",
        icon: Shield,
      },
      {
        title: "Risk Management",
        to: "/modules/risk-management",
        icon: AlertTriangle,
      },
      {
        title: "Self Assessment",
        to: "/modules/self-assessment",
        icon: CheckSquare,
      },
    ],
  },
  {
    title: "Risk Management",
    icon: AlertTriangle,
    variant: "default" as const,
    submenu: [
      {
        title: "Risk Appetite",
        to: "/risk-appetite",
        icon: Target,
      },
      {
        title: "Risk Appetite Workflow",
        to: "/risk-management/risk-appetite-workflow",
        icon: GitBranch,
      },
      {
        title: "Controls & KRIs",
        to: "/controls-and-kri",
        icon: CheckSquare,
      },
      {
        title: "Impact Tolerances",
        to: "/impact-tolerances",
        icon: Activity,
      },
      {
        title: "Business Functions",
        to: "/business-functions",
        icon: Briefcase,
      },
      {
        title: "Dependencies",
        to: "/dependencies",
        icon: Network,
      },
      {
        title: "Tolerance Framework",
        to: "/tolerance-framework",
        icon: Target,
      },
    ],
  },
  {
    title: "Platform Architecture",
    to: "/platform-architecture",
    icon: Server,
    variant: "default" as const,
  },
  {
    title: "Security Center",
    to: "/security/enterprise-security-center",
    icon: Shield,
    variant: "default" as const,
  },
  {
    title: "Documents",
    to: "/documents",
    icon: FileText,
    variant: "default" as const,
  },
  {
    title: "Governance",
    to: "/governance",
    icon: Shield,
    variant: "default" as const,
  },
  {
    title: "Third Party Risk",
    to: "/third-party-risk",
    icon: Users,
    variant: "default" as const,
  },
  {
    title: "Incident Log",
    to: "/incident-log",
    icon: AlertTriangle,
    variant: "default" as const,
  },
  {
    title: "Analytics Hub",
    to: "/analytics",
    icon: TrendingUp,
    variant: "default" as const,
  },
  {
    title: "Compliance",
    to: "/compliance",
    icon: CheckSquare,
    variant: "default" as const,
  },
  {
    title: "Audit",
    to: "/audit",
    icon: CheckSquare,
    variant: "default" as const,
  },
  {
    title: "Scenario Testing",
    to: "/scenario-testing",
    icon: Zap,
    variant: "default" as const,
  },
  {
    title: "Business Continuity",
    to: "/business-continuity",
    icon: Activity,
    variant: "default" as const,
  },
  {
    title: "Reporting",
    to: "/reporting",
    icon: FileText,
    variant: "default" as const,
  },
  {
    title: "Integrations",
    to: "/integrations",
    icon: Database,
    variant: "default" as const,
  },
  {
    title: "Workflows",
    to: "/workflows",
    icon: GitBranch,
    variant: "default" as const,
  },
  {
    title: "Deployment",
    to: "/deployment",
    icon: Cloud,
    variant: "default" as const,
  },
  {
    title: "Enterprise",
    icon: Globe,
    variant: "default" as const,
    submenu: [
      {
        title: "Onboarding",
        to: "/enterprise-onboarding",
        icon: UserCheck,
      },
      {
        title: "User Onboarding",
        to: "/user-onboarding",
        icon: Users,
      },
      {
        title: "Customer Success",
        to: "/customer-success",
        icon: TrendingUp,
      },
      {
        title: "Training Center",
        to: "/training",
        icon: Book,
      },
    ],
  },
  {
    title: "Settings",
    to: "/settings",
    icon: Settings,
    variant: "default" as const,
  },
  {
    title: "Support",
    icon: HelpCircle,
    variant: "default" as const,
    submenu: [
      {
        title: "Help Center",
        to: "/support",
        icon: HelpCircle,
      },
      {
        title: "Contact",
        to: "/contact",
        icon: Phone,
      },
    ],
  },
];

export type NavItem = {
  title: string;
  to?: string;
  icon: any;
  variant: "default" | "ghost";
  submenu?: NavItem[];
};
