
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface DocumentViewerProps {
  documentId: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Viewer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
            <p className="text-muted-foreground">
              Document viewer for ID: {documentId}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              File preview functionality will be implemented here.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;
