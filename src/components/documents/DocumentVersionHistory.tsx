
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { documentManagementService } from "@/services/document-management-service";
import { History, Download, Eye, FileText, User, Calendar, ChevronDown, ChevronRight, Sparkles, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface DocumentVersionHistoryProps {
  documentId: string;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({ documentId }) => {
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  
  const { data: versions = [], refetch } = useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: () => documentManagementService.getDocumentVersions(documentId)
  });

  const toggleSummaryExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedSummaries(newExpanded);
  };

  const handleRevertToVersion = async (versionId: string) => {
    try {
      await documentManagementService.revertToVersion(documentId, versionId);
      refetch();
      toast.success('Successfully reverted to previous version');
    } catch (error) {
      console.error('Error reverting to version:', error);
      toast.error('Failed to revert to version. Please try again.');
    }
  };

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-medium mb-2">No version history</h4>
          <p className="text-muted-foreground">
            This document has no previous versions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Version History ({versions.length})</h3>
      </div>

      <div className="space-y-3">
        {versions.map((version, index) => (
          <Card key={version.id} className={version.is_current_version ? 'border-blue-500' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Version {version.version_number}</span>
                    {version.is_current_version && (
                      <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                    )}
                    <Badge variant="outline">{version.status}</Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>Uploaded by {version.uploaded_by_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(version.created_at))} ago
                        ({new Date(version.created_at).toLocaleString()})
                      </span>
                    </div>
                    {version.file_size && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        <span>{(version.file_size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>

                  {version.description && (
                    <p className="text-sm mt-2 text-gray-700">{version.description}</p>
                  )}

                  {/* AI-Generated Version Summary */}
                  <TooltipProvider>
                    {version.ai_analysis_status === 'completed' && version.ai_summary ? (
                      <Collapsible
                        open={expandedSummaries.has(version.id)}
                        onOpenChange={() => toggleSummaryExpansion(version.id)}
                      >
                        <div className="mt-3 border border-emerald-200 bg-emerald-50 rounded-lg">
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between p-3 h-auto text-left hover:bg-emerald-100"
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium text-emerald-800 text-sm">
                                  AI Version Summary
                                </span>
                              </div>
                              {expandedSummaries.has(version.id) ? (
                                <ChevronDown className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-emerald-600" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-3 pb-3">
                            <div className="text-sm text-emerald-700 leading-relaxed">
                              {version.ai_summary}
                            </div>
                          </CollapsibleContent>
                          {!expandedSummaries.has(version.id) && (
                            <div className="px-3 pb-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-xs text-emerald-600 truncate">
                                    {version.ai_summary.slice(0, 80)}
                                    {version.ai_summary.length > 80 && '...'}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                  <p className="text-sm">{version.ai_summary}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </Collapsible>
                    ) : version.ai_analysis_status === 'pending' ? (
                      <div className="mt-3 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
                        <span className="text-sm text-yellow-700">
                          AI summary being generated...
                        </span>
                      </div>
                    ) : version.ai_analysis_status === 'failed' ? (
                      <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          Failed to generate AI summary
                        </span>
                      </div>
                    ) : null}
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  {!version.is_current_version && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRevertToVersion(version.id)}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              </div>

              {/* Show changes from previous version */}
              {index < versions.length - 1 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Changes from v{versions[index + 1].version_number}:</span>
                    <ul className="list-disc list-inside mt-1 ml-2">
                      <li>Document content updated</li>
                      {version.status !== versions[index + 1].status && (
                        <li>Status changed from {versions[index + 1].status} to {version.status}</li>
                      )}
                      {version.file_size !== versions[index + 1].file_size && (
                        <li>File size changed</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentVersionHistory;
