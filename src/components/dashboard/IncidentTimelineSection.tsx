
import React from "react";
import TimelineChart from "@/components/dashboard/TimelineChart";

// Sample data for charts
const incidentsOverTime = [
  { date: "Jan", cyber: 4, vendor: 2, process: 1, people: 3 },
  { date: "Feb", cyber: 3, vendor: 3, process: 2, people: 2 },
  { date: "Mar", cyber: 5, vendor: 4, process: 3, people: 2 },
  { date: "Apr", cyber: 7, vendor: 3, process: 4, people: 3 },
  { date: "May", cyber: 4, vendor: 5, process: 3, people: 2 },
  { date: "Jun", cyber: 6, vendor: 2, process: 2, people: 1 },
];

const timelineDataKeys = [
  { key: "cyber", name: "Cyber", color: "#6366f1" },
  { key: "vendor", name: "Vendor", color: "#8b5cf6" },
  { key: "process", name: "Process", color: "#ec4899" },
  { key: "people", name: "People", color: "#14b8a6" },
];

export default function IncidentTimelineSection() {
  return (
    <TimelineChart 
      data={incidentsOverTime} 
      title="Incidents Over Time" 
      description="6-month trend of operational incidents by category"
      dataKeys={timelineDataKeys}
    />
  );
}
