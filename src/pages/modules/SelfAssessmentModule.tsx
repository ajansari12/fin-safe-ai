
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Target, CheckCircle, TrendingUp, BarChart3, AlertCircle, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Risk Appetite Definition",
    description: "Define and document your organization's risk appetite across multiple dimensions and business lines.",
    icon: Target
  },
  {
    title: "Maturity Assessment",
    description: "Assess your current operational resilience maturity and identify areas for improvement.",
    icon: BarChart3
  },
  {
    title: "Gap Analysis",
    description: "Identify gaps between current state and desired risk tolerance levels.",
    icon: AlertCircle
  },
  {
    title: "Progress Tracking",
    description: "Monitor progress towards operational resilience goals with comprehensive dashboards.",
    icon: TrendingUp
  }
];

const SelfAssessmentModule: React.FC = () => {
  return (
    <PageLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Self Assessment & Risk Appetite Module
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Define your risk appetite, assess operational resilience maturity, and track progress 
            towards your organizational risk management goals.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">Risk Appetite</Badge>
            <Badge variant="secondary">Maturity Assessment</Badge>
            <Badge variant="secondary">Gap Analysis</Badge>
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
          <h2 className="text-2xl font-bold text-center mb-6">Assessment Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Risk Appetite Management</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Define risk tolerance levels</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Monitor appetite breaches</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Board-level reporting</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Maturity Tracking</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Assess current capabilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Identify improvement areas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Track progress over time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Start Your Risk Assessment Today</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Begin with a comprehensive assessment of your operational resilience posture 
            and establish clear risk appetite boundaries.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link to="/auth/register">
                Begin Assessment
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

export default SelfAssessmentModule;
