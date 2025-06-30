
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, TrendingUp, AlertTriangle, BarChart3, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Risk Identification",
    description: "Systematically identify and catalog operational risks across your organization.",
    icon: AlertTriangle
  },
  {
    title: "Control Management",
    description: "Design, implement, and monitor the effectiveness of risk controls.",
    icon: Shield
  },
  {
    title: "KRI Monitoring",
    description: "Track Key Risk Indicators and receive alerts when thresholds are breached.",
    icon: BarChart3
  },
  {
    title: "Risk Assessment",
    description: "Assess risk likelihood and impact with standardized methodologies.",
    icon: TrendingUp
  }
];

const RiskManagementModule: React.FC = () => {
  return (
    <PageLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Risk Management & Controls Module
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Identify, assess, and manage operational risks with comprehensive controls 
            and Key Risk Indicator (KRI) monitoring capabilities.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Risk Controls</Badge>
            <Badge variant="secondary">KRI Monitoring</Badge>
            <Badge variant="secondary">Risk Assessment</Badge>
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
          <h2 className="text-2xl font-bold text-center mb-6">Risk Management Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Controls Framework</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Design effective controls</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Test control effectiveness</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Monitor control performance</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">KRI Management</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Define key indicators</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Set threshold alerts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Automated monitoring</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Risk Analytics</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Risk heat maps</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Trend analysis</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Executive reporting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Strengthen Your Risk Management</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Implement a comprehensive risk management framework with effective controls 
            and real-time monitoring capabilities.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link to="/auth/register">
                Start Managing Risks
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

export default RiskManagementModule;
