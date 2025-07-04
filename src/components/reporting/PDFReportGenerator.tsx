import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Users, Shield, AlertTriangle } from 'lucide-react';
import { pdfGenerationService } from '@/services/pdf-generation-service';

const PDFReportGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = async (reportType: 'executive' | 'osfi' | 'third-party') => {
    setIsGenerating(reportType);
    
    try {
      let blob: Blob;
      let filename: string;
      
      switch (reportType) {
        case 'executive':
          blob = await pdfGenerationService.generateExecutiveSummary();
          filename = `Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'osfi':
          blob = await pdfGenerationService.generateOSFIAuditReport();
          filename = `OSFI_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'third-party':
          blob = await pdfGenerationService.generateThirdPartyRiskAssessment();
          filename = `Third_Party_Risk_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      pdfGenerationService.downloadPDF(blob, filename);
      
      toast({
        title: "PDF Generated Successfully",
        description: `${filename} has been downloaded`,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const reportTypes = [
    {
      id: 'executive',
      title: 'Executive Summary',
      description: 'High-level overview of incidents, KPIs, and risk metrics for executive reporting',
      icon: Users,
      badge: 'C-Suite',
      badgeVariant: 'default' as const,
    },
    {
      id: 'osfi',
      title: 'OSFI Audit Report',
      description: 'Comprehensive audit report formatted per OSFI E-21 guidelines with compliance assessment',
      icon: Shield,
      badge: 'Regulatory',
      badgeVariant: 'secondary' as const,
    },
    {
      id: 'third-party',
      title: 'Third-Party Risk Assessment',
      description: 'Detailed vendor risk evaluation template with risk categories and mitigation strategies',
      icon: AlertTriangle,
      badge: 'Vendor Risk',
      badgeVariant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">PDF Report Generator</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isLoading = isGenerating === report.id;
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-primary" />
                  <Badge variant={report.badgeVariant}>{report.badge}</Badge>
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{report.description}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Includes:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {report.id === 'executive' && (
                      <>
                        <li>• Incident statistics and trends</li>
                        <li>• Key performance indicators</li>
                        <li>• Top risk areas identification</li>
                        <li>• Executive action items</li>
                      </>
                    )}
                    {report.id === 'osfi' && (
                      <>
                        <li>• Compliance rating assessment</li>
                        <li>• Regulatory findings & recommendations</li>
                        <li>• Audit objectives and scope</li>
                        <li>• Management responses</li>
                      </>
                    )}
                    {report.id === 'third-party' && (
                      <>
                        <li>• Risk category scoring</li>
                        <li>• Contract details and SLAs</li>
                        <li>• Mitigation strategies</li>
                        <li>• Monitoring recommendations</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => generateReport(report.id as 'executive' | 'osfi' | 'third-party')}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">PDF Report Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Professional formatting with organizational branding</li>
                <li>• Real-time data integration from your current system</li>
                <li>• Regulatory compliance formatting (OSFI E-21, ISO 22301)</li>
                <li>• Customizable templates for different stakeholder audiences</li>
                <li>• Secure generation with confidentiality markings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFReportGenerator;