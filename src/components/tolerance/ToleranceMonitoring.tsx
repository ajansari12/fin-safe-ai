
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, Bell, Shield, Settings, Brain } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import { useToast } from "@/hooks/use-toast";
import { ProportionalityService } from "@/services/tolerance/proportionality-service";
import { logToleranceBreach } from "@/services/appetite-breach/breach-logs-service";
import { logger } from "@/lib/logger";

interface ToleranceStatus {
  id: string;
  operationName: string;
  classification: 'critical' | 'high' | 'medium' | 'low';
  status: 'operational' | 'degraded' | 'breach' | 'offline';
  currentRTO: number;
  maxRTO: number;
  currentRPO: number;
  maxRPO: number;
  serviceLevel: number;
  serviceThreshold: number;
  lastUpdate: string;
  incidentCount: number;
  uptime: number;
  businessFunctionId?: string;
  toleranceId?: string;
}

interface OrganizationalProfile {
  employee_count: number;
  size: string;
  sector: string;
}

interface ProportionalityConfig {
  size: 'small' | 'medium' | 'large' | 'enterprise';
  employee_count: number;
  thresholdSensitivity: 'relaxed' | 'standard' | 'strict' | 'critical';
  alertFrequency: 'hourly' | 'daily' | 'weekly';
  escalationTimeline: 'immediate' | 'standard' | 'extended';
  monitoringDepth: 'basic' | 'standard' | 'comprehensive' | 'enterprise';
}

interface BreachEvent {
  toleranceId: string;
  operationName: string;
  breachType: 'rto' | 'rpo' | 'service_level';
  severity: 'low' | 'medium' | 'high' | 'critical';
  actualValue: number;
  thresholdValue: number;
  variance: number;
  detectedAt: string;
}

