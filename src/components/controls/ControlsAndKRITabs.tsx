
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Link } from "lucide-react";
import { Control } from "@/services/controls";
import { KRIDefinition } from "@/services/kri-definitions";
import { ControlTest } from "@/services/control-tests";
import ControlsDashboard from "./ControlsDashboard";
import ControlsList from "./ControlsList";
import KRIsList from "./KRIsList";

interface ControlsAndKRITabsProps {
  activeTab: string;
  controls: Control[];
  kris: KRIDefinition[];
  controlTests: ControlTest[];
  isLoading: boolean;
  onTabChange: (tab: string) => void;
  onEditControl: (control: Control) => void;
  onDeleteControl: (id: string) => void;
  onCreateControl: () => void;
  onTestControl: (control: Control) => void;
  onViewControlTests: (control: Control) => void;
  onEditKRI: (kri: KRIDefinition) => void;
  onDeleteKRI: (id: string) => void;
  onCreateKRI: () => void;
  onViewKRILogs: (kriId: string) => void;
  onLinkKRIToAppetite?: (kri: KRIDefinition) => void;
  onShowControlEffectiveness?: () => void;
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
  onViewKRILogs,
  onLinkKRIToAppetite,
  onShowControlEffectiveness,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="kris">KRIs</TabsTrigger>
        </TabsList>

        <div className="flex gap-2">
          {onShowControlEffectiveness && (
            <Button
              variant="outline"
              onClick={onShowControlEffectiveness}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Control Effectiveness
            </Button>
          )}
          
          {activeTab === "controls" && (
            <Button onClick={onCreateControl} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Control
            </Button>
          )}
          
          {activeTab === "kris" && (
            <Button onClick={onCreateKRI} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New KRI
            </Button>
          )}
        </div>
      </div>

      <TabsContent value="dashboard">
        <ControlsDashboard />
      </TabsContent>

      <TabsContent value="controls">
        <ControlsList
          controls={controls}
          isLoading={isLoading}
          onEdit={onEditControl}
          onDelete={onDeleteControl}
          onTest={onTestControl}
          onViewTests={onViewControlTests}
        />
      </TabsContent>

      <TabsContent value="kris">
        <KRIsList
          kris={kris}
          isLoading={isLoading}
          onEdit={onEditKRI}
          onDelete={onDeleteKRI}
          onViewLogs={onViewKRILogs}
          onLinkToAppetite={onLinkKRIToAppetite}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ControlsAndKRITabs;
