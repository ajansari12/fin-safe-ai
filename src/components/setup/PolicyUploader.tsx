
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { securityLogger } from "@/services/security/advanced-security-logger";
import { threatDetectionEngine } from "@/services/security/threat-detection-engine";

interface PolicyUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  orgId?: string;
  enableSecurityScanning?: boolean;
}

interface SecurityScanResult {
  file: File;
  riskScore: number;
  threats: string[];
  recommendations: string[];
  status: 'safe' | 'warning' | 'danger';
}

export function PolicyUploader({ files, onFilesChange, orgId, enableSecurityScanning = true }: PolicyUploaderProps) {
  const [scanResults, setScanResults] = useState<SecurityScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    const updatedFiles = [...files, ...validFiles];
    onFilesChange(updatedFiles);
    
    // Perform security scanning if enabled
    if (enableSecurityScanning && validFiles.length > 0) {
      performSecurityScan(validFiles);
    }
  }, [files, onFilesChange, enableSecurityScanning]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    
    // Remove corresponding scan result
    const fileToRemove = files[index];
    setScanResults(prev => prev.filter(result => result.file !== fileToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const performSecurityScan = async (filesToScan: File[]) => {
    setIsScanning(true);
    
    try {
      const newScanResults: SecurityScanResult[] = [];
      
      for (const file of filesToScan) {
        const scanResult = await scanFileForThreats(file);
        newScanResults.push(scanResult);
        
        // Log security event
        if (orgId) {
          await securityLogger.logDataAccessEvent(
            orgId,
            'system', // User would be determined in real implementation
            'policy_document',
            file.name,
            'upload_scan',
            scanResult.riskScore
          );
        }
      }
      
      setScanResults(prev => [...prev, ...newScanResults]);
    } catch (error) {
      console.error('Security scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const scanFileForThreats = async (file: File): Promise<SecurityScanResult> => {
    // Simulate security scanning - in real implementation, this would:
    // 1. Check file metadata and headers
    // 2. Scan for malicious content
    // 3. Validate file integrity
    // 4. Check against threat intelligence
    
    const suspiciousPatterns = [
      /javascript:/i,
      /<script/i,
      /eval\(/i,
      /base64/i,
      /payload/i,
      /exploit/i,
    ];
    
    let riskScore = 0;
    const threats: string[] = [];
    const recommendations: string[] = [];
    
    // Check file size (files that are too large might be suspicious)
    if (file.size > 50 * 1024 * 1024) { // 50MB
      riskScore += 20;
      threats.push('Unusually large file size');
      recommendations.push('Review file contents for potential data exfiltration');
    }
    
    // Check file name for suspicious patterns
    const fileName = file.name.toLowerCase();
    if (suspiciousPatterns.some(pattern => pattern.test(fileName))) {
      riskScore += 40;
      threats.push('Suspicious file name pattern');
      recommendations.push('Rename file to remove suspicious patterns');
    }
    
    // Check file type validity
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      riskScore += 30;
      threats.push('Unexpected file type');
      recommendations.push('Ensure file is a valid document format');
    }
    
    // Simulate content scanning (would require actual file reading in real implementation)
    if (Math.random() < 0.1) { // 10% chance of finding suspicious content
      riskScore += 50;
      threats.push('Potentially malicious content detected');
      recommendations.push('Scan file with antivirus software');
    }
    
    // Run through threat detection engine
    const threatAnalysis = await threatDetectionEngine.analyzeSecurityEvent({
      event_type: 'file_upload',
      event_category: 'data_access',
      event_data: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        threats: threats,
      },
      risk_score: riskScore,
      org_id: orgId,
    });
    
    if (threatAnalysis.isThreat) {
      riskScore = Math.max(riskScore, threatAnalysis.riskScore);
      threats.push(...threatAnalysis.triggeredRules);
      recommendations.push(...threatAnalysis.recommendations);
    }
    
    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (riskScore >= 70) status = 'danger';
    else if (riskScore >= 30) status = 'warning';
    
    return {
      file,
      riskScore,
      threats,
      recommendations,
      status,
    };
  };

  const getSecurityBadge = (result: SecurityScanResult) => {
    switch (result.status) {
      case 'safe':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Safe</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="text-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'danger':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Dangerous</Badge>;
      default:
        return null;
    }
  };

  const getFileSecurityResult = (file: File) => {
    return scanResults.find(result => result.file === file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Existing Policies (Optional)
          {enableSecurityScanning && <Shield className="h-4 w-4 text-primary" />}
        </CardTitle>
        <CardDescription>
          Upload any existing policies your organization has. Supported formats: PDF, DOC, DOCX
          {enableSecurityScanning && " • Security scanning enabled"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="policy-upload"
          />
          <label htmlFor="policy-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop policy documents
            </p>
          </label>
        </div>

        {isScanning && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Scanning files for security threats...
            </AlertDescription>
          </Alert>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files:</h4>
            {files.map((file, index) => {
              const securityResult = getFileSecurityResult(file);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      {securityResult && getSecurityBadge(securityResult)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {securityResult && securityResult.status !== 'safe' && (
                    <div className="ml-6 p-3 bg-yellow-50 rounded-lg text-sm">
                      <div className="font-medium text-yellow-800 mb-1">
                        Security Issues Detected (Risk Score: {securityResult.riskScore})
                      </div>
                      {securityResult.threats.length > 0 && (
                        <div className="mb-2">
                          <span className="font-medium">Threats:</span>
                          <ul className="list-disc list-inside text-yellow-700">
                            {securityResult.threats.map((threat, i) => (
                              <li key={i}>{threat}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {securityResult.recommendations.length > 0 && (
                        <div>
                          <span className="font-medium">Recommendations:</span>
                          <ul className="list-disc list-inside text-yellow-700">
                            {securityResult.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
