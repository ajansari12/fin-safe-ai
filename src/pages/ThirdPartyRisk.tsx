import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, FileDown, BarChart3, Brain } from "lucide-react";
import { createVendorProfile, updateVendorProfile, deleteVendorProfile, getVendorProfiles, VendorProfile } from "@/services/third-party-service";
import { generateThirdPartyReviewPDF } from "@/services/third-party-pdf-service";
import { checkExpiringContracts } from "@/services/contract-service";
import VendorProfileForm from "@/components/third-party/VendorProfileForm";
import VendorProfilesList from "@/components/third-party/VendorProfilesList";
import VendorDetailsDialog from "@/components/third-party/VendorDetailsDialog";
import VendorRiskDashboard from "@/components/third-party/VendorRiskDashboard";
import RiskIntelligenceHub from "@/components/intelligence/RiskIntelligenceHub";

const ThirdPartyRisk = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorProfile | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendorProfiles'],
    queryFn: getVendorProfiles,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for risk updates
  });

  const createMutation = useMutation({
    mutationFn: createVendorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['vendorRiskScores'] });
      setIsFormOpen(false);
      setEditingVendor(null);
      toast({
        title: "Success",
        description: "Vendor profile created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create vendor profile",
        variant: "destructive",
      });
      console.error('Create error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorProfile> }) => 
      updateVendorProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['vendorRiskScores'] });
      setIsFormOpen(false);
      setEditingVendor(null);
      toast({
        title: "Success",
        description: "Vendor profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update vendor profile",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVendorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['vendorRiskScores'] });
      toast({
        title: "Success",
        description: "Vendor profile deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete vendor profile",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    }
  });

  const contractCheckMutation = useMutation({
    mutationFn: checkExpiringContracts,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contract expiry check completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to check contract expiry",
        variant: "destructive",
      });
      console.error('Contract check error:', error);
    }
  });

  const handleSave = (data: Partial<VendorProfile>) => {
    if (editingVendor) {
      updateMutation.mutate({ id: editingVendor.id, data });
    } else {
      createMutation.mutate(data as Omit<VendorProfile, 'id' | 'org_id' | 'created_at' | 'updated_at'>);
    }
  };

  const handleEdit = (vendor: VendorProfile) => {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleViewDetails = (vendor: VendorProfile) => {
    setSelectedVendor(vendor);
    setIsDetailsOpen(true);
  };

  const handleExportSummary = async () => {
    setIsExporting(true);
    try {
      await generateThirdPartyReviewPDF(vendors);
      toast({
        title: "Success",
        description: "Third-party review summary exported successfully",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Error",
        description: "Failed to export third-party review summary",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCheckContracts = () => {
    contractCheckMutation.mutate();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingVendor(null);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedVendor(null);
  };

  const startNewVendor = () => {
    setEditingVendor(null);
    setIsFormOpen(true);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Third-Party Risk Management</h1>
            <p className="text-muted-foreground">
              Assess and manage risks associated with third-party service providers with automated risk scoring, contract management, and external intelligence integration.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCheckContracts}
              disabled={contractCheckMutation.isPending}
            >
              {contractCheckMutation.isPending ? "Checking..." : "Check Contracts"}
            </Button>
            {vendors.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleExportSummary}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Summary"}
              </Button>
            )}
            <Button onClick={startNewVendor}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Risk Overview
            </TabsTrigger>
            <TabsTrigger value="vendors">Vendor Profiles</TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Risk Intelligence
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <VendorRiskDashboard />
          </TabsContent>
          
          <TabsContent value="vendors" className="space-y-6">
            <VendorProfilesList
              vendors={vendors}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            <RiskIntelligenceHub vendorId={selectedVendor?.id} />
          </TabsContent>
        </Tabs>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVendor ? 'Edit Vendor Profile' : 'Add New Vendor'}
              </DialogTitle>
              <DialogDescription>
                Manage vendor information, contracts, and risk assessments with automated scoring.
              </DialogDescription>
            </DialogHeader>
            
            <VendorProfileForm
              vendor={editingVendor || undefined}
              onSubmit={handleSave}
              onCancel={closeForm}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        <VendorDetailsDialog
          vendor={selectedVendor}
          isOpen={isDetailsOpen}
          onClose={closeDetails}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default ThirdPartyRisk;
