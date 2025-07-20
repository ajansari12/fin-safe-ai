import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Activity,
  BarChart3,
  Calendar,
  Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SLAMetric {
  id: string;
  name: string;
  description: string;
  target: number;
  actual: number;
  unit: string;
  status: 'met' | 'warning' | 'breach';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface VendorSLA {
  id: string;
  vendorName: string;
  contractId: string;
  metrics: SLAMetric[];
  overallCompliance: number;
  breachCount: number;
  lastBreach?: Date;
  nextReview: Date;
}

interface SLABreach {
  id: string;
  vendorName: string;
  metric: string;
  target: number;
  actual: number;
  severity: 'minor' | 'major' | 'critical';
  breachDate: Date;
  duration: number; // in minutes
  impact: string;
  resolution: string;
  status: 'open' | 'investigating' | 'resolved';
}

const SLAMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Mock data
  const vendorSLAs: VendorSLA[] = [
    {
      id: '1',
      vendorName: 'CloudTech Solutions',
      contractId: 'CT-2024-001',
      overallCompliance: 98.5,
      breachCount: 2,
      lastBreach: new Date('2024-01-10'),
      nextReview: new Date('2024-02-15'),
      metrics: [
        {
          id: '1',
          name: 'System Availability',
          description: 'Uptime percentage for critical systems',
          target: 99.9,
          actual: 99.2,
          unit: '%',
          status: 'warning',
          trend: 'down',
          lastUpdated: new Date()
        },
        {
          id: '2',
          name: 'Response Time',
          description: 'Average API response time',
          target: 200,
          actual: 180,
          unit: 'ms',
          status: 'met',
          trend: 'up',
          lastUpdated: new Date()
        },
        {
          id: '3',
          name: 'Issue Resolution',
          description: 'Time to resolve critical issues',
          target: 4,
          actual: 3.5,
          unit: 'hours',
          status: 'met',
          trend: 'stable',
          lastUpdated: new Date()
        }
      ]
    },
    {
      id: '2',
      vendorName: 'DataFlow Analytics',
      contractId: 'DF-2024-002',
      overallCompliance: 95.2,
      breachCount: 5,
      lastBreach: new Date('2024-01-18'),
      nextReview: new Date('2024-03-01'),
      metrics: [
        {
          id: '4',
          name: 'Data Processing Speed',
          description: 'Time to process daily batch jobs',
          target: 2,
          actual: 2.8,
          unit: 'hours',
          status: 'breach',
          trend: 'down',
          lastUpdated: new Date()
        },
        {
          id: '5',
          name: 'Data Accuracy',
          description: 'Percentage of error-free data',
          target: 99.5,
          actual: 98.9,
          unit: '%',
          status: 'warning',
          trend: 'stable',
          lastUpdated: new Date()
        }
      ]
    }
  ];

  const recentBreaches: SLABreach[] = [
    {
      id: '1',
      vendorName: 'CloudTech Solutions',
      metric: 'System Availability',
      target: 99.9,
      actual: 98.1,
      severity: 'major',
      breachDate: new Date('2024-01-10'),
      duration: 180,
      impact: 'Customer portal downtime affecting 500+ users',
      resolution: 'Infrastructure upgrade and redundancy implementation',
      status: 'resolved'
    },
    {
      id: '2',
      vendorName: 'DataFlow Analytics',
      metric: 'Data Processing Speed',
      target: 2,
      actual: 4.2,
      severity: 'critical',
      breachDate: new Date('2024-01-18'),
      duration: 320,
      impact: 'Delayed regulatory reporting',
      resolution: 'Performance optimization and additional resources',
      status: 'resolved'
    }
  ];

  const performanceData = [
    { month: 'Jan', availability: 99.2, responseTime: 180, compliance: 98.5 },
    { month: 'Feb', availability: 99.8, responseTime: 165, compliance: 99.1 },
    { month: 'Mar', availability: 99.5, responseTime: 175, compliance: 98.9 },
    { month: 'Apr', availability: 99.9, responseTime: 160, compliance: 99.3 },
    { month: 'May', availability: 99.1, responseTime: 190, compliance: 98.2 },
    { month: 'Jun', availability: 99.7, responseTime: 170, compliance: 99.0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'breach': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const calculateOverallMetrics = () => {
    const totalVendors = vendorSLAs.length;
    const avgCompliance = vendorSLAs.reduce((sum, vendor) => sum + vendor.overallCompliance, 0) / totalVendors;
    const totalBreaches = vendorSLAs.reduce((sum, vendor) => sum + vendor.breachCount, 0);
    const vendorsAtRisk = vendorSLAs.filter(vendor => vendor.overallCompliance < 98).length;

    return {
      totalVendors,
      avgCompliance: Math.round(avgCompliance * 10) / 10,
      totalBreaches,
      vendorsAtRisk
    };
  };

  const overallMetrics = calculateOverallMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">SLA Monitoring & Performance</h3>
          <p className="text-sm text-muted-foreground">
            Real-time vendor SLA compliance and performance tracking
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure SLAs
        </Button>
      </div>

      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              Active SLA monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallMetrics.avgCompliance}%</div>
            <p className="text-xs text-muted-foreground">
              Across all vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Breaches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallMetrics.totalBreaches}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Vendors</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overallMetrics.vendorsAtRisk}</div>
            <p className="text-xs text-muted-foreground">
              Below 98% compliance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="vendors">Vendor SLAs</TabsTrigger>
          <TabsTrigger value="breaches">Breach History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>SLA Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorSLAs.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{vendor.vendorName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {vendor.breachCount} breaches this month
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium text-sm">{vendor.overallCompliance}%</div>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                vendor.overallCompliance >= 99 ? 'bg-green-500' :
                                vendor.overallCompliance >= 98 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${vendor.overallCompliance}%` }}
                            ></div>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          vendor.overallCompliance >= 99 ? getStatusColor('met') :
                          vendor.overallCompliance >= 98 ? getStatusColor('warning') : getStatusColor('breach')
                        }>
                          {vendor.overallCompliance >= 99 ? 'Met' :
                           vendor.overallCompliance >= 98 ? 'Warning' : 'Breach'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent SLA Breaches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBreaches.slice(0, 3).map((breach) => (
                    <div key={breach.id} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{breach.vendorName}</h4>
                        <Badge variant="outline" className={getSeverityColor(breach.severity)}>
                          {breach.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {breach.metric}: {breach.actual}{breach.metric.includes('Time') ? 'h' : '%'} 
                        (target: {breach.target}{breach.metric.includes('Time') ? 'h' : '%'})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {breach.breachDate.toLocaleDateString()} • {breach.duration}min duration
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid gap-4">
            {vendorSLAs.map((vendor) => (
              <Card key={vendor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{vendor.vendorName}</CardTitle>
                      <CardDescription>Contract: {vendor.contractId}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{vendor.overallCompliance}%</div>
                      <p className="text-xs text-muted-foreground">Overall Compliance</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendor.metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTrendIcon(metric.trend)}
                          <div>
                            <h4 className="font-medium text-sm">{metric.name}</h4>
                            <p className="text-xs text-muted-foreground">{metric.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium text-sm">
                              {metric.actual}{metric.unit} / {metric.target}{metric.unit}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {metric.lastUpdated.toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(metric.status)}>
                            {metric.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breaches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Breach History</CardTitle>
              <CardDescription>
                Detailed record of all SLA breaches and resolutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBreaches.map((breach) => (
                  <div key={breach.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{breach.vendorName} - {breach.metric}</h4>
                        <p className="text-sm text-muted-foreground">
                          {breach.breachDate.toLocaleDateString()} • Duration: {Math.floor(breach.duration / 60)}h {breach.duration % 60}m
                        </p>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(breach.severity)}>
                        {breach.severity}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <span className="font-medium">Target:</span> {breach.target}
                        {breach.metric.includes('Time') ? 'h' : '%'} | 
                        <span className="font-medium"> Actual:</span> {breach.actual}
                        {breach.metric.includes('Time') ? 'h' : '%'}
                      </div>
                      <div>
                        <span className="font-medium">Impact:</span> {breach.impact}
                      </div>
                      <div>
                        <span className="font-medium">Resolution:</span> {breach.resolution}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="compliance" stroke="#3b82f6" name="Compliance %" />
                    <Line type="monotone" dataKey="availability" stroke="#10b981" name="Availability %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Breach Frequency by Vendor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendorSLAs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="vendorName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="breachCount" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SLA Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">175ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Availability</span>
                    <span className="font-medium">99.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Issue Resolution Time</span>
                    <span className="font-medium">3.2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Processing Speed</span>
                    <span className="font-medium">2.1 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SLAMonitoring;