
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ControlsDashboard from "@/components/controls/ControlsDashboard";
import ControlsList from "@/components/controls/ControlsList";
import ControlForm from "@/components/controls/ControlForm";
import KRIsList from "@/components/controls/KRIsList";
import KRIForm from "@/components/controls/KRIForm";
import KRILogsList from "@/components/controls/KRILogsList";
import KRILogForm from "@/components/controls/KRILogForm";
import {
  Control,
  KRIDefinition,
  KRILog,
  getControls,
  createControl,
  updateControl,
  deleteControl,
  getKRIDefinitions,
  createKRIDefinition,
  getKRILogs,
  createKRILog
} from "@/services/controls-service";

const ControlsAndKri = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [controls, setControls] = useState<Control[]>([]);
  const [kris, setKris] = useState<KRIDefinition[]>([]);
  const [kriLogs, setKriLogs] = useState<KRILog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [showControlForm, setShowControlForm] = useState(false);
  const [showKRIForm, setShowKRIForm] = useState(false);
  const [showKRILogForm, setShowKRILogForm] = useState(false);
  const [showKRILogs, setShowKRILogs] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | undefined>();
  const [editingKRI, setEditingKRI] = useState<KRIDefinition | undefined>();
  const [selectedKRI, setSelectedKRI] = useState<{ id: string; name: string } | undefined>();

  // Load data
  const loadControls = async () => {
    try {
      setIsLoading(true);
      const data = await getControls();
      setControls(data);
    } catch (error) {
      console.error('Error loading controls:', error);
      toast({
        title: "Error",
        description: "Failed to load controls",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadKRIs = async () => {
    try {
      setIsLoading(true);
      const data = await getKRIDefinitions();
      setKris(data);
    } catch (error) {
      console.error('Error loading KRIs:', error);
      toast({
        title: "Error",
        description: "Failed to load KRIs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadKRILogs = async (kriId: string) => {
    try {
      setIsLoading(true);
      const data = await getKRILogs(kriId);
      setKriLogs(data);
    } catch (error) {
      console.error('Error loading KRI logs:', error);
      toast({
        title: "Error",
        description: "Failed to load KRI logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadControls();
    loadKRIs();
  }, []);

  // Control handlers
  const handleCreateControl = () => {
    setEditingControl(undefined);
    setShowControlForm(true);
  };

  const handleEditControl = (control: Control) => {
    setEditingControl(control);
    setShowControlForm(true);
  };

  const handleSubmitControl = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingControl) {
        await updateControl(editingControl.id, data);
        toast({
          title: "Success",
          description: "Control updated successfully",
        });
      } else {
        await createControl(data);
        toast({
          title: "Success",
          description: "Control created successfully",
        });
      }
      setShowControlForm(false);
      setEditingControl(undefined);
      loadControls();
    } catch (error) {
      console.error('Error saving control:', error);
      toast({
        title: "Error",
        description: "Failed to save control",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteControl = async (id: string) => {
    if (!confirm('Are you sure you want to delete this control?')) return;
    
    try {
      await deleteControl(id);
      toast({
        title: "Success",
        description: "Control deleted successfully",
      });
      loadControls();
    } catch (error) {
      console.error('Error deleting control:', error);
      toast({
        title: "Error",
        description: "Failed to delete control",
        variant: "destructive",
      });
    }
  };

  // KRI handlers
  const handleCreateKRI = () => {
    setEditingKRI(undefined);
    setShowKRIForm(true);
  };

  const handleEditKRI = (kri: KRIDefinition) => {
    setEditingKRI(kri);
    setShowKRIForm(true);
  };

  const handleSubmitKRI = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (editingKRI) {
        // Update functionality would go here
        toast({
          title: "Info",
          description: "KRI update functionality coming soon",
        });
      } else {
        await createKRIDefinition(data);
        toast({
          title: "Success",
          description: "KRI created successfully",
        });
      }
      setShowKRIForm(false);
      setEditingKRI(undefined);
      loadKRIs();
    } catch (error) {
      console.error('Error saving KRI:', error);
      toast({
        title: "Error",
        description: "Failed to save KRI",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKRI = async (id: string) => {
    if (!confirm('Are you sure you want to delete this KRI?')) return;
    
    toast({
      title: "Info",
      description: "KRI deletion functionality coming soon",
    });
  };

  const handleViewKRILogs = async (kriId: string) => {
    const kri = kris.find(k => k.id === kriId);
    if (kri) {
      setSelectedKRI({ id: kriId, name: kri.name });
      setShowKRILogs(true);
      await loadKRILogs(kriId);
    }
  };

  const handleCreateKRILog = () => {
    setShowKRILogForm(true);
  };

  const handleSubmitKRILog = async (data: any) => {
    try {
      setIsSubmitting(true);
      await createKRILog(data);
      toast({
        title: "Success",
        description: "KRI measurement logged successfully",
      });
      setShowKRILogForm(false);
      if (selectedKRI) {
        await loadKRILogs(selectedKRI.id);
      }
    } catch (error) {
      console.error('Error logging KRI measurement:', error);
      toast({
        title: "Error",
        description: "Failed to log KRI measurement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  // Show forms
  if (showControlForm) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <ControlForm
            control={editingControl}
            onSubmit={handleSubmitControl}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (showKRIForm) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <KRIForm
            kri={editingKRI}
            onSubmit={handleSubmitKRI}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (showKRILogForm && selectedKRI) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <KRILogForm
            kriId={selectedKRI.id}
            kriName={selectedKRI.name}
            onSubmit={handleSubmitKRILog}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (showKRILogs && selectedKRI) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <KRILogsList
            logs={kriLogs}
            kriName={selectedKRI.name}
            onCreateLog={handleCreateKRILog}
            isLoading={isLoading}
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="kris">KRIs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ControlsDashboard />
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <ControlsList
              controls={controls}
              onEdit={handleEditControl}
              onDelete={handleDeleteControl}
              onCreate={handleCreateControl}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="kris" className="space-y-6">
            <KRIsList
              kris={kris}
              onEdit={handleEditKRI}
              onDelete={handleDeleteKRI}
              onCreate={handleCreateKRI}
              onViewLogs={handleViewKRILogs}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Advanced analytics features coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default ControlsAndKri;
