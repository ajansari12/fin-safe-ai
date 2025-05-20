
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Shield, FileCheck, AlertCircle, Network, Activity, Database, Clock, Workflow } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <PageLayout>
      <div className="section-container py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Platform Features</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the comprehensive suite of tools designed to help financial institutions build operational resilience and comply with regulatory requirements.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        
        <div className="mt-16 pt-10 border-t">
          <h2 className="text-3xl font-bold text-center mb-10">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 text-left font-medium">Feature</th>
                  <th className="p-4 text-center font-medium">Free</th>
                  <th className="p-4 text-center font-medium">Business</th>
                  <th className="p-4 text-center font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Governance Documentation</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Self-Assessment Tools</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Risk Library</td>
                  <td className="p-4 text-center">Limited</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Scenario Testing</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Third-Party Risk Management</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">AI-Powered Assistance</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">Limited</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Custom Integrations</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Advanced Analytics</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Features;
