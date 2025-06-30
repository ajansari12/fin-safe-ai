
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Play } from "lucide-react";
import { WorkflowInstance } from "@/services/workflow-service";

interface WorkflowStatsProps {
  workflows: WorkflowInstance[];
}

const WorkflowStats: React.FC<WorkflowStatsProps> = ({ workflows }) => {
  const stats = React.useMemo(() => {
    const total = workflows.length;
    const draft = workflows.filter(w => w.status === 'draft').length;
    const inProgress = workflows.filter(w => w.status === 'in_progress').length;
    const completed = workflows.filter(w => w.status === 'completed').length;
    const overdue = workflows.filter(w => {
      if (!w.due_date || w.status === 'completed') return false;
      return new Date(w.due_date) < new Date();
    }).length;

    return { total, draft, inProgress, completed, overdue };
  }, [workflows]);

  const statCards = [
    {
      title: "Total Workflows",
      value: stats.total,
      icon: Play,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.title === "Overdue" && stat.value > 0 && (
              <Badge variant="destructive" className="mt-1">
                Requires attention
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkflowStats;
