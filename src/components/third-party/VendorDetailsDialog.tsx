
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Trash2, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VendorProfile, VendorDocument, VendorBusinessFunction, getVendorDocuments, getVendorBusinessFunctions, uploadVendorDocument, deleteVendorDocument, addVendorBusinessFunction, removeVendorBusinessFunction } from "@/services/third-party-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface VendorDetailsDialogProps {
  vendor: VendorProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

const VendorDetailsDialog: React.FC<VendorDetailsDialogProps> = ({
  vendor,
  isOpen,
  onClose
}) => {
  const queryClient = useQueryClient();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('contract');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentExpiry, setDocumentExpiry] = useState('');

  const { data: documents = [] } = useQuery({
    queryKey: ['vendorDocuments', vendor?.id],
    queryFn: () => vendor ? getVendorDocuments(vendor.id) : Promise.resolve([]),
    enabled: !!vendor?.id,
  });

  const { data: businessFunctions = [] } = useQuery({
    queryKey: ['vendorBusinessFunctions', vendor?.id],
    queryFn: () => vendor ? getVendorBusinessFunctions(vendor.id) : Promise.resolve([]),
    enabled: !!vendor?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, type, description, expiry }: { file: File; type: string; description?: string; expiry?: string }) =>
      uploadVendorDocument(vendor!.id, file, type, description, expiry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorDocuments', vendor?.id] });
      setUploadFile(null);
      setDocumentDescription('');
      setDocumentExpiry('');
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, filePath }: { id: string; filePath?: string }) =>
      deleteVendorDocument(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorDocuments', vendor?.id] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      console.error('Delete error:', error);
    }
  });

  const handleUpload = () => {
    if (!uploadFile || !vendor) return;
    
    uploadMutation.mutate({
      file: uploadFile,
      type: documentType,
      description: documentDescription,
      expiry: documentExpiry || undefined
    });
  };

  if (!vendor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor.vendor_name}</DialogTitle>
          <DialogDescription>{vendor.service_provided}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="business-functions">Functions</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Criticality</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={vendor.criticality === 'critical' ? 'destructive' : 'default'}>
                    {vendor.criticality}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                    {vendor.status.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>

              {vendor.risk_rating && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Risk Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={vendor.risk_rating === 'critical' ? 'destructive' : 'default'}>
                      {vendor.risk_rating}
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.contact_email && (
                <div>
                  <Label>Contact Email</Label>
                  <p className="text-sm">{vendor.contact_email}</p>
                </div>
              )}
              {vendor.contact_phone && (
                <div>
                  <Label>Contact Phone</Label>
                  <p className="text-sm">{vendor.contact_phone}</p>
                </div>
              )}
              {vendor.website && (
                <div>
                  <Label>Website</Label>
                  <p className="text-sm">
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {vendor.website}
                    </a>
                  </p>
                </div>
              )}
              {vendor.annual_spend && (
                <div>
                  <Label>Annual Spend</Label>
                  <p className="text-sm">${vendor.annual_spend.toLocaleString()}</p>
                </div>
              )}
              {vendor.sla_expiry_date && (
                <div>
                  <Label>SLA Expiry Date</Label>
                  <p className="text-sm">{new Date(vendor.sla_expiry_date).toLocaleDateString()}</p>
                </div>
              )}
              {vendor.contract_end_date && (
                <div>
                  <Label>Contract End Date</Label>
                  <p className="text-sm">{new Date(vendor.contract_end_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {vendor.notes && (
              <div>
                <Label>Notes</Label>
                <p className="text-sm whitespace-pre-wrap">{vendor.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="document-file">Select File</Label>
                    <Input
                      id="document-file"
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="document-type">Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="security_review">Security Review</SelectItem>
                        <SelectItem value="sla">SLA</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="document-description">Description</Label>
                    <Input
                      id="document-description"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="document-expiry">Expiry Date</Label>
                    <Input
                      id="document-expiry"
                      type="date"
                      value={documentExpiry}
                      onChange={(e) => setDocumentExpiry(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!uploadFile || uploadMutation.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="flex justify-between items-center py-4">
                    <div>
                      <p className="font-medium">{doc.document_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.document_type.replace('_', ' ')} • 
                        {new Date(doc.upload_date).toLocaleDateString()}
                        {doc.expiry_date && ` • Expires: ${new Date(doc.expiry_date).toLocaleDateString()}`}
                      </p>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: doc.id, filePath: doc.file_path })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="business-functions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Linked Business Functions</CardTitle>
                <CardDescription>
                  Business functions that depend on this vendor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {businessFunctions.length === 0 ? (
                  <p className="text-muted-foreground">No business functions linked to this vendor.</p>
                ) : (
                  <div className="space-y-2">
                    {businessFunctions.map((bf) => (
                      <div key={bf.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{bf.business_function?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Dependency Level: {bf.dependency_level} • 
                            Function Criticality: {bf.business_function?.criticality}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVendorBusinessFunction(bf.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SLA & Contract Alerts</CardTitle>
                <CardDescription>
                  Upcoming expirations and renewal reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Alert management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailsDialog;