const ToleranceMonitoring = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    setCurrentModule,
    analyzeToleranceBreach,
    predictPotentialBreaches,
    isAnalyzingBreach 
  } = useEnhancedAIAssistant();
  
  const [toleranceStatuses, setToleranceStatuses] = useState<ToleranceStatus[]>([]);
  const [orgProfile, setOrgProfile] = useState<OrganizationalProfile | null>(null);
  const [proportionalityConfig, setProportionalityConfig] = useState<ProportionalityConfig | null>(null);
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [realtimeBreaches, setRealtimeBreaches] = useState<BreachEvent[]>([]);
  const [isProportionalMode, setIsProportionalMode] = useState(true);

  // Real-time subscriptions for breach detection
  const { isConnected: toleranceConnected } = useRealtimeSubscription({
    table: 'impact_tolerances',
    event: '*',
    onUpdate: (payload) => handleToleranceUpdate(payload.new),
    onInsert: (payload) => handleToleranceUpdate(payload.new),
    enabled: !!profile?.organization_id
  });

  const { isConnected: dependencyConnected } = useRealtimeSubscription({
    table: 'dependency_logs',
    event: 'INSERT',
    onInsert: (payload) => handleDependencyEvent(payload.new),
    enabled: !!profile?.organization_id
  });

  const { isConnected: kriConnected } = useRealtimeSubscription({
    table: 'kri_logs',
    event: 'INSERT',
    onInsert: (payload) => handleKRIEvent(payload.new),
    enabled: !!profile?.organization_id
  });

  // Initialize component
  useEffect(() => {
    setCurrentModule('tolerance-monitoring');
    if (profile?.organization_id) {
      loadOrganizationalProfile();
      loadProportionalityConfig();
      loadToleranceData();
    }
  }, [profile?.organization_id, setCurrentModule]);

  const loadProportionalityConfig = async () => {
    const config = await ProportionalityService.getOrganizationalConfig();
    if (config) {
      setProportionalityConfig(config);
    }
  };

  const loadOrganizationalProfile = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data: orgData } = await supabase
        .from('organizational_profiles')
        .select('employee_count, sub_sector')
        .eq('organization_id', profile.organization_id)
        .maybeSingle();

      if (orgData) {
        setOrgProfile({
          employee_count: orgData.employee_count || 100,
          size: orgData.employee_count < 100 ? 'small' : 
                orgData.employee_count < 500 ? 'medium' : 'large',
          sector: orgData.sub_sector || 'banking'
        });
      }
    } catch (error) {
      console.error('Error loading organizational profile:', error);
    }
  };

  const loadToleranceData = async () => {
    if (!profile?.organization_id) return;

    setLoading(true);
    try {
      // Load impact tolerances and related data
      const { data: tolerances, error } = await supabase
        .from('impact_tolerances')
        .select(`
          *,
          business_functions(name, criticality)
        `)
        .eq('org_id', profile.organization_id);

      if (error) throw error;

      // Transform real data into tolerance statuses
      const transformedData: ToleranceStatus[] = (tolerances || []).map((tolerance, index) => ({
        id: tolerance.id,
        operationName: tolerance.business_functions?.name || `Operation ${index + 1}`,
        classification: tolerance.business_functions?.criticality as any || 'medium',
        status: calculateOperationStatus(tolerance),
        currentRTO: tolerance.current_rto_minutes || 0,
        maxRTO: tolerance.max_rto_hours * 60 || 120,
        currentRPO: tolerance.current_rpo_minutes || 0,
        maxRPO: tolerance.max_rpo_hours * 60 || 60,
        serviceLevel: tolerance.current_availability_percentage || 99,
        serviceThreshold: tolerance.min_availability_percentage || 95,
        lastUpdate: tolerance.updated_at || new Date().toISOString(),
        incidentCount: 0, // Would be calculated from incident logs
        uptime: tolerance.current_availability_percentage || 99,
        businessFunctionId: tolerance.function_id,
        toleranceId: tolerance.id
      }));

      setToleranceStatuses(transformedData);
    } catch (error) {
      console.error('Error loading tolerance data:', error);
      // Fallback to demo data if real data fails
      setToleranceStatuses([
        {
          id: '1',
          operationName: 'Core Banking System',
          classification: 'critical',
          status: 'operational',
          currentRTO: 45,
          maxRTO: 60,
          currentRPO: 12,
          maxRPO: 15,
          serviceLevel: 98.5,
          serviceThreshold: 95,
          lastUpdate: new Date().toISOString(),
          incidentCount: 0,
          uptime: 99.9
        },
        {
          id: '2',
          operationName: 'Online Banking Portal',
          classification: 'high',
          status: 'degraded',
          currentRTO: 90,
          maxRTO: 120,
          currentRPO: 25,
          maxRPO: 30,
          serviceLevel: 87,
          serviceThreshold: 90,
          lastUpdate: new Date().toISOString(),
          incidentCount: 2,
          uptime: 97.8
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced breach calculation with proportional thresholds
  const calculateOperationStatus = (tolerance: any): 'operational' | 'degraded' | 'breach' | 'offline' => {
    if (!proportionalityConfig) {
      // Fallback to standard calculation
      const rtoBreached = (tolerance.current_rto_minutes || 0) > (tolerance.max_rto_hours * 60 || 120);
      const rpoBreached = (tolerance.current_rpo_minutes || 0) > (tolerance.max_rpo_hours * 60 || 60);
      const availabilityBreached = (tolerance.current_availability_percentage || 99) < (tolerance.min_availability_percentage || 95);
      
      if (rtoBreached || rpoBreached) return 'breach';
      if (availabilityBreached) return 'degraded';
      if ((tolerance.current_availability_percentage || 99) > 98) return 'operational';
      return 'degraded';
    }

    // Apply proportional thresholds based on organization size
    const adjustedTolerances = ProportionalityService.calculateAdjustedTolerances(
      {
        rto: tolerance.max_rto_hours * 60 || 120,
        rpo: tolerance.max_rpo_hours * 60 || 60,
        availability: tolerance.min_availability_percentage || 95
      },
      proportionalityConfig
    );

    const rtoBreached = (tolerance.current_rto_minutes || 0) > adjustedTolerances.rto;
    const rpoBreached = (tolerance.current_rpo_minutes || 0) > adjustedTolerances.rpo;
    const availabilityBreached = (tolerance.current_availability_percentage || 99) < adjustedTolerances.availability;
    
    if (rtoBreached || rpoBreached) return 'breach';
    if (availabilityBreached) return 'degraded';
    if ((tolerance.current_availability_percentage || 99) > 98) return 'operational';
    return 'degraded';
  };

  // Real-time breach detection handlers
  const handleToleranceUpdate = async (tolerance: any) => {
    const newStatus = calculateOperationStatus(tolerance);
    const isBreached = newStatus === 'breach';
    
    // Update local state
    setToleranceStatuses(prev => prev.map(t => 
      t.toleranceId === tolerance.id 
        ? {
            ...t,
            status: newStatus,
            currentRTO: tolerance.current_rto_minutes || t.currentRTO,
            currentRPO: tolerance.current_rpo_minutes || t.currentRPO,
            serviceLevel: tolerance.current_availability_percentage || t.serviceLevel,
            lastUpdate: new Date().toISOString()
          }
        : t
    ));

    // Trigger breach alert if status changed to breach
    if (isBreached) {
      await triggerBreachAlert(tolerance, 'tolerance_update');
    }
  };

  const handleDependencyEvent = async (dependencyLog: any) => {
    if (dependencyLog.tolerance_breached) {
      await triggerBreachAlert(dependencyLog, 'dependency_failure');
    }
  };

  const handleKRIEvent = async (kriLog: any) => {
    if (kriLog.threshold_breached && kriLog.threshold_breached !== 'none') {
      await triggerBreachAlert(kriLog, 'kri_threshold');
    }
  };

  // Enhanced breach alert with OSFI E-21 citations and proportionality
  const triggerBreachAlert = async (data: any, alertType: string) => {
    try {
      const severity = calculateBreachSeverity(data, alertType);
      const isSmallFRFI = orgProfile?.employee_count && orgProfile.employee_count < 100;
      
      // Create breach event
      const breachEvent: BreachEvent = {
        toleranceId: data.id,
        operationName: data.operation_name || 'Unknown Operation',
        breachType: alertType === 'dependency_failure' ? 'service_level' : 'rto',
        severity,
        actualValue: data.current_rto_minutes || data.actual_value || 0,
        thresholdValue: data.max_rto_hours * 60 || data.threshold_value || 0,
        variance: calculateVariance(data),
        detectedAt: new Date().toISOString()
      };

      setRealtimeBreaches(prev => [...prev, breachEvent]);

      // Display OSFI-compliant toast notification
      const osfiCitation = "Per OSFI E-21 Principle 7, this disruption exceeds your institution's defined tolerance for critical operations.";
      const disclaimer = "This analysis is based on OSFI E-21 guidelines. This is not regulatory advice. Consult OSFI or qualified professionals for your institution's specific compliance requirements.";
      
      toast({
        title: `${severity.toUpperCase()} Tolerance Breach Detected`,
        description: `${breachEvent.operationName}: ${osfiCitation} ${disclaimer}`,
        variant: severity === 'critical' ? 'destructive' : 'default',
        duration: isSmallFRFI ? 5000 : 10000, // Longer duration for large FRFIs
      });

      // Log the breach for tracking and compliance
      const breachId = await logToleranceBreach(
        breachEvent.toleranceId,
        breachEvent.operationName,
        breachEvent.actualValue,
        breachEvent.thresholdValue,
        severity,
        `${breachEvent.operationName} ${breachEvent.breachType} tolerance exceeded by ${breachEvent.variance.toFixed(1)}%`
      );

      if (breachId) {
        logger.info('Tolerance breach detected and logged', {
          component: 'ToleranceMonitoring',
          module: 'tolerance-monitoring',
          metadata: {
            breachId,
            operation: breachEvent.operationName,
            severity: severity,
            variance: breachEvent.variance.toFixed(1)
          }
        });

        // Trigger AI analysis for the breach if it's critical or high severity
        if (severity === 'critical' || severity === 'high') {
          try {
            await analyzeToleranceBreach(
              breachId,
              breachEvent.operationName,
              breachEvent.breachType,
              breachEvent.actualValue,
              breachEvent.thresholdValue,
              breachEvent.variance,
              'active'
            );
          } catch (aiError) {
            logger.error('Failed to trigger AI analysis for breach', {
              component: 'ToleranceMonitoring',
              module: 'tolerance-monitoring',
              metadata: { breachId }
            }, aiError);
          }
        }
      }

      // Call enhanced breach alert edge function
      await supabase.functions.invoke('send-tolerance-breach-alert', {
        body: {
          breachEvent,
          orgProfile,
          osfiCitation,
          disclaimer,
          proportionalityMode: isSmallFRFI ? 'small_frfi' : 'large_bank'
        }
      });

    } catch (error) {
      console.error('Error triggering breach alert:', error);
    }
  };

  const calculateBreachSeverity = (data: any, alertType: string): 'low' | 'medium' | 'high' | 'critical' => {
    const variance = calculateVariance(data);
    const isLargeFRFI = orgProfile?.employee_count && orgProfile.employee_count > 500;
    
    // Stricter thresholds for large FRFIs per proportionality
    const criticalThreshold = isLargeFRFI ? 50 : 75;
    const highThreshold = isLargeFRFI ? 25 : 50;
    
    if (variance > criticalThreshold) return 'critical';
    if (variance > highThreshold) return 'high';
    if (variance > 10) return 'medium';
    return 'low';
  };

  const calculateVariance = (data: any): number => {
    const actual = data.current_rto_minutes || data.actual_value || 0;
    const threshold = data.max_rto_hours * 60 || data.threshold_value || 1;
    return Math.round(((actual - threshold) / threshold) * 100);
  };

  // Regular updates for real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'breach': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'breach': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'offline': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRTOProgress = (current: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  const operationalCount = toleranceStatuses.filter(t => t.status === 'operational').length;
  const degradedCount = toleranceStatuses.filter(t => t.status === 'degraded').length;
  const breachCount = toleranceStatuses.filter(t => t.status === 'breach').length;
  const totalIncidents = toleranceStatuses.reduce((sum, t) => sum + t.incidentCount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Proportionality Configuration */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real-time Tolerance Monitoring</h2>
          <p className="text-muted-foreground">
            Live status of all critical operations - Last updated: {refreshTime.toLocaleTimeString()}
          </p>
          {proportionalityConfig && (
            <p className="text-sm text-blue-600 mt-1">
              {ProportionalityService.getOSFIComplianceMessage(proportionalityConfig)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {proportionalityConfig && (
            <div className="flex items-center space-x-4 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Label htmlFor="proportional-mode">Proportional Mode</Label>
                <Switch
                  id="proportional-mode"
                  checked={isProportionalMode}
                  onCheckedChange={setIsProportionalMode}
                />
              </div>
              <div className="flex flex-col text-xs">
                <span className="font-medium text-blue-800">
                  {proportionalityConfig.size.toUpperCase()} FRFI
                </span>
                <span className="text-blue-600">
                  {proportionalityConfig.thresholdSensitivity} thresholds
                </span>
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={predictPotentialBreaches}
            disabled={isAnalyzingBreach}
            className="mr-2"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Predictions
          </Button>
          <Button variant="outline" onClick={() => setRefreshTime(new Date())}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* OSFI E-21 Proportionality Configuration Panel */}
      {proportionalityConfig && isProportionalMode && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              OSFI E-21 Proportionality Configuration
            </CardTitle>
            <CardDescription>
              Tolerance thresholds adjusted for {proportionalityConfig.size} FRFI with {proportionalityConfig.employee_count} employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-800">Threshold Sensitivity</p>
                <Badge variant="outline" className="mt-1">
                  {proportionalityConfig.thresholdSensitivity}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-blue-800">Alert Frequency</p>
                <Badge variant="outline" className="mt-1">
                  {proportionalityConfig.alertFrequency}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-blue-800">Escalation Timeline</p>
                <Badge variant="outline" className="mt-1">
                  {proportionalityConfig.escalationTimeline}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-blue-800">Monitoring Depth</p>
                <Badge variant="outline" className="mt-1">
                  {proportionalityConfig.monitoringDepth}
                </Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Regulatory Note:</strong> {ProportionalityService.getRegulatoryDisclaimer()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-green-600">{operationalCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Degraded</p>
                <p className="text-2xl font-bold text-yellow-600">{degradedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Breached</p>
                <p className="text-2xl font-bold text-red-600">{breachCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold">{totalIncidents}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Cards */}
      <div className="grid gap-4">
        {toleranceStatuses.map((tolerance) => (
          <Card key={tolerance.id} className={tolerance.status === 'breach' ? 'border-red-200' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(tolerance.status)}
                    {tolerance.operationName}
                    <Badge className={getClassificationColor(tolerance.classification)}>
                      {tolerance.classification}
                    </Badge>
                    <Badge className={getStatusColor(tolerance.status)}>
                      {tolerance.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date(tolerance.lastUpdate).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-lg font-bold">{tolerance.uptime}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* RTO Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recovery Time (RTO)</span>
                    <span className="text-sm text-muted-foreground">
                      {tolerance.currentRTO}/{tolerance.maxRTO} min
                    </span>
                  </div>
                  <Progress 
                    value={getRTOProgress(tolerance.currentRTO, tolerance.maxRTO)} 
                    className={`h-2 ${tolerance.currentRTO > tolerance.maxRTO ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {tolerance.currentRTO > tolerance.maxRTO && (
                    <p className="text-xs text-red-600">⚠️ RTO tolerance exceeded</p>
                  )}
                </div>

                {/* RPO Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recovery Point (RPO)</span>
                    <span className="text-sm text-muted-foreground">
                      {tolerance.currentRPO}/{tolerance.maxRPO} min
                    </span>
                  </div>
                  <Progress 
                    value={getRTOProgress(tolerance.currentRPO, tolerance.maxRPO)} 
                    className={`h-2 ${tolerance.currentRPO > tolerance.maxRPO ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {tolerance.currentRPO > tolerance.maxRPO && (
                    <p className="text-xs text-red-600">⚠️ RPO tolerance exceeded</p>
                  )}
                </div>

                {/* Service Level Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Service Level</span>
                    <span className="text-sm text-muted-foreground">
                      {tolerance.serviceLevel.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={tolerance.serviceLevel} 
                    className={`h-2 ${tolerance.serviceLevel < tolerance.serviceThreshold ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {tolerance.serviceLevel < tolerance.serviceThreshold && (
                    <p className="text-xs text-red-600">⚠️ Below service threshold ({tolerance.serviceThreshold}%)</p>
                  )}
                </div>
              </div>

              {tolerance.incidentCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">
                      {tolerance.incidentCount} active incident{tolerance.incidentCount > 1 ? 's' : ''}
                    </span>
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

export default ToleranceMonitoring;
