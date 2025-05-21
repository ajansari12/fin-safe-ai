
import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Clock, FileCheck2, ShieldAlert } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";

export default function StatCardsSection() {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard
        title="Total Risk Items"
        value={124}
        description="Across all operational domains"
        icon={ShieldAlert}
        trend={{ value: 4, isPositive: false }}
      />
      <StatCard
        title="Compliance Score"
        value="76%"
        description="Based on E-21 requirements"
        icon={FileCheck2}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        title="Active Incidents"
        value={3}
        description="Requiring immediate attention"
        icon={AlertTriangle}
      />
      <StatCard
        title="Assessments Due"
        value={8}
        description="In the next 30 days"
        icon={Clock}
        footer={
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/assessments">
              View Schedule <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />
    </div>
  );
}
