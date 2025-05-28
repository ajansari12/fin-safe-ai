
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditUploadFormProps {
  orgId: string;
  onUploadSuccess: () => void;
}

interface FormData {
  audit_type: string;
  audit_period: string;
  description: string;
  tags: string;
}

const AuditUploadForm: React.FC<AuditUploadFormProps> = ({ orgId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const { toast } = useToast();
  const auditType = watch("audit_type");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const { auditService } = await import("@/services/audit-service");
      await auditService.uploadAuditDocument(file, {
        org_id: orgId,
        audit_type: data.audit_type,
        audit_period: data.audit_period || undefined,
        description: data.description || undefined,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : undefined
      });

      toast({
        title: "Document uploaded successfully",
        description: "Audit document has been uploaded and is ready for review."
      });

      reset();
      setFile(null);
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Audit Document
        </CardTitle>
        <CardDescription>
          Upload audit documents for review and compliance tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="mt-1"
            />
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="audit_type">Audit Type</Label>
            <Select onValueChange={(value) => setValue("audit_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select audit type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Audit</SelectItem>
                <SelectItem value="external">External Audit</SelectItem>
                <SelectItem value="regulatory">Regulatory Audit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="audit_period">Audit Period</Label>
            <Input
              {...register("audit_period")}
              placeholder="e.g., Q1 2024, 2023 Annual"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Brief description of the audit document..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              {...register("tags")}
              placeholder="e.g., governance, risk, compliance"
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={isUploading || !file || !auditType} className="w-full">
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuditUploadForm;
