import { HomeIcon, Users, FileText, AlertTriangle, BarChart3, SettingsIcon, Shield, Target, Activity, BookOpen, Network, TestTube, Workflow, Brain, Calculator, Briefcase, Database, FileImage, Cloud, Info, Contact as ContactIcon, Building2 } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import EnterpriseOnboarding from "./pages/EnterpriseOnboarding";
import ThirdPartyRisk from "./pages/ThirdPartyRisk";
import IncidentLog from "./pages/IncidentLog";
import ControlsAndKri from "./pages/ControlsAndKri";
import RiskAppetite from "./pages/RiskAppetite";
import SettingsPage from "./pages/Settings";
import GovernanceFramework from "./pages/GovernanceFramework";
import BusinessFunctions from "./pages/BusinessFunctions";
import ImpactTolerances from "./pages/ImpactTolerances";
import Dependencies from "./pages/Dependencies";
import ToleranceFramework from "./pages/ToleranceFramework";
import ScenarioTesting from "./pages/ScenarioTesting";
import BusinessContinuity from "./pages/BusinessContinuity";
import AuditAndCompliance from "./pages/AuditAndCompliance";
import Integrations from "./pages/Integrations";
import AnalyticsHub from "./pages/AnalyticsHub";
import WorkflowCenter from "./pages/WorkflowCenter";
import DependencyMapping from "./pages/DependencyMapping";
import Reporting from "./pages/Reporting";
import DocumentManagement from "./pages/DocumentManagement";
import DeploymentCenter from "./pages/DeploymentCenter";
import Features from "./pages/Features";
import Compliance from "./pages/Compliance";
import About from "./pages/About";
import Contact from "./pages/Contact";

/**
 * Central configuration for navigation items.
 * Public pages (no authentication required) and authenticated app pages.
 */

// Public navigation items (no authentication required)
export const publicNavItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: Index,
  },
  {
    title: "Features",
    to: "/features",
    icon: <BarChart3 className="h-4 w-4" />,
    page: Features,
  },
  {
    title: "Compliance",
    to: "/compliance",
    icon: <FileText className="h-4 w-4" />,
    page: Compliance,
  },
  {
    title: "About",
    to: "/about",
    icon: <Info className="h-4 w-4" />,
    page: About,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <ContactIcon className="h-4 w-4" />,
    page: Contact,
  },
];

// Authenticated app navigation items (require authentication)
export const appNavItems = [
  {
    title: "Dashboard",
    to: "/app/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: Dashboard,
  },
  {
    title: "Enterprise Onboarding",
    to: "/app/enterprise-onboarding",
    icon: <Building2 className="h-4 w-4" />,
    page: EnterpriseOnboarding,
  },
  {
    title: "Governance",
    to: "/app/governance",
    icon: <BookOpen className="h-4 w-4" />,
    page: GovernanceFramework,
  },
  {
    title: "Risk Appetite",
    to: "/app/risk-appetite",
    icon: <Target className="h-4 w-4" />,
    page: RiskAppetite,
  },
  {
    title: "Impact Tolerances",
    to: "/app/impact-tolerances",
    icon: <Calculator className="h-4 w-4" />,
    page: ImpactTolerances,
  },
  {
    title: "Business Functions",
    to: "/app/business-functions",
    icon: <Activity className="h-4 w-4" />,
    page: BusinessFunctions,
  },
  {
    title: "Dependencies",
    to: "/app/dependencies",
    icon: <Network className="h-4 w-4" />,
    page: Dependencies,
  },
  {
    title: "Tolerance Framework",
    to: "/app/tolerance-framework",
    icon: <Target className="h-4 w-4" />,
    page: ToleranceFramework,
  },
  {
    title: "Controls & KRI",
    to: "/app/controls-and-kri",
    icon: <Shield className="h-4 w-4" />,
    page: ControlsAndKri,
  },
  {
    title: "Third Party Risk",
    to: "/app/third-party-risk",
    icon: <Users className="h-4 w-4" />,
    page: ThirdPartyRisk,
  },
  {
    title: "Incident Log",
    to: "/app/incident-log",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: IncidentLog,
  },
  {
    title: "Scenario Testing",
    to: "/app/scenario-testing",
    icon: <TestTube className="h-4 w-4" />,
    page: ScenarioTesting,
  },
  {
    title: "Business Continuity",
    to: "/app/business-continuity",
    icon: <Briefcase className="h-4 w-4" />,
    page: BusinessContinuity,
  },
  {
    title: "Audit & Compliance",
    to: "/app/audit-and-compliance",
    icon: <FileText className="h-4 w-4" />,
    page: AuditAndCompliance,
  },
  {
    title: "Document Management",
    to: "/app/document-management",
    icon: <FileImage className="h-4 w-4" />,
    page: DocumentManagement,
  },
  {
    title: "Integrations",
    to: "/app/integrations",
    icon: <Database className="h-4 w-4" />,
    page: Integrations,
  },
  {
    title: "Analytics Hub",
    to: "/app/analytics-hub",
    icon: <Brain className="h-4 w-4" />,
    page: AnalyticsHub,
  },
  {
    title: "Workflow Center",
    to: "/app/workflow-center",
    icon: <Workflow className="h-4 w-4" />,
    page: WorkflowCenter,
  },
  {
    title: "Dependency Mapping",
    to: "/app/dependency-mapping",
    icon: <Network className="h-4 w-4" />,
    page: DependencyMapping,
  },
  {
    title: "Deployment Center",
    to: "/app/deployment-center",
    icon: <Cloud className="h-4 w-4" />,
    page: DeploymentCenter,
  },
  {
    title: "Reporting",
    to: "/app/reporting",
    icon: <FileText className="h-4 w-4" />,
    page: Reporting,
  },
  {
    title: "Settings",
    to: "/app/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: SettingsPage,
  },
];

// Combined navigation items for backward compatibility
export const navItems = [...publicNavItems, ...appNavItems];
