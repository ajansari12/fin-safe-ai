
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, Users, FileText, CheckCircle, Bell, Phone, Mail, Shield, Brain, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

interface ToleranceBreach {
  id: string;
  operationName: string;
  breachType: 'rto' | 'rpo' | 'service_level' | 'multiple';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved';
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  currentImpact: string;
  estimatedDuration: number;
  responseTeam: string[];
  escalationLevel: number;
  actionsTaken: string[];
  nextActions: string[];
  osfiPrinciples?: string[];
  aiAnalysis?: {
    severityAssessment: string;
    recommendations: string[];
    escalationRequired: boolean;
    estimatedRecoveryTime: number;
  };
  breachLogId?: string;
}

interface ResponseTeam {
  id: string;
  name: string;
  role: string;
  contact: string;
  escalationOrder: number;
}

const BreachManagement = () => {
  const { profile } = useAuth();
  const { addUserMessage, setCurrentModule } = useEnhancedAIAssistant();
  const { toast } = useToast();
  
  const [activeBreaches, setActiveBreaches] = useState<ToleranceBreach[]>([]);
  const [selectedBreach, setSelectedBreach] = useState<ToleranceBreach | null>(null);
  const [newAction, setNewAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const [responseTeams] = useState<ResponseTeam[]>([
    { id: 'ops-manager', name: 'Sarah Johnson', role: 'Operations Manager', contact: '+1-416-555-0101', escalationOrder: 1 },
    { id: 'tech-lead', name: 'Michael Chen', role: 'Technical Lead', contact: '+1-416-555-0102', escalationOrder: 2 },
    { id: 'comms-lead', name: 'Emma Wilson', role: 'Communications Lead', contact: '+1-416-555-0103', escalationOrder: 3 },
    { id: 'exec-director', name: 'Robert Taylor', role: 'Executive Director', contact: '+1-416-555-0104', escalationOrder: 4 }
  ]);

  // Set module context for AI assistant
  useEffect(() => {
    setCurrentModule('breach-management');
  }, [setCurrentModule]);

  // Real-time subscription to appetite breach logs
  const { isConnected } = useRealtimeSubscription({
    table: 'appetite_breach_logs',
    event: '*',
    onInsert: (payload) => handleNewBreach(payload.new),
    onUpdate: (payload) => handleBreachUpdate(payload.new),
    enabled: !!profile?.organization_id
  });

  // Load breach data on component mount
  useEffect(() => {
    if (profile?.organization_id) {
      loadBreachData();
    }
  }, [profile?.organization_id]);

  const loadBreachData = async () => {
    if (!profile?.organization_id) return;

    setLoading(true);
    try {
      const { data: breachLogs, error } = await supabase
        .from('appetite_breach_logs')
        .select(`
          *,
          risk_categories(name),
          risk_appetite_statements(title)
        `)
        .eq('org_id', profile.organization_id)
        .neq('resolution_status', 'resolved')
        .order('breach_date', { ascending: false });

      if (error) throw error;

      // Transform breach logs to tolerance breaches
      const transformedBreaches: ToleranceBreach[] = (breachLogs || []).map(log => ({
        id: log.id,
        operationName: log.risk_categories?.name || 'Unknown Operation',
        breachType: determineBreachType(log),
        severity: log.breach_severity as any,
        status: mapResolutionStatus(log.resolution_status),
        detectedAt: log.breach_date,
        acknowledgedAt: log.escalated_at || undefined,
        currentImpact: log.business_impact || 'Impact assessment pending',
        estimatedDuration: calculateEstimatedDuration(log),
        responseTeam: ['ops-manager'], // Default team
        escalationLevel: log.escalation_level || 1,
        actionsTaken: log.remediation_actions ? [log.remediation_actions] : [],
        nextActions: generateNextActions(log),
        osfiPrinciples: ['7'], // Principle 7 for tolerance breaches
        breachLogId: log.id
      }));

      setActiveBreaches(transformedBreaches);
    } catch (error) {
      console.error('Error loading breach data:', error);
      // Fallback to demo data
      setActiveBreaches([
        {
          id: '1',
          operationName: 'ATM Network',
          breachType: 'multiple',
          severity: 'critical',
          status: 'in_progress',
          detectedAt: new Date().toISOString(),
          acknowledgedAt: new Date().toISOString(),
          currentImpact: 'ATM services unavailable in Metro region, affecting 150,000+ customers',
          estimatedDuration: 240,
          responseTeam: ['ops-manager', 'tech-lead', 'comms-lead'],
          escalationLevel: 2,
          actionsTaken: [
            'Incident response team activated per OSFI E-21 Principle 5',
            'Backup systems engaged',
            'Customer communications initiated',
            'Vendor support engaged'
          ],
          nextActions: [
            'Complete network diagnostics',
            'Implement temporary workaround',
            'Prepare detailed impact assessment for board per Principle 1'
          ],
          osfiPrinciples: ['1', '5', '7']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for data transformation
  const determineBreachType = (log: any): 'rto' | 'rpo' | 'service_level' | 'multiple' => {
    if (log.business_impact?.toLowerCase().includes('rto')) return 'rto';
    if (log.business_impact?.toLowerCase().includes('rpo')) return 'rpo';
    return 'service_level';
  };

  const mapResolutionStatus = (status: string): 'active' | 'acknowledged' | 'in_progress' | 'resolved' => {
    switch (status) {
      case 'open': return 'active';
      case 'investigating': return 'acknowledged';
      case 'remediating': return 'in_progress';
      case 'resolved': return 'resolved';
      default: return 'active';
    }
  };

  const calculateEstimatedDuration = (log: any): number => {
    // Calculate based on severity and variance
    const baseTime = log.breach_severity === 'critical' ? 480 : 
                    log.breach_severity === 'high' ? 240 : 120;
    const variance = log.variance_percentage || 0;
    return Math.round(baseTime * (1 + variance / 100));
  };

  const generateNextActions = (log: any): string[] => {
    const actions = [];
    
    if (log.breach_severity === 'critical') {
      actions.push('Escalate to board immediately per OSFI E-21 Principle 1');
      actions.push('Activate crisis management procedures');
    }
    
    actions.push('Complete root cause analysis per Principle 6');
    actions.push('Update tolerance thresholds if necessary per Principle 7');
    
    if (!log.remediation_actions) {
      actions.push('Develop remediation plan');
    }
    
    return actions;
  };

  // Real-time event handlers
  const handleNewBreach = async (newBreach: any) => {
    // Transform and add to active breaches
    const transformedBreach: ToleranceBreach = {
      id: newBreach.id,
      operationName: newBreach.business_impact || 'New Breach',
      breachType: determineBreachType(newBreach),
      severity: newBreach.breach_severity,
      status: 'active',
      detectedAt: newBreach.breach_date,
      currentImpact: newBreach.business_impact || 'Impact assessment required',
      estimatedDuration: calculateEstimatedDuration(newBreach),
      responseTeam: ['ops-manager'],
      escalationLevel: 1,
      actionsTaken: [],
      nextActions: generateNextActions(newBreach),
      osfiPrinciples: ['7'],
      breachLogId: newBreach.id
    };

    setActiveBreaches(prev => [transformedBreach, ...prev]);

  // Auto-trigger AI analysis for new breaches
    setTimeout(() => performAIAnalysis(transformedBreach), 1000); // Slight delay to ensure state is updated

    toast({
      title: "New Tolerance Breach Detected",
      description: `${transformedBreach.severity.toUpperCase()} breach in ${transformedBreach.operationName}. Per OSFI E-21 Principle 7, immediate assessment required.`,
      variant: transformedBreach.severity === 'critical' ? 'destructive' : 'default',
    });
  };

  const handleBreachUpdate = (updatedBreach: any) => {
    setActiveBreaches(prev => prev.map(breach => 
      breach.breachLogId === updatedBreach.id 
        ? {
            ...breach,
            status: mapResolutionStatus(updatedBreach.resolution_status),
            escalationLevel: updatedBreach.escalation_level || breach.escalationLevel,
            actionsTaken: updatedBreach.remediation_actions 
              ? [...breach.actionsTaken, updatedBreach.remediation_actions]
              : breach.actionsTaken
          }
        : breach
    ));
  };

  // AI-powered breach analysis using enhanced capabilities
  const performAIAnalysis = async (breach: ToleranceBreach) => {
    setAiAnalyzing(true);
    try {
      // Calculate variance from breach data
      const variance = breach.breachLogId ? 
        await calculateVarianceFromBreachLog(breach.breachLogId) : 
        calculateEstimatedVariance(breach.severity);
      
      // Use the enhanced AI assistant for comprehensive analysis
      const { analyzeToleranceBreach } = useEnhancedAIAssistant();
      
      await analyzeToleranceBreach(
        breach.id,
        breach.operationName,
        breach.breachType,
        100, // actual value - would be calculated from real data
        80,  // threshold value - would be fetched from tolerance definitions
        variance,
        breach.status
      );
      
      // Update the breach with AI analysis results
      setActiveBreaches(prev => prev.map(b => 
        b.id === breach.id 
          ? { ...b, aiAnalysis: { 
              severityAssessment: `AI-enhanced severity analysis completed`,
              recommendations: ['Comprehensive AI analysis available in assistant'],
              escalationRequired: breach.severity === 'critical',
              estimatedRecoveryTime: breach.estimatedDuration
            }}
          : b
      ));

      toast({
        title: "AI Analysis Complete",
        description: "Comprehensive breach analysis available in AI Assistant",
        variant: "default",
      });
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      toast({
        title: "AI Analysis Error",
        description: "Unable to complete AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Helper functions for AI analysis integration
  const calculateVarianceFromBreachLog = async (breachLogId: string): Promise<number> => {
    try {
      const { data } = await supabase
        .from('appetite_breach_logs')
        .select('variance_percentage')
        .eq('id', breachLogId)
        .single();
      
      return data?.variance_percentage || 50;
    } catch (error) {
      return 50; // Default variance
    }
  };

  const calculateEstimatedVariance = (severity: string): number => {
    switch (severity) {
      case 'critical': return 100;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
      default: return 50;
    }
  };

  // Enhanced impact assessment using AI
  const performImpactAssessment = async (breach: ToleranceBreach) => {
    try {
      const { assessBreachImpact } = useEnhancedAIAssistant();
      
      await assessBreachImpact(
        breach.id,
        breach.estimatedDuration,
        240 // threshold - would be fetched from actual tolerance definitions
      );

      toast({
        title: "Impact Assessment Complete",
        description: "Detailed impact analysis available in AI Assistant",
        variant: "default",
      });
    } catch (error) {
      console.error('Error performing impact assessment:', error);
      toast({
        title: "Assessment Error",
        description: "Unable to complete impact assessment",
        variant: "destructive",
      });
    }
  };

  // Predictive analysis trigger
  const performPredictiveAnalysis = async () => {
    try {
      const { predictPotentialBreaches } = useEnhancedAIAssistant();
      await predictPotentialBreaches();

      toast({
        title: "Predictive Analysis Complete",
        description: "Potential breach predictions available in AI Assistant",
        variant: "default",
      });
    } catch (error) {
      console.error('Error performing predictive analysis:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBreachTypeLabel = (type: string) => {
    switch (type) {
      case 'rto': return 'RTO Breach';
      case 'rpo': return 'RPO Breach';
      case 'service_level': return 'Service Level Breach';
      case 'multiple': return 'Multiple Breaches';
      default: return type;
    }
  };

  const handleStatusUpdate = (breachId: string, newStatus: string) => {
    setActiveBreaches(prev => prev.map(breach => 
      breach.id === breachId 
        ? { 
            ...breach, 
            status: newStatus as any,
            acknowledgedAt: newStatus === 'acknowledged' ? new Date().toISOString() : breach.acknowledgedAt,
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : breach.resolvedAt
          }
        : breach
    ));
    
    toast({
      title: "Status Updated",
      description: `Breach status updated to ${newStatus}`
    });
  };

  const handleAddAction = (breachId: string) => {
    if (!newAction.trim()) return;
    
    setActiveBreaches(prev => prev.map(breach => 
      breach.id === breachId 
        ? { ...breach, actionsTaken: [...breach.actionsTaken, newAction] }
        : breach
    ));
    
    setNewAction('');
    toast({
      title: "Action Added",
      description: "Response action has been logged"
    });
  };

  const handleEscalate = (breachId: string) => {
    setActiveBreaches(prev => prev.map(breach => 
      breach.id === breachId 
        ? { ...breach, escalationLevel: breach.escalationLevel + 1 }
        : breach
    ));
    
    toast({
      title: "Breach Escalated",
      description: "Tolerance breach has been escalated to next level"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Breach Management</h2>
        <p className="text-muted-foreground">
          Manage tolerance breaches with automated workflows and escalation procedures
        </p>
      </div>

      <Tabs defaultValue="active-breaches" className="w-full">
        <TabsList>
          <TabsTrigger value="active-breaches">Active Breaches</TabsTrigger>
          <TabsTrigger value="response-teams">Response Teams</TabsTrigger>
          <TabsTrigger value="action-templates">Action Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active-breaches" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Tolerance Breaches</h3>
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={performPredictiveAnalysis}
                className="mr-2"
              >
                <Brain className="h-4 w-4 mr-1" />
                Predict Future Breaches
              </Button>
              <Badge variant="outline" className="text-red-600">
                {activeBreaches.filter(b => b.status !== 'resolved').length} Active
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            {activeBreaches.map((breach) => (
              <Card key={breach.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        {breach.operationName}
                        <Badge className={getSeverityColor(breach.severity)}>
                          {breach.severity}
                        </Badge>
                        <Badge className={getStatusColor(breach.status)}>
                          {breach.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {getBreachTypeLabel(breach.breachType)} • Detected: {new Date(breach.detectedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Select value={breach.status} onValueChange={(value) => handleStatusUpdate(breach.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => handleEscalate(breach.id)}>
                        <Bell className="h-4 w-4 mr-1" />
                        Escalate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => performAIAnalysis(breach)}
                        disabled={aiAnalyzing}
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        {aiAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => performImpactAssessment(breach)}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Impact Assessment
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Current Impact</h4>
                      <p className="text-sm text-muted-foreground">{breach.currentImpact}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Estimated Duration</p>
                          <p className="text-sm text-muted-foreground">{breach.estimatedDuration} minutes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm font-medium">Escalation Level</p>
                          <p className="text-sm text-muted-foreground">Level {breach.escalationLevel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Response Team</p>
                          <p className="text-sm text-muted-foreground">{breach.responseTeam.length} members</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Actions Taken</h4>
                      <ul className="space-y-1">
                        {breach.actionsTaken.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Next Actions</h4>
                      <ul className="space-y-1">
                        {breach.nextActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new action..."
                        value={newAction}
                        onChange={(e) => setNewAction(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAction(breach.id)}
                      />
                      <Button onClick={() => handleAddAction(breach.id)}>
                        Add Action
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="response-teams" className="space-y-4">
          <h3 className="text-lg font-semibold">Response Teams</h3>
          <div className="grid gap-4">
            {responseTeams.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{member.contact}</span>
                        </div>
                        <Badge variant="outline">
                          Escalation Level {member.escalationOrder}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="action-templates" className="space-y-4">
          <h3 className="text-lg font-semibold">Action Plan Templates</h3>
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>RTO Breach Response</CardTitle>
                <CardDescription>Standard response plan for Recovery Time Objective breaches</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Activate incident response team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Engage backup systems and procedures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Notify stakeholders and customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Implement temporary workarounds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Document impact and recovery actions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Level Breach Response</CardTitle>
                <CardDescription>Response plan for service level degradation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Increase monitoring frequency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Perform system diagnostics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Apply performance optimizations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Scale resources if needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">Monitor recovery progress</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BreachManagement;
