
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Essentials",
    price: "$1,299",
    description: "Perfect for small financial institutions getting started with operational resilience.",
    features: [
      "Self-assessment frameworks",
      "Critical operations mapping",
      "Basic risk reporting",
      "OSFI E-21 documentation",
      "Email support",
    ],
    popular: false,
    cta: "Get Started",
    ctaLink: "/auth/register",
  },
  {
    name: "Professional",
    price: "$2,499",
    description: "Ideal for medium-sized institutions with complex operational requirements.",
    features: [
      "Everything in Essentials",
      "Advanced scenario testing",
      "Third-party risk management",
      "Customizable dashboards",
      "AI-powered risk assessment",
      "Priority support",
    ],
    popular: true,
    cta: "Start Free Trial",
    ctaLink: "/auth/register?plan=pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solution for large institutions with complex regulatory requirements.",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "Dedicated success manager",
      "On-site implementation",
      "Advanced analytics",
      "24/7 priority support",
      "Unlimited users",
    ],
    popular: false,
    cta: "Contact Sales",
    ctaLink: "/contact?enterprise=true",
  }
];

const Pricing = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for your institution. All plans include core OSFI E-21 compliance features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border rounded-2xl overflow-hidden h-full card-hover-effect ${
                plan.popular 
                  ? "border-primary shadow-lg shadow-primary/10" 
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground ml-2">/month</span>}
                </div>
                <CardDescription className="mt-4">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                  <Link to={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center text-muted-foreground">
          <p>All plans include a 14-day free trial. No credit card required to start.</p>
          <p className="mt-2">Need a custom solution? <Link to="/contact" className="text-primary underline">Contact our sales team</Link>.</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
