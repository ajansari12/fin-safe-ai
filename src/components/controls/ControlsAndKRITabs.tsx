
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Control } from "@/services/controls";
import { KRIDefinition } from "@/services/kri-definitions";
import EnhancedControlsDashboard from "./EnhancedControlsDashboard";
import ControlsList from "./ControlsList";
import KRIsList from "./KRIsList";
import { ControlTest } from "@/services/control-tests";

interface ControlsAndKRITabsProps {
  activeTab: string;
  controls: Control[];
  kris: KRIDefinition[];
  controlTests: ControlTest[];
  isLoading: boolean;
  onTabChange: (value: string) => void;
  onEditControl: (control: Control) => void;
  onDeleteControl: (id: string) => void;
  onCreateControl: () => void;
  onTestControl: (control: Control) => void;
  onViewControlTests: (control: Control) => void;
  onEditKRI: (kri: KRIDefinition) => void;
  onDeleteKRI: (id: string) => void;
  onCreateKRI: () => void;
  onViewKRILogs: (kriId: string) => void;
}

const ControlsAndKRITabs: React.FC<ControlsAndKRITabsProps> = ({
  activeTab,
  controls,
  kris,
  controlTests,
  isLoading,
  onTabChange,
  onEditControl,
  onDeleteControl,
  onCreateControl,
  onTestControl,
  onViewControlTests,
  onEditKRI,
  onDeleteKRI,
  onCreateKRI,
  onViewKRILogs
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="controls">Controls</TabsTrigger>
        <TabsTrigger value="kris">KRIs</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <EnhancedControlsDashboard
          controls={controls}
          controlTests={controlTests}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="controls" className="space-y-6">
        <ControlsList
          controls={controls}
          onEdit={onEditControl}
          onDelete={onDeleteControl}
          onCreate={onCreateControl}
          onTest={onTestControl}
          onViewTests={onViewControlTests}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="kris" className="space-y-6">
        <KRIsList
          kris={kris}
          onEdit={onEditKRI}
          onDelete={onDeleteKRI}
          onCreate={onCreateKRI}
          onViewLogs={onViewKRILogs}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Advanced analytics features coming soon...</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ControlsAndKRITabs;
