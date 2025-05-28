
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { AuditUpload } from "@/services/audit-service";

interface AuditDocumentsListProps {
  documents: AuditUpload[];
  onCreateFinding: (uploadId: string) => void;
}

const AuditDocumentsList: React.FC<AuditDocumentsListProps> = ({ documents, onCreateFinding }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuditTypeColor = (type: string) => {
    switch (type) {
      case 'regulatory': return 'bg-red-100 text-red-800';
      case 'external': return 'bg-blue-100 text-blue-800';
      case 'internal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">{doc.document_name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getAuditTypeColor(doc.audit_type)}>
                      {doc.audit_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => onCreateFinding(doc.id)}>
                  Add Finding
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Uploaded:</span>
                <span>{format(new Date(doc.upload_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">By:</span>
                <span>{doc.uploaded_by_name}</span>
              </div>
              {doc.audit_period && (
                <div>
                  <span className="text-muted-foreground">Period:</span>
                  <span className="ml-1">{doc.audit_period}</span>
                </div>
              )}
              {doc.file_size && (
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-1">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
            
            {doc.description && (
              <p className="text-sm text-muted-foreground mt-3">{doc.description}</p>
            )}
            
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex gap-1 mt-3">
                {doc.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {documents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No audit documents uploaded yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditDocumentsList;
