import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Shield,
  Target,
  Activity,
  Calendar as CalendarIcon,
  FileText,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ReportData {
  incidents: any[];
  kri_breaches: any[];
  controls_effectiveness: any[];
  compliance_scores: any[];
  trend_data: any[];
}

interface AdvancedReportBuilderProps {
  onReportGenerated?: (reportData: any) => void;
}

const AdvancedReportBuilder: React.FC<AdvancedReportBuilderProps> = ({ onReportGenerated }) => {
  const [reportData, setReportData] = useState<ReportData>({
    incidents: [],
    kri_breaches: [],
    controls_effectiveness: [],
    compliance_scores: [],
    trend_data: []
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedModules, setSelectedModules] = useState<string[]>(['all']);
  const [reportType, setReportType] = useState<string>('executive');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [dateRange, selectedModules]);

  const loadReportData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      setIsLoading(true);
      
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');

      // Load data from multiple sources
      const [incidentsRes, breachesRes, controlsRes] = await Promise.all([
        supabase
          .from('incident_logs')
          .select('*')
          .gte('reported_at', fromDate)
          .lte('reported_at', toDate)
          .order('reported_at', { ascending: false }),
        
        supabase
          .from('appetite_breach_logs')
          .select('*')
          .gte('breach_date', fromDate)
          .lte('breach_date', toDate)
          .order('breach_date', { ascending: false }),
        
        supabase
          .from('controls')
          .select('*, control_tests(*)')
          .order('created_at', { ascending: false })
      ]);

      // Process and aggregate data
      const processedData: ReportData = {
        incidents: incidentsRes.data || [],
        kri_breaches: breachesRes.data || [],
        controls_effectiveness: processControlsData(controlsRes.data || []),
        compliance_scores: generateComplianceScores(incidentsRes.data || [], breachesRes.data || []),
        trend_data: generateTrendData(incidentsRes.data || [], breachesRes.data || [])
      };

      setReportData(processedData);

    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processControlsData = (controls: any[]) => {
    return controls.map(control => ({
      name: control.control_name,
      effectiveness: control.effectiveness_score || 0,
      last_tested: control.last_test_date,
      status: control.status,
      risk_reduction: control.risk_reduction_score || 0
    }));
  };

  const generateComplianceScores = (incidents: any[], breaches: any[]) => {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subDays(now, i * 30));
      const monthEnd = endOfMonth(monthStart);
      
      const monthIncidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.reported_at);
        return incidentDate >= monthStart && incidentDate <= monthEnd;
      });
      
      const monthBreaches = breaches.filter(breach => {
        const breachDate = new Date(breach.breach_date);
        return breachDate >= monthStart && breachDate <= monthEnd;
      });
      
      const baseScore = 100;
      const incidentPenalty = monthIncidents.length * 5;
      const breachPenalty = monthBreaches.length * 8;
      const criticalIncidentPenalty = monthIncidents.filter(i => i.severity === 'critical').length * 15;
      
      const score = Math.max(0, baseScore - incidentPenalty - breachPenalty - criticalIncidentPenalty);
      
      months.push({
        month: format(monthStart, 'MMM yyyy'),
        score,
        incidents: monthIncidents.length,
        breaches: monthBreaches.length
      });
    }
    
    return months;
  };

  const generateTrendData = (incidents: any[], breaches: any[]) => {
    const days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      
      const dayIncidents = incidents.filter(incident => 
        format(new Date(incident.reported_at), 'yyyy-MM-dd') === dayStr
      );
      
      const dayBreaches = breaches.filter(breach => 
        format(new Date(breach.breach_date), 'yyyy-MM-dd') === dayStr
      );
      
      days.push({
        date: format(day, 'MMM dd'),
        incidents: dayIncidents.length,
        breaches: dayBreaches.length,
        critical_incidents: dayIncidents.filter(i => i.severity === 'critical').length
      });
    }
    
    return days;
  };

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      
      const reportPayload = {
        report_type: reportType,
        date_range: {
          from: dateRange?.from,
          to: dateRange?.to
        },
        modules: selectedModules,
        data: reportData,
        generated_at: new Date().toISOString()
      };

      // Call AI service to generate intelligent report
      const { data: aiReport, error } = await supabase.functions.invoke('generate-intelligent-report', {
        body: reportPayload
      });

      if (error) throw error;

      // Send report via email if requested
      await supabase.functions.invoke('send-notification-email', {
        body: {
          to: 'executive@organization.com', // This would be dynamic
          subject: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Risk Report - ${format(new Date(), 'MMM dd, yyyy')}`,
          type: 'system_alert',
          data: {
            report_content: aiReport.report,
            attachments: ['risk-report.pdf']
          },
          urgency: 'medium'
        }
      });

      toast({
        title: "Report Generated",
        description: "Advanced analytics report has been generated and sent"
      });

      onReportGenerated?.(aiReport);

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportData = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-report-data', {
        body: {
          data: reportData,
          format,
          report_type: reportType,
          date_range: dateRange
        }
      });

      if (error) throw error;

      toast({
        title: "Export Started",
        description: `Report export in ${format.toUpperCase()} format has been initiated`
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const incidentsByCategory = reportData.incidents.reduce((acc, incident) => {
    const category = incident.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(incidentsByCategory).map(([category, count]) => ({
    name: category,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6 space-y-6">
      {/* Report Builder Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Report Builder</h1>
          <p className="text-muted-foreground">
            Generate intelligent, AI-powered analytics reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="operational">Operational Details</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="risk">Risk Assessment</SelectItem>
                  <SelectItem value="performance">Performance Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => setDateRange(range)}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Modules</label>
              <Select value={selectedModules[0]} onValueChange={(value) => setSelectedModules([value])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="incidents">Incidents</SelectItem>
                  <SelectItem value="controls">Controls & KRIs</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="third-party">Third Party</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.incidents.length}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.incidents.filter(i => i.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KRI Breaches</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.kri_breaches.length}</div>
            <p className="text-xs text-muted-foreground">
              Risk appetite exceeded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controls Effectiveness</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.controls_effectiveness.length > 0 
                ? Math.round(reportData.controls_effectiveness.reduce((acc, c) => acc + c.effectiveness, 0) / reportData.controls_effectiveness.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.compliance_scores.length > 0
                ? Math.round(reportData.compliance_scores[reportData.compliance_scores.length - 1]?.score || 0)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Incident & Breach Trends</CardTitle>
            <CardDescription>30-day trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.trend_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="incidents" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="breaches" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="critical_incidents" stackId="1" stroke="#ff7300" fill="#ff7300" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
            <CardDescription>Distribution of incident types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score Trend</CardTitle>
            <CardDescription>6-month compliance trajectory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.compliance_scores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Controls Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Top Controls Effectiveness</CardTitle>
            <CardDescription>Most and least effective controls</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.controls_effectiveness.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="effectiveness" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedReportBuilder;