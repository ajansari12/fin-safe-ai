
import React from "react";
import { Incident } from "@/services/incident";
import IncidentSLAMetrics from "./IncidentSLAMetrics";

interface IncidentSLAMetricsWrapperProps {
  incident: Incident;
}

const IncidentSLAMetricsWrapper: React.FC<IncidentSLAMetricsWrapperProps> = ({
  incident,
}) => {
  return <IncidentSLAMetrics incident={incident} />;
};

export default IncidentSLAMetricsWrapper;
