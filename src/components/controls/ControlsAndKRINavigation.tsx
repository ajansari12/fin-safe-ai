
import React from "react";
import { Control } from "@/services/controls";
import { KRIDefinition } from "@/services/kri-definitions";
import ControlForm from "./ControlForm";
import KRIForm from "./KRIForm";
import KRILogForm from "./KRILogForm";
import KRILogsList from "./KRILogsList";
import { KRILog } from "@/services/kri-logs";

interface ControlsAndKRINavigationProps {
  showControlForm: boolean;
  showKRIForm: boolean;
  showKRILogForm: boolean;
  showKRILogs: boolean;
  editingControl?: Control;
  editingKRI?: KRIDefinition;
  selectedKRI?: { id: string; name: string };
  kriLogs: KRILog[];
  isSubmitting: boolean;
  isLoading: boolean;
  onSubmitControl: (data: any) => void;
  onSubmitKRI: (data: any) => void;
  onSubmitKRILog: (data: any) => void;
  onCreateKRILog: () => void;
  onCancel: () => void;
}

const ControlsAndKRINavigation: React.FC<ControlsAndKRINavigationProps> = ({
  showControlForm,
  showKRIForm,
  showKRILogForm,
  showKRILogs,
  editingControl,
  editingKRI,
  selectedKRI,
  kriLogs,
  isSubmitting,
  isLoading,
  onSubmitControl,
  onSubmitKRI,
  onSubmitKRILog,
  onCreateKRILog,
  onCancel
}) => {
  if (showControlForm) {
    return (
      <ControlForm
        control={editingControl}
        onSubmit={onSubmitControl}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (showKRIForm) {
    return (
      <KRIForm
        kri={editingKRI}
        onSubmit={onSubmitKRI}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (showKRILogForm && selectedKRI) {
    return (
      <KRILogForm
        kriId={selectedKRI.id}
        kriName={selectedKRI.name}
        onSubmit={onSubmitKRILog}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (showKRILogs && selectedKRI) {
    return (
      <KRILogsList
        logs={kriLogs}
        kriName={selectedKRI.name}
        onCreateLog={onCreateKRILog}
        isLoading={isLoading}
      />
    );
  }

  return null;
};

export default ControlsAndKRINavigation;
