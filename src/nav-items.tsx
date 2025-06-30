
import { LucideIcon } from "lucide-react";
import {
  Shield,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  Users,
  Building,
  Scale,
  Network,
  UserCheck,
  Target,
  Activity,
  Workflow,
  GitBranch,
  Bot,
  BookOpen,
  Briefcase,
  Calendar,
  CheckSquare,
  Database,
  FileCheck,
  Globe,
  Heart,
  HelpCircle,
  Home,
  LineChart,
  Mail,
  Map,
  Monitor,
  PieChart,
  Search,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  Upload,
  Zap,
  CreditCard,
  Phone,
  Info,
  ClipboardList,
  Layers,
  Lock,
  TestTube,
  AlertCircle,
  MapPin,
  Brain,
  Cog,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  badge?: string;
}

export const mainNavItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Features", 
    href: "/features",
    icon: Star,
  },
  {
    title: "Pricing",
    href: "/pricing", 
    icon: CreditCard,
  },
  {
    title: "About",
    href: "/about",
    icon: Info,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: Phone,
  },
];

export const dashboardNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/app/dashboard",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    title: "Incident Management",
    href: "/app/incidents",
    icon: AlertTriangle,
    description: "Track and manage incidents",
  },
  {
    title: "Governance Framework",
    href: "/app/governance",
    icon: Shield,
    description: "Policies and compliance",
  },
  {
    title: "Workflow Orchestration",
    href: "/app/workflow-orchestration",
    icon: Workflow,
    description: "Automate business processes",
  },
  {
    title: "Controls & KRIs",
    href: "/app/controls-kri",
    icon: CheckSquare,
    description: "Risk controls and indicators",
  },
  {
    title: "Risk Appetite",
    href: "/app/risk-appetite",
    icon: Target,
    description: "Risk appetite management",
  },
  {
    title: "Third Party Risk",
    href: "/app/third-party-risk",
    icon: Users,
    description: "Vendor risk management",
  },
  {
    title: "Business Continuity",
    href: "/app/business-continuity",
    icon: Heart,
    description: "Business continuity planning",
  },
  {
    title: "Scenario Testing",
    href: "/app/scenario-testing",
    icon: TestTube,
    description: "Test business scenarios",
  },
  {
    title: "Document Management",
    href: "/app/document-management",
    icon: FileText,
    description: "Document repository",
  },
  {
    title: "Reporting",
    href: "/app/reporting",
    icon: BarChart3,
    description: "Reports and analytics",
  },
  {
    title: "Analytics Hub",
    href: "/app/analytics",
    icon: PieChart,
    description: "Advanced analytics",
  },
  {
    title: "Integrations",
    href: "/app/integrations",
    icon: Globe,
    description: "System integrations",
  },
  {
    title: "Settings",
    href: "/app/settings",
    icon: Settings,
    description: "Application settings",
  },
];

export const moduleNavItems: NavItem[] = [
  {
    title: "Risk Management",
    href: "/app/risk-management",
    icon: AlertCircle,
    description: "Comprehensive risk management",
  },
  {
    title: "Governance",
    href: "/app/governance-module",
    icon: Scale,
    description: "Governance framework",
  },
  {
    title: "Self Assessment",
    href: "/app/self-assessment",
    icon: ClipboardList,
    description: "Risk self-assessment tools",
  },
];

export const additionalNavItems: NavItem[] = [
  {
    title: "Business Functions",
    href: "/app/business-functions",
    icon: Building,
    description: "Manage business functions",
  },
  {
    title: "Impact Tolerances",
    href: "/app/impact-tolerances",
    icon: Activity,
    description: "Define impact tolerances",
  },
  {
    title: "Dependencies",
    href: "/app/dependencies",
    icon: Network,
    description: "System dependencies",
  },
  {
    title: "Dependency Mapping",
    href: "/app/dependency-mapping",
    icon: Map,
    description: "Visual dependency mapping",
  },
  {
    title: "Tolerance Framework",
    href: "/app/tolerance-framework",
    icon: Layers,
    description: "Risk tolerance framework",
  },
  {
    title: "Audit & Compliance",
    href: "/app/audit-compliance",
    icon: FileCheck,
    description: "Audit and compliance management",
  },
  {
    title: "Compliance",
    href: "/app/compliance",
    icon: ShieldCheck,
    description: "Compliance monitoring",
  },
  {
    title: "Workflow Center",
    href: "/app/workflow-center",
    icon: GitBranch,
    description: "Workflow management",
  },
  {
    title: "Integration Framework",
    href: "/app/integration-framework",
    icon: Cog,
    description: "Integration framework",
  },
  {
    title: "User Onboarding",
    href: "/app/user-onboarding",
    icon: UserCheck,
    description: "User onboarding flows",
  },
  {
    title: "Enterprise Onboarding",
    href: "/app/enterprise-onboarding",
    icon: Briefcase,
    description: "Enterprise onboarding",
  },
  {
    title: "Deployment Center",
    href: "/app/deployment-center",
    icon: Upload,
    description: "Deployment management",
  },
  {
    title: "Customer Success",
    href: "/app/customer-success",
    icon: TrendingUp,
    description: "Customer success tools",
  },
  {
    title: "Personalized Dashboard",
    href: "/app/personalized-dashboard",
    icon: Monitor,
    description: "Personalized dashboard",
  },
  {
    title: "Support",
    href: "/app/support",
    icon: HelpCircle,
    description: "Help and support",
  },
  {
    title: "Billing",
    href: "/app/billing",
    icon: CreditCard,
    description: "Billing and subscriptions",
  },
];
