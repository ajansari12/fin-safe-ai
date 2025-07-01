
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Target, 
  Calculator, 
  Activity, 
  AlertTriangle, 
  Users, 
  FileCheck,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  {
    title: "Governance Framework",
    description: "Establish robust governance with clear accountability structures aligned with E-21 guidelines.",
    icon: BookOpen,
    appHref: "/app/governance",
    benefits: ["Clear accountability structures", "E-21 compliance", "Risk oversight processes"]
  },
  {
    title: "Risk Appetite Management",
    description: "Define and monitor your organization's risk appetite with comprehensive risk tolerance frameworks.",
    icon: Target,
    appHref: "/app/risk-appetite",
    benefits: ["Risk appetite definition", "Tolerance monitoring", "Breach alerting"]
  },
  {
    title: "Impact Tolerances",
    description: "Define tolerable levels of disruption for critical operations and monitor compliance.",
    icon: Calculator,
    appHref: "/app/impact-tolerances",
    benefits: ["Tolerance definition", "Impact measurement", "Breach monitoring"]
  },
  {
    title: "Business Functions",
    description: "Map and manage critical business functions and services across your organization.",
    icon: Activity,
    appHref: "/app/business-functions",
    benefits: ["Function mapping", "Criticality assessment", "Dependency tracking"]
  },
  {
    title: "Controls & KRI Management",
    description: "Implement and monitor operational controls with Key Risk Indicators for proactive risk management.",
    icon: Shield,
    appHref: "/app/controls-and-kri",
    benefits: ["Control effectiveness", "KRI monitoring", "Risk mitigation"]
  },
  {
    title: "Incident Management",
    description: "Detect, respond to, and recover from operational disruptions with structured incident management.",
    icon: AlertTriangle,
    appHref: "/app/incident-log",
    benefits: ["Incident tracking", "Response workflows", "Recovery management"]
  },
  {
    title: "Third-Party Risk",
    description: "Manage risks associated with third-party service providers and supply chain dependencies.",
    icon: Users,
    appHref: "/app/third-party-risk",
    benefits: ["Vendor assessment", "Contract management", "Risk monitoring"]
  },
  {
    title: "Audit & Compliance",
    description: "Track and manage regulatory compliance requirements with automated audit trails.",
    icon: FileCheck,
    appHref: "/app/audit-and-compliance",
    benefits: ["Compliance tracking", "Audit management", "Regulatory reporting"]
  }
];

const ModulesOverview: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <PageLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Comprehensive Risk Management Modules
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ResilientFI provides specialized modules to help financial institutions build operational resilience 
            and comply with regulatory requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card key={index} className="card-hover-effect h-full">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <module.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{module.title}</CardTitle>
                <CardDescription className="text-base">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Key Benefits:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {module.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                {isAuthenticated ? (
                  <Button asChild className="w-full">
                    <Link to={module.appHref}>Access Module</Link>
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/register">Start Free Trial</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login">Login to Access</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience the power of integrated operational risk management. 
            Start your free trial today and see how ResilientFI can transform your risk management approach.
          </p>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link to="/app/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link to="/register">Start Free Trial</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Schedule Demo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ModulesOverview;
