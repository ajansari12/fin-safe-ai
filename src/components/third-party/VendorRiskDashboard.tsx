
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Users, 
  FileText, 
  Activity,
  Eye,
  Plus,
  Building2,
  Clock,
  Network,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedThirdPartyRiskService } from '@/services/enhanced-third-party-risk-service';
import VendorAssessmentsList from './VendorAssessmentsList';
import VendorAssessmentChart from './VendorAssessmentChart';
import { toast } from 'sonner';

const VendorRiskDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (profile?.organization_id) {
      loadDashboardData();
    }
  }, [profile?.organization_id]);

  const loadDashboardData = async () => {
    try {
      const data = await enhancedThirdPartyRiskService.getVendorRiskDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading vendor risk dashboard:', error);
      toast.error('Failed to load vendor risk dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    if (!level) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Unable to load vendor risk dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Third-Party Risk Management</h2>
          <p className="text-muted-foreground">
            OSFI E-21 compliant vendor risk monitoring and critical operations assessment
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              OSFI E-21
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Critical Operations
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              Concentration Risk
            </Badge>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Key Metrics - Enhanced with OSFI E-21 */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_vendors}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.new_vendors_this_month} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Operations</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-xs text-muted-foreground">
              OSFI E-21 critical functions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concentration Risk</CardTitle>
            <Network className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">High</div>
            <p className="text-xs text-muted-foreground">
              3 vendors &gt;20% exposure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disruption Tolerance</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">2hrs</div>
            <p className="text-xs text-muted-foreground">
              Average tolerance threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Vendors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardData.high_risk_vendors}</div>
            <p className="text-xs text-muted-foreground">
              {((dashboardData.high_risk_vendors / dashboardData.total_vendors) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Coverage</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dashboardData.active_monitoring}</div>
            <p className="text-xs text-muted-foreground">
              Real-time feeds active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="critical-ops">Critical Operations</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.risk_distribution?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getRiskColor(item.level)}>
                          {item.level}
                        </Badge>
                        <span className="text-sm">{item.count} vendors</span>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.level === 'critical' ? 'bg-red-500' :
                            item.level === 'high' ? 'bg-orange-500' :
                            item.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Trending Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.trending_risks?.map((risk: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{risk.vendor_name}</span>
                        <Badge variant="outline" className={getRiskColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{risk.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recent_activity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-blue-200 bg-blue-50 rounded-r-lg">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'assessment' && <FileText className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'alert' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                      {activity.type === 'monitoring' && <Activity className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical-ops" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                OSFI E-21 Critical Operations Mapping
              </CardTitle>
              <CardDescription>
                Critical operations supported by third-party vendors with disruption tolerance assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-900">Core Banking Operations</h4>
                      <Badge variant="outline" className="bg-red-100 text-red-800">Critical</Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      Payment processing, account management, transaction clearing
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Primary Vendor:</span><br />
                        FIS Global Banking Solutions
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Disruption Tolerance:</span><br />
                        30 minutes
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Current RTO:</span><br />
                        15 minutes ✓
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-orange-900">Customer Data Management</h4>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                      Customer onboarding, KYC/AML processing, data storage
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Primary Vendor:</span><br />
                        Thomson Reuters Risk Solutions
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Disruption Tolerance:</span><br />
                        2 hours
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Current RTO:</span><br />
                        45 minutes ✓
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-yellow-900">Regulatory Reporting</h4>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      OSFI reporting, stress testing, capital adequacy calculations
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Primary Vendor:</span><br />
                        Moody's Analytics
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Disruption Tolerance:</span><br />
                        24 hours
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="font-medium">Current RTO:</span><br />
                        4 hours ✓
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Concentration Risk Analysis</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">High Concentration (&gt;20% exposure):</span>
                      <ul className="mt-1 text-blue-700">
                        <li>• FIS Global Banking (35% of critical operations)</li>
                        <li>• IBM Cloud Services (25% of infrastructure)</li>
                        <li>• Microsoft Azure (22% of applications)</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium">Risk Mitigation:</span>
                      <ul className="mt-1 text-blue-700">
                        <li>• Dual sourcing strategy in place</li>
                        <li>• Alternative vendor arrangements</li>
                        <li>• Regular stress testing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          {dashboardData?.risk_distribution && (
            <VendorAssessmentChart riskDistribution={dashboardData.risk_distribution} />
          )}
          <VendorAssessmentsList />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Monitoring feeds component will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Dependency mapping component will be implemented here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorRiskDashboard;
