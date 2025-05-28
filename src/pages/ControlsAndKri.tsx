
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Control } from "@/services/controls";
import { KRIDefinition } from "@/services/kri-definitions";
import { useControlsAndKRIData } from "@/hooks/useControlsAndKRIData";
import { useControlsOperations } from "@/hooks/useControlsOperations";
import { useKRIOperations } from "@/hooks/useKRIOperations";
import { useKRILogsOperations } from "@/hooks/useKRILogsOperations";
import ControlsAndKRINavigation from "@/components/controls/ControlsAndKRINavigation";
import ControlsAndKRITabs from "@/components/controls/ControlsAndKRITabs";

const ControlsAndKri = () => {
  const { user } = useAuth();
  
  // Data hooks
  const {
    controls,
    kris,
    kriLogs,
    isLoading,
    loadControls,
    loadKRIs,
    loadKRILogs
  } = useControlsAndKRIData();

  // Operation hooks
  const {
    handleCreateControl,
    handleUpdateControl,
    handleDeleteControl,
    isSubmitting: isControlSubmitting
  } = useControlsOperations();

  const {
    handleCreateKRI,
    handleUpdateKRI,
    handleDeleteKRI,
    isSubmitting: isKRISubmitting
  } = useKRIOperations();

  const {
    handleCreateKRILog,
    isSubmitting: isKRILogSubmitting
  } = useKRILogsOperations();

  // UI state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showControlForm, setShowControlForm] = useState(false);
  const [showKRIForm, setShowKRIForm] = useState(false);
  const [showKRILogForm, setShowKRILogForm] = useState(false);
  const [showKRILogs, setShowKRILogs] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | undefined>();
  const [editingKRI, setEditingKRI] = useState<KRIDefinition | undefined>();
  const [selectedKRI, setSelectedKRI] = useState<{ id: string; name: string } | undefined>();

  const isSubmitting = isControlSubmitting || isKRISubmitting || isKRILogSubmitting;

  // Control handlers
  const handleCreateControlClick = () => {
    setEditingControl(undefined);
    setShowControlForm(true);
  };

  const handleEditControl = (control: Control) => {
    setEditingControl(control);
    setShowControlForm(true);
  };

  const handleSubmitControl = async (data: any) => {
    try {
      if (editingControl) {
        await handleUpdateControl(editingControl.id, data);
      } else {
        await handleCreateControl(data);
      }
      setShowControlForm(false);
      setEditingControl(undefined);
      loadControls();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteControlClick = async (id: string) => {
    try {
      await handleDeleteControl(id);
      loadControls();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // KRI handlers
  const handleCreateKRIClick = () => {
    setEditingKRI(undefined);
    setShowKRIForm(true);
  };

  const handleEditKRI = (kri: KRIDefinition) => {
    setEditingKRI(kri);
    setShowKRIForm(true);
  };

  const handleSubmitKRI = async (data: any) => {
    try {
      if (editingKRI) {
        await handleUpdateKRI(editingKRI, data);
      } else {
        await handleCreateKRI(data);
      }
      setShowKRIForm(false);
      setEditingKRI(undefined);
      loadKRIs();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteKRIClick = async (id: string) => {
    try {
      await handleDeleteKRI(id);
      loadKRIs();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleViewKRILogs = async (kriId: string) => {
    const kri = kris.find(k => k.id === kriId);
    if (kri) {
      setSelectedKRI({ id: kriId, name: kri.name });
      setShowKRILogs(true);
      await loadKRILogs(kriId);
    }
  };

  const handleCreateKRILogClick = () => {
    setShowKRILogForm(true);
  };

  const handleSubmitKRILog = async (data: any) => {
    try {
      await handleCreateKRILog(data);
      setShowKRILogForm(false);
      if (selectedKRI) {
        await loadKRILogs(selectedKRI.id);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancelForm = () => {
    setShowControlForm(false);
    setShowKRIForm(false);
    setShowKRILogForm(false);
    setShowKRILogs(false);
    setEditingControl(undefined);
    setEditingKRI(undefined);
    setSelectedKRI(undefined);
  };

  // Show navigation components if any form is active
  const showNavigation = showControlForm || showKRIForm || showKRILogForm || showKRILogs;

  if (showNavigation) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <ControlsAndKRINavigation
            showControlForm={showControlForm}
            showKRIForm={showKRIForm}
            showKRILogForm={showKRILogForm}
            showKRILogs={showKRILogs}
            editingControl={editingControl}
            editingKRI={editingKRI}
            selectedKRI={selectedKRI}
            kriLogs={kriLogs}
            isSubmitting={isSubmitting}
            isLoading={isLoading}
            onSubmitControl={handleSubmitControl}
            onSubmitKRI={handleSubmitKRI}
            onSubmitKRILog={handleSubmitKRILog}
            onCreateKRILog={handleCreateKRILogClick}
            onCancel={handleCancelForm}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controls & KRIs</h1>
          <p className="text-muted-foreground">
            Manage risk controls and key risk indicators.
          </p>
        </div>
        
        <ControlsAndKRITabs
          activeTab={activeTab}
          controls={controls}
          kris={kris}
          isLoading={isLoading}
          onTabChange={setActiveTab}
          onEditControl={handleEditControl}
          onDeleteControl={handleDeleteControlClick}
          onCreateControl={handleCreateControlClick}
          onEditKRI={handleEditKRI}
          onDeleteKRI={handleDeleteKRIClick}
          onCreateKRI={handleCreateKRIClick}
          onViewKRILogs={handleViewKRILogs}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default ControlsAndKri;
