import React from 'react';
import DocumentUploader from './DocumentUploader';

interface DocumentVersionUploaderProps {
  documentId: string;
  onUploadComplete: () => void;
}

const DocumentVersionUploader: React.FC<DocumentVersionUploaderProps> = ({
  documentId,
  onUploadComplete
}) => {
  return (
    <DocumentUploader
      existingDocumentId={documentId}
      isNewVersion={true}
      onUploadComplete={onUploadComplete}
    />
  );
};

export default DocumentVersionUploader;