
import { useState } from "react";
import { UpdateIncidentData } from "@/services/incident";

interface UseIncidentDetailTabsProps {
  onUpdate: (data: UpdateIncidentData) => void;
  onAddResponse: (data: { content: string; type: string }) => void;
  isAddingResponse: boolean;
}

export const useIncidentDetailTabs = ({
  onUpdate,
  onAddResponse,
  isAddingResponse,
}: UseIncidentDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleSaveRCA = (content: string) => {
    onAddResponse({ content, type: 'rca' });
  };

  return {
    activeTab,
    setActiveTab,
    handleSaveRCA,
  };
};
