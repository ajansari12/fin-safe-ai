
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

const modules = [
  {
    title: "Governance Framework",
    description: "Establish robust governance with clear accountability structures aligned with E-21 guidelines.",
    icon: BookOpen,
    href: "/modules/governance",
    benefits: ["Clear accountability structures", "E-21 compliance", "Risk oversight processes"]
  },
  {
    title: "Self Assessment",
    description: "Identify critical operations and assess current resilience posture with comprehensive risk appetite management.",
    icon: Target,
    href: "/modules/self-assessment",
    benefits: ["Risk appetite definition", "Self-assessment tools", "Maturity tracking"]
  },
  {
    title: "Impact Tolerances",
    description: "Define tolerable levels of disruption for critical operations and monitor compliance.",
    icon: Calculator,
    href: "/modules/impact-tolerances",
    benefits: ["Tolerance definition", "Impact measurement", "Breach monitoring"]
  },
  {
    title: "Business Functions",
    description: "Map and manage critical business functions and services across your organization.",
    icon: Activity,
    href: "/modules/business-functions",
    benefits: ["Function mapping", "Criticality assessment", "Dependency tracking"]
  },
  {
    title: "Risk Management",
    description: "Identify, assess, and manage operational risks with comprehensive controls and KRI monitoring.",
    icon: Shield,
    href: "/modules/risk-management",
    benefits: ["Risk identification", "Control effectiveness", "KRI monitoring"]
  },
  {
    title: "Incident Management",
    description: "Detect, respond to, and recover from operational disruptions with structured incident management.",
    icon: AlertTriangle,
    href: "/modules/incident-management",
    benefits: ["Incident tracking", "Response workflows", "Recovery management"]
  },
  {
    title: "Third-Party Risk",
    description: "Manage risks associated with third-party service providers and supply chain dependencies.",
    icon: Users,
    href: "/modules/third-party-risk",
    benefits: ["Vendor assessment", "Contract management", "Risk monitoring"]
  },
  {
    title: "Compliance & Audit",
    description: "Track and manage regulatory compliance requirements with automated audit trails.",
    icon: FileCheck,
    href: "/modules/compliance",
    benefits: ["Compliance tracking", "Audit management", "Regulatory reporting"]
  }
];

const ModulesOverview: React.FC = () => {
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
                <Button asChild className="w-full">
                  <Link to={module.href}>Learn More</Link>
                </Button>
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
            <Button size="lg" asChild>
              <Link to="/auth/register">Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ModulesOverview;
