import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIAssistant } from "@/components/ai-assistant";
import { createImpactTolerance, publishImpactTolerance, updateImpactTolerance } from "@/services/business-functions-service";
import BusinessFunctionSelect from "@/components/impact-tolerance/BusinessFunctionSelect";
import ImpactToleranceForm from "@/components/impact-tolerance/ImpactToleranceForm";
import ImpactTolerancesList from "@/components/impact-tolerance/ImpactTolerancesList";

const ImpactTolerances = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState("define");
  const [selectedFunctionId, setSelectedFunctionId] = useState<string | undefined>();
  const [selectedTolerance, setSelectedTolerance] = useState<any | null>(null);
  
  // Add debugging to check if AI Assistant context is available
  console.log("ImpactTolerances component rendering...");
  
  // Try to get AI assistant context with error handling
  let setCurrentModule: (module: string | null) => void = () => {};
  try {
    const aiAssistant = useAIAssistant();
    setCurrentModule = aiAssistant.setCurrentModule;
    console.log("AI Assistant context available:", !!aiAssistant);
  } catch (error) {
    console.error("AI Assistant context not available:", error);
  }
  
  React.useEffect(() => {
    console.log("Setting current module to impact-tolerances");
    setCurrentModule("impact-tolerances");
  }, [setCurrentModule]);
  
  const handleSaveTolerance = async (values: any) => {
    if (selectedTolerance) {
      // Update existing tolerance
      await updateImpactTolerance(selectedTolerance.id, values);
    } else {
      // Create new tolerance
      await createImpactTolerance(values);
    }
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['impactTolerances'] });
    
    // Reset form and selection state if creating new
    if (!selectedTolerance) {
      setSelectedFunctionId(undefined);
    }
  };
  
  const handlePublishTolerance = async (values: any) => {
    if (selectedTolerance) {
      // Update and publish existing tolerance
      await updateImpactTolerance(selectedTolerance.id, {
        ...values,
        status: 'published'
      });
    } else {
      // Create new tolerance as published
      await createImpactTolerance({
        ...values,
        status: 'published'
      });
    }
    
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['impactTolerances'] });
    
    // Reset form and selection state
    setSelectedFunctionId(undefined);
    setSelectedTolerance(null);
    setSelectedTab("view");
  };
  
  const handleSelectTolerance = (tolerance: any) => {
    setSelectedTolerance(tolerance);
    setSelectedFunctionId(tolerance.function_id);
    setSelectedTab("define");
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impact Tolerances</h1>
          <p className="text-muted-foreground">
            Define the maximum tolerable level of disruption to critical business services.
          </p>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} defaultValue="define">
          <TabsList>
            <TabsTrigger value="define">Define Impact Tolerances</TabsTrigger>
            <TabsTrigger value="view">View Defined Tolerances</TabsTrigger>
          </TabsList>
          
          <TabsContent value="define" className="space-y-6 mt-6">
            {/* Business Function Selection */}
            <BusinessFunctionSelect 
              onSelect={id => {
                setSelectedFunctionId(id);
                setSelectedTolerance(null);
              }}
              selectedId={selectedFunctionId}
            />
            
            {/* Impact Tolerance Form - conditionally shown when function is selected */}
            {selectedFunctionId && (
              <ImpactToleranceForm
                functionId={selectedFunctionId}
                onSave={handleSaveTolerance}
                onPublish={handlePublishTolerance}
                initialValues={selectedTolerance}
                isEdit={!!selectedTolerance}
              />
            )}
          </TabsContent>
          
          <TabsContent value="view" className="space-y-6 mt-6">
            {/* List of Impact Tolerances */}
            <ImpactTolerancesList onSelectTolerance={handleSelectTolerance} />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default ImpactTolerances;
