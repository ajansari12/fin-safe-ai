
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const maturityItems = [
  { name: "Governance Framework", value: 80 },
  { name: "Risk Assessment", value: 65 },
  { name: "Third-Party Management", value: 45 },
  { name: "Incident Response", value: 70 },
  { name: "Testing & Exercises", value: 30 },
];

export default function ProgramMaturityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Maturity</CardTitle>
        <CardDescription>Operational resilience program development progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {maturityItems.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
