
import { useState, useEffect } from "react";
import { GovernancePolicy } from "@/pages/governance/types";
import { getFileUrl } from "@/services/governance-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, ExternalLink, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PolicyViewerProps {
  policy: GovernancePolicy;
}

export default function PolicyViewer({ policy }: PolicyViewerProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadFileUrl() {
      if (!policy.file_path) {
        setIsLoading(false);
        return;
      }
      
      try {
        const url = await getFileUrl(policy.file_path);
        setFileUrl(url);
      } catch (error) {
        console.error("Error loading policy file:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFileUrl();
  }, [policy]);
  
  function getFileTypeComponent() {
    if (!policy.file_path || !fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border rounded border-dashed text-center">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No document uploaded</p>
        </div>
      );
    }
    
    const fileType = policy.file_type?.toLowerCase() || '';
    
    if (fileType.includes('pdf')) {
      return (
        <div className="w-full h-[600px] border rounded overflow-hidden">
          <iframe 
            src={`${fileUrl}#toolbar=0`}
            className="w-full h-full"
            title={`${policy.title} document`}
          />
        </div>
      );
    } else if (fileType.includes('image')) {
      return (
        <div className="border rounded p-4 flex justify-center">
          <img 
            src={fileUrl} 
            alt={policy.title}
            className="max-w-full max-h-[600px] object-contain"
          />
        </div>
      );
    } else if (fileType.includes('markdown') || fileType.includes('text')) {
      return <TextFileViewer url={fileUrl} />;
    } else if (fileType.includes('word') || fileType.includes('excel') || fileType.includes('office')) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border rounded text-center">
          <FileText className="h-12 w-12 text-blue-500 mb-2" />
          <p className="mb-4">Office document preview not available</p>
          <Button
            variant="outline"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      );
    }
    
    // Default case for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded text-center">
        <FileText className="h-12 w-12 text-gray-500 mb-2" />
        <p className="mb-4">Preview not available for this file type</p>
        <Button onClick={() => window.open(fileUrl, '_blank')}>
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{policy.title} - Document</h3>
            {fileUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
          {getFileTypeComponent()}
        </div>
      </CardContent>
    </Card>
  );
}

interface TextFileViewerProps {
  url: string;
}

function TextFileViewer({ url }: TextFileViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error fetching text content:", error);
        setContent("Error loading file content");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContent();
  }, [url]);
  
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }
  
  return (
    <div className="border rounded p-4 bg-gray-50 text-gray-800 overflow-auto h-[400px]">
      <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
    </div>
  );
}
