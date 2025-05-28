
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, Plus, Calendar, AlertTriangle } from "lucide-react";
import { 
  getVendorContracts, 
  createVendorContract, 
  updateVendorContract,
  deleteVendorContract,
  getContractFileUrl,
  VendorContract 
} from "@/services/contract-service";

interface ContractManagementProps {
  vendorId: string;
  vendorName: string;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ vendorId, vendorName }) => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<VendorContract | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['vendorContracts', vendorId],
    queryFn: () => getVendorContracts(vendorId),
  });

  const createMutation = useMutation({
    mutationFn: ({ data, file }: { data: any; file?: File }) => 
      createVendorContract(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorContracts', vendorId] });
      setIsFormOpen(false);
      setEditingContract(null);
      setUploadFile(null);
      toast({
        title: "Success",
        description: "Contract created successfully",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, file }: { id: string; data: any; file?: File }) => 
      updateVendorContract(id, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorContracts', vendorId] });
      setIsFormOpen(false);
      setEditingContract(null);
      setUploadFile(null);
      toast({
        title: "Success",
        description: "Contract updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath?: string }) => 
      deleteVendorContract(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorContracts', vendorId] });
      toast({
        title: "Success",
        description: "Contract deleted successfully",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const contractData = {
      vendor_profile_id: vendorId,
      contract_name: formData.get('contract_name') as string,
      contract_type: formData.get('contract_type') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      auto_renewal: formData.get('auto_renewal') === 'on',
      renewal_notice_days: parseInt(formData.get('renewal_notice_days') as string) || 60,
      contract_value: parseFloat(formData.get('contract_value') as string) || undefined,
      responsible_user_name: formData.get('responsible_user_name') as string,
      status: formData.get('status') as string,
    };

    if (editingContract) {
      updateMutation.mutate({ 
        id: editingContract.id, 
        data: contractData, 
        file: uploadFile || undefined 
      });
    } else {
      createMutation.mutate({ 
        data: { ...contractData, version_number: 1 }, 
        file: uploadFile || undefined 
      });
    }
  };

  const handleDownload = async (contract: VendorContract) => {
    if (!contract.file_path) {
      toast({
        title: "No file",
        description: "This contract has no associated file",
        variant: "destructive",
      });
      return;
    }

    const url = await getContractFileUrl(contract.file_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'pending_renewal': return 'secondary';
      case 'terminated': return 'outline';
      default: return 'default';
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const daysUntilExpiry = Math.floor((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 60 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contract Management</h3>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contract
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-gray-100 rounded" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No contracts found for this vendor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{contract.contract_name}</h4>
                      <Badge variant={getStatusColor(contract.status)}>
                        {contract.status.replace('_', ' ')}
                      </Badge>
                      {isExpiringSoon(contract.end_date) && (
                        <Badge variant="secondary" className="text-amber-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expiring Soon
                        </Badge>
                      )}
                      {isExpired(contract.end_date) && (
                        <Badge variant="destructive">
                          Expired
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Type:</span> {contract.contract_type.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Version:</span> {contract.version_number}
                      </div>
                      <div>
                        <span className="font-medium">Start:</span> {new Date(contract.start_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">End:</span> {new Date(contract.end_date).toLocaleDateString()}
                      </div>
                      {contract.contract_value && (
                        <div>
                          <span className="font-medium">Value:</span> ${contract.contract_value.toLocaleString()}
                        </div>
                      )}
                      {contract.responsible_user_name && (
                        <div>
                          <span className="font-medium">Owner:</span> {contract.responsible_user_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {contract.file_path && (
                      <Button variant="outline" size="sm" onClick={() => handleDownload(contract)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingContract(contract);
                        setIsFormOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate({ id: contract.id, filePath: contract.file_path })}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? 'Edit Contract' : 'Add New Contract'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_name">Contract Name</Label>
                <Input
                  id="contract_name"
                  name="contract_name"
                  defaultValue={editingContract?.contract_name || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contract_type">Contract Type</Label>
                <Select name="contract_type" defaultValue={editingContract?.contract_type || 'service_agreement'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_agreement">Service Agreement</SelectItem>
                    <SelectItem value="software_license">Software License</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={editingContract?.start_date || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={editingContract?.end_date || ''}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_value">Contract Value ($)</Label>
                <Input
                  id="contract_value"
                  name="contract_value"
                  type="number"
                  step="0.01"
                  defaultValue={editingContract?.contract_value || ''}
                />
              </div>
              <div>
                <Label htmlFor="responsible_user_name">Responsible User</Label>
                <Input
                  id="responsible_user_name"
                  name="responsible_user_name"
                  defaultValue={editingContract?.responsible_user_name || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="renewal_notice_days">Renewal Notice (Days)</Label>
                <Input
                  id="renewal_notice_days"
                  name="renewal_notice_days"
                  type="number"
                  defaultValue={editingContract?.renewal_notice_days || 60}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingContract?.status || 'active'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="pending_renewal">Pending Renewal</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="contract_file">Contract File</Label>
              <Input
                id="contract_file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              {editingContract?.file_path && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current file: {editingContract.contract_name}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 
                 editingContract ? 'Update Contract' : 'Add Contract'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractManagement;
