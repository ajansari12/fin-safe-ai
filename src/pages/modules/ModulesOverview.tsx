
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Target, 
  Calculator, 
  Activity, 
  AlertTriangle, 
  Users, 
  FileCheck,
  BookOpen,
  ChevronRight,
  CheckCircle
} from "lucide-react";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";

const modules = [
  {
    id: "governance",
    title: "Governance Framework",
    description: "Establish robust governance with clear accountability structures aligned with E-21 guidelines.",
    icon: BookOpen,
    appHref: "/app/governance",
    regulatoryMapping: ["OSFI E-21", "Basel III"],
    detailedFeatures: [
      "Three Lines of Defense model implementation",
      "Board and senior management oversight structures",
      "Risk management policy framework",
      "Automated policy review and approval workflows",
      "Compliance tracking and reporting",
      "Audit trail and change management"
    ],
    capabilities: [
      "Define roles, responsibilities, and accountability structures",
      "Implement governance policies with automated workflows",
      "Track policy compliance across the organization",
      "Generate governance reports for regulatory submissions",
      "Manage policy exceptions and approvals"
    ],
    useCases: [
      "OSFI E-21 compliance preparation",
      "Board reporting on operational resilience",
      "Internal audit support and documentation",
      "Regulatory examination readiness"
    ]
  },
  {
    id: "risk-appetite",
    title: "Risk Appetite Management",
    description: "Define and monitor your organization's risk appetite with comprehensive risk tolerance frameworks.",
    icon: Target,
    appHref: "/app/risk-appetite",
    regulatoryMapping: ["OSFI E-21", "OSFI B-10"],
    detailedFeatures: [
      "Risk appetite statement definition and management",
      "Quantitative and qualitative risk tolerance setting",
      "Real-time risk appetite monitoring and alerting",
      "Automated breach escalation workflows",
      "Board-level risk appetite reporting",
      "Integration with Key Risk Indicators (KRIs)"
    ],
    capabilities: [
      "Set enterprise-wide risk appetite thresholds",
      "Monitor risk exposure against defined tolerances",
      "Automate escalation when thresholds are breached",
      "Generate executive dashboards and reports",
      "Link risk appetite to business strategy"
    ],
    useCases: [
      "Enterprise risk management alignment",
      "Board risk appetite communication",
      "Stress testing scenario development",
      "Capital planning support"
    ]
  },
  {
    id: "impact-tolerances",
    title: "Impact Tolerances",
    description: "Define tolerable levels of disruption for critical operations and monitor compliance.",
    icon: Calculator,
    appHref: "/app/impact-tolerances",
    regulatoryMapping: ["OSFI E-21", "BCBS Guidelines"],
    detailedFeatures: [
      "Business function impact tolerance definition",
      "Recovery time objective (RTO) and recovery point objective (RPO) setting",
      "Impact tolerance breach monitoring",
      "Automated alerting for tolerance violations",
      "Cross-functional dependency impact analysis",
      "Regulatory reporting templates"
    ],
    capabilities: [
      "Define maximum tolerable downtime for critical functions",
      "Set data loss tolerance thresholds",
      "Monitor actual vs. tolerated impact levels",
      "Generate impact tolerance reports",
      "Assess cumulative impact across business lines"
    ],
    useCases: [
      "Business continuity planning",
      "Disaster recovery planning",
      "Service level agreement definition",
      "Regulatory impact reporting"
    ]
  },
  {
    id: "business-functions",
    title: "Business Functions",
    description: "Map and manage critical business functions and services across your organization.",
    icon: Activity,
    appHref: "/app/business-functions",
    regulatoryMapping: ["OSFI E-21", "OSFI B-13"],
    detailedFeatures: [
      "Critical business function identification and mapping",
      "Business service inventory management",
      "Dependency relationship tracking",
      "Criticality assessment and ranking",
      "Impact analysis and scenario modeling",
      "Regulatory classification alignment"
    ],
    capabilities: [
      "Catalog all business functions and services",
      "Assess criticality using standardized criteria",
      "Map dependencies between functions",
      "Generate business function reports",
      "Support regulatory mapping requirements"
    ],
    useCases: [
      "Operational resilience assessment",
      "Business impact analysis",
      "Recovery planning prioritization",
      "Regulatory function mapping"
    ]
  },
  {
    id: "controls-kri",
    title: "Controls & KRI Management",
    description: "Implement and monitor operational controls with Key Risk Indicators for proactive risk management.",
    icon: Shield,
    appHref: "/app/controls-and-kri",
    regulatoryMapping: ["OSFI E-21", "COSO Framework"],
    detailedFeatures: [
      "Operational control design and implementation",
      "Key Risk Indicator (KRI) definition and monitoring",
      "Control effectiveness testing and validation",
      "Automated KRI threshold alerting",
      "Control deficiency tracking and remediation",
      "Risk and control reporting dashboards"
    ],
    capabilities: [
      "Design and implement operational controls",
      "Define KRIs with automated monitoring",
      "Track control performance and effectiveness",
      "Generate control testing reports",
      "Manage control remediation activities"
    ],
    useCases: [
      "Operational risk control framework",
      "Early warning risk detection",
      "Control audit preparation",
      "Risk mitigation tracking"
    ]
  },
  {
    id: "incident-management",
    title: "Incident Management",
    description: "Detect, respond to, and recover from operational disruptions with structured incident management.",
    icon: AlertTriangle,
    appHref: "/app/incident-log",
    regulatoryMapping: ["OSFI E-21", "ITIL Framework"],
    detailedFeatures: [
      "Incident detection and classification",
      "Automated incident response workflows",
      "Root cause analysis documentation",
      "Recovery tracking and validation",
      "Post-incident review and lessons learned",
      "Regulatory incident reporting"
    ],
    capabilities: [
      "Log and track operational incidents",
      "Automate incident response procedures",
      "Conduct structured root cause analysis",
      "Monitor recovery progress",
      "Generate incident reports for regulators"
    ],
    useCases: [
      "Operational disruption management",
      "Regulatory incident reporting",
      "Business continuity activation",
      "Service restoration tracking"
    ]
  },
  {
    id: "third-party-risk",
    title: "Third-Party Risk",
    description: "Manage risks associated with third-party service providers and supply chain dependencies.",
    icon: Users,
    appHref: "/app/third-party-risk",
    regulatoryMapping: ["OSFI B-10", "OSFI E-21"],
    detailedFeatures: [
      "Third-party risk assessment and due diligence",
      "Vendor relationship and contract management",
      "Ongoing monitoring and performance tracking",
      "Concentration risk analysis",
      "Exit strategy planning and testing",
      "Regulatory reporting and notifications"
    ],
    capabilities: [
      "Assess and rate third-party risks",
      "Manage vendor contracts and SLAs",
      "Monitor third-party performance",
      "Track concentration risks",
      "Plan and test exit strategies"
    ],
    useCases: [
      "OSFI B-10 compliance",
      "Vendor risk management",
      "Supply chain resilience",
      "Contract renewal decisions"
    ]
  },
  {
    id: "audit-compliance",
    title: "Audit & Compliance",
    description: "Track and manage regulatory compliance requirements with automated audit trails.",
    icon: FileCheck,
    appHref: "/app/audit-and-compliance",
    regulatoryMapping: ["OSFI Guidelines", "PCAOB Standards"],
    detailedFeatures: [
      "Regulatory requirement tracking and mapping",
      "Compliance assessment and gap analysis",
      "Audit planning and execution support",
      "Evidence collection and documentation",
      "Remediation tracking and validation",
      "Regulatory examination support"
    ],
    capabilities: [
      "Track compliance with regulatory requirements",
      "Conduct compliance gap assessments",
      "Support internal and external audits",
      "Manage remediation activities",
      "Generate compliance reports"
    ],
    useCases: [
      "Regulatory examination preparation",
      "Internal audit support",
      "Compliance monitoring",
      "Remediation tracking"
    ]
  }
];

