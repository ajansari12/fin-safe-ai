
import { HomeIcon, Users, FileText, AlertTriangle, BarChart3, SettingsIcon, Shield, Target, Activity, BookOpen, Network, TestTube, Workflow, Brain, Calculator, Briefcase, Database, FileImage, Cloud, info, contact } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
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
 * Each item represents a page in the application.
 */
export const navItems = [
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
    icon: <info className="h-4 w-4" />,
    page: About,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <contact className="h-4 w-4" />,
    page: Contact,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: Dashboard,
  },
  {
    title: "Third Party Risk",
    to: "/third-party-risk",
    icon: <Users className="h-4 w-4" />,
    page: ThirdPartyRisk,
  },
  {
    title: "Incident Log",
    to: "/incident-log",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: IncidentLog,
  },
  {
    title: "Controls & KRI",
    to: "/controls-and-kri",
    icon: <Shield className="h-4 w-4" />,
    page: ControlsAndKri,
  },
  {
    title: "Risk Appetite",
    to: "/risk-appetite",
    icon: <Target className="h-4 w-4" />,
    page: RiskAppetite,
  },
  {
    title: "Governance",
    to: "/governance-framework",
    icon: <BookOpen className="h-4 w-4" />,
    page: GovernanceFramework,
  },
  {
    title: "Business Functions",
    to: "/business-functions",
    icon: <Activity className="h-4 w-4" />,
    page: BusinessFunctions,
  },
  {
    title: "Impact Tolerances",
    to: "/impact-tolerances",
    icon: <Calculator className="h-4 w-4" />,
    page: ImpactTolerances,
  },
  {
    title: "Dependencies",
    to: "/dependencies",
    icon: <Network className="h-4 w-4" />,
    page: Dependencies,
  },
  {
    title: "Document Management",
    to: "/document-management",
    icon: <FileImage className="h-4 w-4" />,
    page: DocumentManagement,
  },
  {
    title: "Tolerance Framework",
    to: "/tolerance-framework",
    icon: <Target className="h-4 w-4" />,
    page: ToleranceFramework,
  },
  {
    title: "Scenario Testing",
    to: "/scenario-testing",
    icon: <TestTube className="h-4 w-4" />,
    page: ScenarioTesting,
  },
  {
    title: "Business Continuity",
    to: "/business-continuity",
    icon: <Briefcase className="h-4 w-4" />,
    page: BusinessContinuity,
  },
  {
    title: "Audit & Compliance",
    to: "/audit-and-compliance",
    icon: <FileText className="h-4 w-4" />,
    page: AuditAndCompliance,
  },
  {
    title: "Integrations",
    to: "/integrations",
    icon: <Database className="h-4 w-4" />,
    page: Integrations,
  },
  {
    title: "Analytics Hub",
    to: "/analytics-hub",
    icon: <Brain className="h-4 w-4" />,
    page: AnalyticsHub,
  },
  {
    title: "Workflow Center",
    to: "/workflow-center",
    icon: <Workflow className="h-4 w-4" />,
    page: WorkflowCenter,
  },
  {
    title: "Dependency Mapping",
    to: "/dependency-mapping",
    icon: <Network className="h-4 w-4" />,
    page: DependencyMapping,
  },
  {
    title: "Deployment Center",
    to: "/deployment-center",
    icon: <Cloud className="h-4 w-4" />,
    page: DeploymentCenter,
  },
  {
    title: "Reporting",
    to: "/reporting",
    icon: <FileText className="h-4 w-4" />,
    page: Reporting,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: SettingsPage,
  },
];
