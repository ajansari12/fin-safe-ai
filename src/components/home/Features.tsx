
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Activity, Database, Network, Clock, FileCheck, AlertCircle, Workflow } from "lucide-react";
import { SectionErrorBoundary } from "@/components/error/SectionErrorBoundary";

const features = [
  {
    icon: Shield,
    title: "Governance Framework",
    description:
      "Establish robust governance with clear accountability structures aligned with E-21 guidelines.",
  },
  {
    icon: Activity,
    title: "Risk Assessment",
    description:
      "Identify, assess, and manage operational risks with our comprehensive assessment tools.",
  },
  {
    icon: Database,
    title: "Critical Operations Management",
    description:
      "Map and monitor critical operations and their dependencies throughout your organization.",
  },
  {
    icon: Network,
    title: "Third-Party Risk",
    description:
      "Assess and manage third-party risks in compliance with OSFI B-10 requirements.",
  },
  {
    icon: AlertCircle,
    title: "ICT Risk Management",
    description:
      "Manage technology and cyber risks according to OSFI B-13 guidelines.",
  },
  {
    icon: FileCheck,
    title: "Compliance Validation",
    description:
      "Track compliance with automated checks against applicable regulatory standards.",
  },
  {
    icon: Clock,
    title: "Incident Management",
    description:
      "Define procedures for responding to and recovering from operational disruptions.",
  },
  {
    icon: Workflow,
    title: "AI-Powered Workflow",
    description:
      "Streamline processes with AI assistance for risk assessment and documentation.",
  },
];

const Features = () => {
  return (
    <SectionErrorBoundary>
      <section className="bg-white dark:bg-slate-950 py-24">
          <div className="section-container">
            <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Comprehensive Operational Risk Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ResilientFI provides a complete suite of tools to help financial institutions comply with OSFI guidelines and build operational resilience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover-effect">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
            </div>
          </div>
        </section>
      </SectionErrorBoundary>
    );
  };

export default Features;
