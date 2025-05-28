
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Clock, Play, FileText } from "lucide-react";
import { WorkflowInstance } from "@/services/workflow-service";

interface WorkflowStatsProps {
  workflows: WorkflowInstance[];
}

const WorkflowStats: React.FC<WorkflowStatsProps> = ({ workflows }) => {
  const stats = [
    {
      title: "Total Workflows",
      value: workflows.length,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "In Progress",
      value: workflows.filter(w => w.status === 'in_progress').length,
      icon: Play,
      color: "text-orange-600"
    },
    {
      title: "Completed",
      value: workflows.filter(w => w.status === 'completed').length,
      icon: CheckSquare,
      color: "text-green-600"
    },
    {
      title: "Draft",
      value: workflows.filter(w => w.status === 'draft').length,
      icon: Clock,
      color: "text-gray-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WorkflowStats;
