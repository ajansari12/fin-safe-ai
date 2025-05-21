
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const actionItems = [
  {
    title: "Complete Cyber Vulnerability Assessment",
    dueDate: "2025-06-15",
    status: "pending",
    priority: "high",
  },
  {
    title: "Update Third-Party Risk Register",
    dueDate: "2025-06-10",
    status: "in-progress",
    priority: "medium",
  },
  {
    title: "Review Business Continuity Plan",
    dueDate: "2025-06-30",
    status: "pending",
    priority: "medium",
  },
  {
    title: "Conduct Staff Resilience Training",
    dueDate: "2025-06-22",
    status: "pending",
    priority: "low",
  },
];

export default function ActionItemsCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="flex-1">
          <CardTitle>Action Items</CardTitle>
          <CardDescription>Required actions to improve operational resilience</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/tasks">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actionItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-start space-x-4">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  item.priority === "high" 
                    ? "bg-red-500" 
                    : item.priority === "medium" 
                      ? "bg-amber-500" 
                      : "bg-green-500"
                }`} />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Due {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`${
                    item.status === "in-progress" 
                      ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" 
                      : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {item.status === "in-progress" ? "Continue" : "Start"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
