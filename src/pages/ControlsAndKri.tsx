import React, { useState } from "react";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Control } from "@/services/controls";
import { KRIDefinition } from "@/services/kri-definitions";
import { ControlTest, getControlTests } from "@/services/control-tests";
import { useControlsAndKRIData } from "@/hooks/useControlsAndKRIData";
import { useControlsOperations } from "@/hooks/useControlsOperations";
import { useKRIOperations } from "@/hooks/useKRIOperations";
import { useKRILogsOperations } from "@/hooks/useKRILogsOperations";
import { useControlTestOperations } from "@/hooks/useControlTestOperations";
import ControlsAndKRINavigation from "@/components/controls/ControlsAndKRINavigation";
import ControlsAndKRITabs from "@/components/controls/ControlsAndKRITabs";
import ControlTestForm from "@/components/controls/ControlTestForm";
import ControlTestsList from "@/components/controls/ControlTestsList";
import ControlEffectivenessDashboard from "@/components/controls/ControlEffectivenessDashboard";
import KRIAppetiteLinkForm from "@/components/controls/KRIAppetiteLinkForm";
import KRIBreachNotifications from "@/components/controls/KRIBreachNotifications";

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

  const {
    handleCreateControlTest,
    isSubmitting: isControlTestSubmitting
  } = useControlTestOperations();

  // UI state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showControlForm, setShowControlForm] = useState(false);
  const [showKRIForm, setShowKRIForm] = useState(false);
  const [showKRILogForm, setShowKRILogForm] = useState(false);
  const [showKRILogs, setShowKRILogs] = useState(false);
  const [showControlTestForm, setShowControlTestForm] = useState(false);
  const [showControlTests, setShowControlTests] = useState(false);
  const [showKRIAppetiteLinkForm, setShowKRIAppetiteLinkForm] = useState(false);
  const [showControlEffectivenessDashboard, setShowControlEffectivenessDashboard] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | undefined>();
  const [editingKRI, setEditingKRI] = useState<KRIDefinition | undefined>();
  const [selectedKRI, setSelectedKRI] = useState<{ id: string; name: string } | undefined>();
  const [selectedControl, setSelectedControl] = useState<{ id: string; title: string } | undefined>();
  const [controlTests, setControlTests] = useState<ControlTest[]>([]);

  const isSubmitting = isControlSubmitting || isKRISubmitting || isKRILogSubmitting || isControlTestSubmitting;

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

  // Control testing handlers
  const handleTestControl = (control: Control) => {
    setSelectedControl({ id: control.id, title: control.title });
    setShowControlTestForm(true);
  };

  const handleViewControlTests = async (control: Control) => {
    try {
      const tests = await getControlTests(control.id);
      setControlTests(tests);
      setSelectedControl({ id: control.id, title: control.title });
      setShowControlTests(true);
    } catch (error) {
      console.error('Error loading control tests:', error);
    }
  };

  const handleSubmitControlTest = async (data: any) => {
    try {
      await handleCreateControlTest(data);
      setShowControlTestForm(false);
      loadControls(); // Reload to update control effectiveness scores
      
      // If we're viewing tests for this control, reload the tests
      if (selectedControl && selectedControl.id === data.control_id) {
        const tests = await getControlTests(data.control_id);
        setControlTests(tests);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCreateControlTestClick = () => {
    setShowControlTestForm(true);
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

  // KRI appetite link handlers
  const handleLinkKRIToAppetite = (kri: KRIDefinition) => {
    setSelectedKRI({ id: kri.id, name: kri.name });
    setShowKRIAppetiteLinkForm(true);
  };

  const handleKRIAppetiteLinkSubmit = () => {
    setShowKRIAppetiteLinkForm(false);
    setSelectedKRI(undefined);
    loadKRIs();
  };

  // Dashboard handlers
  const handleShowControlEffectiveness = () => {
    setShowControlEffectivenessDashboard(true);
  };

  const handleCancelForm = () => {
    setShowControlForm(false);
    setShowKRIForm(false);
    setShowKRILogForm(false);
    setShowKRILogs(false);
    setShowControlTestForm(false);
    setShowControlTests(false);
    setShowKRIAppetiteLinkForm(false);
    setShowControlEffectivenessDashboard(false);
    setEditingControl(undefined);
    setEditingKRI(undefined);
    setSelectedKRI(undefined);
    setSelectedControl(undefined);
    setControlTests([]);
  };

  // Show navigation components if any form is active
  const showNavigation = showControlForm || showKRIForm || showKRILogForm || showKRILogs;

  // Show control effectiveness dashboard
  if (showControlEffectivenessDashboard) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleCancelForm}
            >
              ← Back to Controls & KRIs
            </Button>
            <h2 className="text-2xl font-bold">Control Effectiveness Dashboard</h2>
          </div>
          <ControlEffectivenessDashboard />
        </div>
      </AuthenticatedLayout>
    );
  }

  // Show KRI appetite link form
  if (showKRIAppetiteLinkForm && selectedKRI) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <KRIAppetiteLinkForm
            kriId={selectedKRI.id}
            kriName={selectedKRI.name}
            onSubmit={handleKRIAppetiteLinkSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  // Show control test form
  if (showControlTestForm && selectedControl) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <ControlTestForm
            controlId={selectedControl.id}
            controlName={selectedControl.title}
            onSubmit={handleSubmitControlTest}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  // Show control tests list
  if (showControlTests && selectedControl) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <ControlTestsList
            tests={controlTests}
            controlName={selectedControl.title}
            onCreateTest={handleCreateControlTestClick}
            onBack={handleCancelForm}
            isLoading={isLoading}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

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
            Manage risk controls, key risk indicators, and testing workflows.
          </p>
        </div>
        
        {/* Add breach notifications section */}
        <KRIBreachNotifications />
        
        <ControlsAndKRITabs
          activeTab={activeTab}
          controls={controls}
          kris={kris}
          controlTests={controlTests}
          isLoading={isLoading}
          onTabChange={setActiveTab}
          onEditControl={handleEditControl}
          onDeleteControl={handleDeleteControlClick}
          onCreateControl={handleCreateControlClick}
          onTestControl={handleTestControl}
          onViewControlTests={handleViewControlTests}
          onEditKRI={handleEditKRI}
          onDeleteKRI={handleDeleteKRIClick}
          onCreateKRI={handleCreateKRIClick}
          onViewKRILogs={handleViewKRILogs}
          onLinkKRIToAppetite={handleLinkKRIToAppetite}
          onShowControlEffectiveness={handleShowControlEffectiveness}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default ControlsAndKri;
