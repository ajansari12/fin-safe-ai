
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const regulatoryStandards = [
  {
    name: "OSFI E-21",
    description: "Operational Risk Management",
    features: [
      "Self-Assessment Framework",
      "Critical Operations Mapping",
      "Resilience Testing",
      "Incident Management",
    ],
  },
  {
    name: "OSFI B-10",
    description: "Third Party Risk Management",
    features: [
      "Due Diligence Assessments",
      "Vendor Risk Classification",
      "Contract Monitoring",
      "Ongoing Supervision",
    ],
  },
  {
    name: "OSFI B-13",
    description: "Technology & Cyber Risk",
    features: [
      "Technology Asset Management",
      "Cyber Security Controls",
      "IT Risk Assessment",
      "Incident Response",
    ],
  },
  {
    name: "ISO 22301",
    description: "Business Continuity",
    features: [
      "Business Impact Analysis",
      "Recovery Strategies",
      "Continuity Plans",
      "Testing & Exercises",
    ],
  },
];

const RegulatoryCompliance = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Comprehensive Regulatory Compliance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ResilientFI aligns with all major Canadian regulatory standards and international frameworks for operational risk management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {regulatoryStandards.map((standard, index) => (
            <Card key={index} className="overflow-hidden card-hover-effect">
              <div className="bg-primary h-2" />
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">{standard.name}</h3>
                <p className="text-muted-foreground mb-6">{standard.description}</p>
                <ul className="space-y-3">
                  {standard.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegulatoryCompliance;
