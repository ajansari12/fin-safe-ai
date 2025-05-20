
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const complianceFrameworks = [
  {
    id: "e21",
    title: "OSFI E-21",
    subtitle: "Operational Risk Management",
    description: "OSFI's E-21 guideline establishes expectations for the management of operational risk. It requires financial institutions to develop robust frameworks to identify, assess, measure, monitor, and mitigate operational risk exposures.",
    key_requirements: [
      "Develop and maintain an operational risk appetite",
      "Map critical operations and their dependencies",
      "Establish impact tolerances for disruptions",
      "Test resilience through scenario analysis",
      "Develop effective response and recovery capabilities",
      "Maintain robust governance and oversight",
    ],
  },
  {
    id: "b10",
    title: "OSFI B-10",
    subtitle: "Third-Party Risk Management",
    description: "The B-10 guideline addresses risks associated with third-party arrangements. It outlines expectations for financial institutions to effectively identify, assess, manage, and monitor risks arising from the use of third parties.",
    key_requirements: [
      "Risk-based due diligence of third parties",
      "Regular assessment of third-party relationships",
      "Contract management and monitoring",
      "Business continuity planning for third-party services",
      "Concentration risk management",
    ],
  },
  {
    id: "b13",
    title: "OSFI B-13",
    subtitle: "Technology and Cyber Risk Management",
    description: "The B-13 guideline focuses on the sound management of technology and cyber risks. It provides expectations for financial institutions to develop frameworks for identifying, assessing, managing, and monitoring these risks.",
    key_requirements: [
      "Technology asset management",
      "Cyber security controls and defenses",
      "Technology operations management",
      "Cyber incident management",
      "Technology resilience and recovery capabilities",
    ],
  },
  {
    id: "iso22301",
    title: "ISO 22301",
    subtitle: "Business Continuity Management",
    description: "ISO 22301 is the international standard for business continuity management systems. It provides a framework for organizations to identify potential threats and build capability for an effective response.",
    key_requirements: [
      "Business impact analysis",
      "Risk assessment and treatment",
      "Business continuity strategy",
      "Documented business continuity plans",
      "Regular testing and exercises",
      "Performance evaluation and improvement",
    ],
  },
];

const Compliance = () => {
  return (
    <PageLayout>
      <div className="section-container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Regulatory Compliance</h1>
            <p className="text-xl text-muted-foreground">
              Understanding the regulatory landscape for operational resilience in Canadian financial institutions
            </p>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-12">
            <p className="lead">
              The Canadian financial regulatory environment is evolving rapidly, with increasing focus on operational resilience. ResilientFI is designed to help financial institutions navigate these complex requirements.
            </p>
            
            <p>
              Our platform aligns with all major regulatory frameworks applicable to Canadian financial institutions, with particular focus on OSFI guidelines that define expectations for operational resilience, third-party risk management, and technology risk.
            </p>
          </div>
          
          <div className="space-y-8">
            {complianceFrameworks.map((framework) => (
              <Card key={framework.id} className="overflow-hidden">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{framework.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {framework.subtitle}
                      </CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    {framework.description}
                  </p>
                  
                  <h3 className="text-base font-medium mb-2">Key Requirements</h3>
                  <ul className="space-y-1 mb-4">
                    {framework.key_requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button variant="outline" asChild>
                    <Link to="/features" className="flex items-center">
                      See how we address {framework.title} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Need Help with Compliance?</h2>
            <p className="mb-4">
              Our team of regulatory experts can help you understand how these requirements apply to your specific situation and guide you through implementing a compliant operational resilience framework.
            </p>
            <Button asChild>
              <Link to="/contact">Contact Our Compliance Experts</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Compliance;
