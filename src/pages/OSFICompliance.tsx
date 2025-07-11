import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import ComplianceDashboard from "@/components/governance/ComplianceDashboard";
import OSFIIntegrationDashboard from "@/components/osfi-integration/OSFIIntegrationDashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

const OSFICompliancePage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('compliance');
  
  useEffect(() => {
    setCurrentModule("osfi_compliance");
  }, [setCurrentModule]);

  // Get initial tab from URL parameters
  useEffect(() => {
    const tab = searchParams.get('view');
    if (tab === 'integration') {
      setActiveTab('integration');
    }
  }, [searchParams]);

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">OSFI E-21 Compliance</h1>
            <p className="text-muted-foreground">
              Operational Risk Management and Resilience - Canadian Federal Regulatory Compliance
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">OSFI E-21 Compliance Notice</h3>
              <p className="text-sm text-blue-700 mt-1">
                This dashboard is designed to assist with OSFI Guideline E-21 compliance for Federally Regulated Financial Institutions (FRFIs) in Canada. 
                Implementation timeline: Operational risk management (immediate), full resilience requirements by September 1, 2026.
                <br />
                <span className="font-medium">Disclaimer:</span> This tool provides guidance and is not regulatory advice. Consult OSFI directly for official interpretation.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compliance">OSFI Compliance Framework</TabsTrigger>
            <TabsTrigger value="integration">Cross-Module Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="compliance">
            <ComplianceDashboard />
          </TabsContent>

          <TabsContent value="integration">
            <OSFIIntegrationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default OSFICompliancePage;