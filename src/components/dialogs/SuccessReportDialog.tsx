import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Download, 
  Mail,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuccessReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReportMetric {
  label: string;
  value: string;
  icon: React.ReactNode;
  status: 'success' | 'warning' | 'info';
}

interface ReportSection {
  title: string;
  items: string[];
}

export const SuccessReportDialog: React.FC<SuccessReportDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const { toast } = useToast();

  const reportMetrics: ReportMetric[] = [
    {
      label: 'Go-Live Completion Time',
      value: '8 minutes 32 seconds',
      icon: <Clock className="h-4 w-4" />,
      status: 'success'
    },
    {
      label: 'System Health Score',
      value: '98.5%',
      icon: <TrendingUp className="h-4 w-4" />,
      status: 'success'
    },
    {
      label: 'Active User Sessions',
      value: '147 users',
      icon: <Users className="h-4 w-4" />,
      status: 'info'
    },
    {
      label: 'Security Validation',
      value: 'All Passed',
      icon: <Shield className="h-4 w-4" />,
      status: 'success'
    },
    {
      label: 'Database Performance',
      value: '<50ms avg',
      icon: <Database className="h-4 w-4" />,
      status: 'success'
    },
    {
      label: 'Rollback Capability',
      value: 'Available',
      icon: <CheckCircle className="h-4 w-4" />,
      status: 'info'
    }
  ];

  const reportSections: ReportSection[] = [
    {
      title: 'Completed Successfully',
      items: [
        'Pre-flight validation passed with 100% success rate',
        'Database migrations completed without errors',
        'Security configurations verified and active',
        'All critical services responding within SLA',
        'User authentication flows tested and operational',
        'End-to-end system verification completed'
      ]
    },
    {
      title: 'System Readiness',
      items: [
        'Load balancing configured and distributing traffic',
        'Monitoring systems active and alerting configured',
        'Backup systems verified and ready',
        'Disaster recovery procedures tested',
        'Performance baselines established',
        'Support team notified and standing by'
      ]
    },
    {
      title: 'Post Go-Live Actions',
      items: [
        'Monitor system performance for first 24 hours',
        'Review user feedback and system metrics',
        'Conduct daily health checks for first week',
        'Schedule post-implementation review meeting',
        'Update documentation with any configuration changes',
        'Prepare monthly performance review'
      ]
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    setReportGenerated(true);
    
    toast({
      title: "Report Generated Successfully",
      description: "Go-live success report is ready for download and distribution.",
    });
  };

  const handleDownloadReport = () => {
    // Create a simple report structure
    const reportData = {
      title: 'Go-Live Success Report',
      timestamp: new Date().toISOString(),
      metrics: reportMetrics,
      sections: reportSections,
      summary: {
        status: 'Successful',
        duration: '8 minutes 32 seconds',
        issues: 'None',
        nextSteps: 'Begin post-go-live monitoring phase'
      }
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `go-live-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Success report has been downloaded to your device.",
    });
  };

  const handleEmailReport = () => {
    toast({
      title: "Email Functionality",
      description: "Email distribution feature would be implemented here.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Go-Live Success Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-green-700">
                🎉 Go-Live Successfully Completed!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your system is now live and operational. All critical components have been verified and are functioning within expected parameters.
                Generated on: {new Date().toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {reportMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <div className="text-muted-foreground">
                      {metric.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <p className="font-medium">{metric.value}</p>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status === 'success' ? '✓' : metric.status === 'warning' ? '⚠' : 'ℹ'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {reportSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {!reportGenerated && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-medium">Generate Detailed Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a comprehensive report with all metrics, logs, and recommendations.
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateReport} 
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {reportGenerated && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleEmailReport}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};