
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Users, FileText, Shield, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Accountability Structures",
    description: "Define clear roles, responsibilities, and reporting lines for operational resilience governance.",
    icon: Users
  },
  {
    title: "Policy Management",
    description: "Create, manage, and track compliance with governance policies and procedures.",
    icon: FileText
  },
  {
    title: "Risk Oversight",
    description: "Establish oversight processes for operational risk management and resilience.",
    icon: Shield
  },
  {
    title: "Compliance Tracking",
    description: "Monitor compliance with E-21 guidelines and other regulatory requirements.",
    icon: CheckCircle
  }
];

const benefits = [
  "E-21 Compliance Alignment",
  "Clear Accountability Framework",
  "Automated Policy Management",
  "Risk Oversight Processes",
  "Regulatory Reporting",
  "Board-Level Visibility"
];

const GovernanceModule: React.FC = () => {
  return (
    <PageLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Governance Framework Module
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Establish robust governance structures with clear accountability and oversight processes 
            aligned with OSFI E-21 guidelines for operational resilience.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">OSFI E-21 Compliant</Badge>
            <Badge variant="secondary">Board Reporting</Badge>
            <Badge variant="secondary">Policy Management</Badge>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Regulatory Compliance</CardTitle>
            <CardDescription>
              Our Governance Framework module is specifically designed to meet regulatory requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">OSFI E-21 Guidelines</h4>
                <p className="text-sm text-muted-foreground">
                  Fully aligned with OSFI's operational resilience guidelines including governance structures and accountability.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Board Oversight</h4>
                <p className="text-sm text-muted-foreground">
                  Comprehensive board reporting and oversight capabilities for operational resilience governance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Strengthen Your Governance?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start building a robust governance framework that meets regulatory requirements 
            and provides clear accountability for operational resilience.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link to="/auth/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/modules">View All Modules</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default GovernanceModule;