const ModulesOverview: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Get the hash from URL to scroll to specific module
  React.useEffect(() => {
    if (window.location.hash) {
      const element = document.getElementById(window.location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <PageLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Comprehensive Risk Management Modules
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-6">
            ResilientFI provides specialized modules designed specifically for Canadian financial institutions 
            to build operational resilience and comply with OSFI regulatory requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">OSFI E-21 Compliant</Badge>
            <Badge variant="secondary">OSFI B-10 Ready</Badge>
            <Badge variant="secondary">Basel III Aligned</Badge>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Module Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module) => (
              <a
                key={module.id}
                href={`#${module.id}`}
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <module.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{module.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Detailed Module Cards */}
        <div className="space-y-8">
          {modules.map((module, index) => (
            <Card key={index} id={module.id} className="scroll-mt-20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <module.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{module.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {module.regulatoryMapping.map((reg) => (
                      <Badge key={reg} variant="outline" className="text-xs">
                        {reg}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Features */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {module.detailedFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Target className="h-4 w-4 text-blue-500 mr-2" />
                    Core Capabilities
                  </h4>
                  <div className="space-y-2">
                    {module.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <ChevronRight className="h-3 w-3 text-primary mt-1 shrink-0" />
                        <span className="text-muted-foreground">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Activity className="h-4 w-4 text-purple-500 mr-2" />
                    Common Use Cases
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {module.useCases.map((useCase, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 bg-purple-400 rounded-full shrink-0" />
                        <span className="text-muted-foreground">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="text-center bg-primary text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Risk Management?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Experience how ResilientFI's integrated approach can streamline your operational resilience 
            program and ensure regulatory compliance across all these modules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/app/dashboard">Access Your Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/contact">Schedule Training</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/register">Start Your Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link to="/contact">Request a Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Learn More About Operational Resilience</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">OSFI E-21 Guidelines</h3>
              <p className="text-sm text-muted-foreground">
                Understand how each module aligns with OSFI's operational resilience expectations.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Implementation Guide</h3>
              <p className="text-sm text-muted-foreground">
                Step-by-step guidance for implementing operational resilience across your organization.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Best Practices</h3>
              <p className="text-sm text-muted-foreground">
                Learn from industry leaders and regulatory experts about effective risk management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ModulesOverview;
