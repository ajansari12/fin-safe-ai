
import { supabase } from "@/integrations/supabase/client";

export interface PredictiveAnalytics {
  kri_forecast: {
    metric: string;
    current_value: number;
    predicted_30_days: number;
    predicted_90_days: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  }[];
  incident_forecast: {
    category: string;
    current_monthly: number;
    predicted_next_month: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
  }[];
  risk_score_prediction: number;
}

export interface RiskHeatmap {
  department: string;
  risk_categories: {
    operational: number;
    cyber: number;
    vendor: number;
    compliance: number;
    financial: number;
  };
  overall_score: number;
}

export interface ComplianceScorecard {
  overall_score: number;
  categories: {
    governance: { score: number; status: string; last_updated: string };
    risk_management: { score: number; status: string; last_updated: string };
    incident_response: { score: number; status: string; last_updated: string };
    vendor_management: { score: number; status: string; last_updated: string };
    business_continuity: { score: number; status: string; last_updated: string };
  };
  trending: 'up' | 'down' | 'stable';
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap';
  title: string;
  data_source: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
  role_visibility: string[];
}

export async function getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return { kri_forecast: [], incident_forecast: [], risk_score_prediction: 0 };
    }

    // Get KRI trends for forecasting
    const { data: kriLogs } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner(
          name,
          threshold_id,
          risk_thresholds!inner(
            statement_id,
            risk_appetite_statements!inner(org_id)
          )
        )
      `)
      .eq('kri_definitions.risk_thresholds.risk_appetite_statements.org_id', profile.organization_id)
      .gte('measurement_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('measurement_date', { ascending: true });

    // Get incident trends
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('reported_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('reported_at', { ascending: true });

    // Calculate KRI forecasts using simple trend analysis
    const kriForecasts = calculateKRIForecasts(kriLogs || []);
    const incidentForecasts = calculateIncidentForecasts(incidents || []);
    const riskScore = calculateOverallRiskScore(kriLogs || [], incidents || []);

    return {
      kri_forecast: kriForecasts,
      incident_forecast: incidentForecasts,
      risk_score_prediction: riskScore
    };
  } catch (error) {
    console.error('Error fetching predictive analytics:', error);
    return { kri_forecast: [], incident_forecast: [], risk_score_prediction: 0 };
  }
}

export async function getRiskHeatmapData(): Promise<RiskHeatmap[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    // Get business functions as departments
    const { data: functions } = await supabase
      .from('business_functions')
      .select('*')
      .eq('org_id', profile.organization_id);

    // Get recent incidents by function
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Get dependency risks
    const { data: dependencyRisks } = await supabase
      .from('dependency_risks')
      .select(`
        *,
        dependencies!inner(business_function_id, business_functions!inner(name))
      `)
      .eq('org_id', profile.organization_id);

    return generateRiskHeatmap(functions || [], incidents || [], dependencyRisks || []);
  } catch (error) {
    console.error('Error fetching risk heatmap data:', error);
    return [];
  }
}

export async function getComplianceScorecard(): Promise<ComplianceScorecard> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultScorecard();
    }

    // Get governance data
    const { data: policies } = await supabase
      .from('governance_policies')
      .select(`
        *,
        governance_frameworks!inner(org_id)
      `)
      .eq('governance_frameworks.org_id', profile.organization_id);

    // Get audit findings
    const { data: findings } = await supabase
      .from('compliance_findings')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    // Get incidents for response scoring
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('reported_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    // Get vendor data
    const { data: vendors } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('org_id', profile.organization_id);

    // Get continuity plans
    const { data: continuityPlans } = await supabase
      .from('continuity_plans')
      .select('*')
      .eq('org_id', profile.organization_id);

    return calculateComplianceScores(policies || [], findings || [], incidents || [], vendors || [], continuityPlans || []);
  } catch (error) {
    console.error('Error fetching compliance scorecard:', error);
    return getDefaultScorecard();
  }
}

export async function getDashboardWidgets(userRole: string): Promise<DashboardWidget[]> {
  try {
    // For now, return default widgets based on role
    return getDefaultWidgetsByRole(userRole);
  } catch (error) {
    console.error('Error fetching dashboard widgets:', error);
    return [];
  }
}

// Helper functions
function calculateKRIForecasts(kriLogs: any[]): PredictiveAnalytics['kri_forecast'] {
  if (!Array.isArray(kriLogs) || kriLogs.length === 0) {
    return [];
  }

  const groupedByKRI = kriLogs.reduce((acc, log) => {
    const kriName = log.kri_definitions?.name || 'Unknown KRI';
    if (!acc[kriName]) acc[kriName] = [];
    acc[kriName].push(log);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(groupedByKRI).map(([kriName, logs]) => {
    const values = logs.map(log => log.actual_value).sort((a, b) => a - b);
    const current = values[values.length - 1] || 0;
    
    // Simple moving average prediction
    const trend = calculateTrend(values);
    const predicted30 = current + (trend * 30);
    const predicted90 = current + (trend * 90);

    return {
      metric: kriName,
      current_value: current,
      predicted_30_days: Math.max(0, predicted30),
      predicted_90_days: Math.max(0, predicted90),
      trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      confidence: Math.min(0.9, values.length / 10) // Higher confidence with more data points
    };
  });
}

function calculateIncidentForecasts(incidents: any[]): PredictiveAnalytics['incident_forecast'] {
  if (!Array.isArray(incidents) || incidents.length === 0) {
    return [];
  }

  const groupedByCategory = incidents.reduce((acc, incident) => {
    const category = incident.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(incident);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(groupedByCategory).map(([category, categoryIncidents]) => {
    const monthlyCount = categoryIncidents.length;
    const criticalCount = categoryIncidents.filter(i => i.severity === 'critical').length;
    
    // Simple prediction based on recent trend
    const predicted = Math.ceil(monthlyCount * 1.1); // Slight increase assumption
    
    return {
      category,
      current_monthly: monthlyCount,
      predicted_next_month: predicted,
      risk_level: criticalCount > 2 ? 'critical' : monthlyCount > 5 ? 'high' : monthlyCount > 2 ? 'medium' : 'low'
    };
  });
}

function calculateOverallRiskScore(kriLogs: any[], incidents: any[]): number {
  const kriBreaches = Array.isArray(kriLogs) ? kriLogs.filter(log => log.threshold_breached && log.threshold_breached !== 'none').length : 0;
  const criticalIncidents = Array.isArray(incidents) ? incidents.filter(i => i.severity === 'critical').length : 0;
  const totalIncidents = Array.isArray(incidents) ? incidents.length : 0;
  
  // Risk score out of 100 (higher = more risk)
  const kriScore = Math.min(50, kriBreaches * 10);
  const incidentScore = Math.min(30, totalIncidents * 2);
  const criticalScore = Math.min(20, criticalIncidents * 5);
  
  return Math.min(100, kriScore + incidentScore + criticalScore);
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, idx) => sum + (idx * val), 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

function generateRiskHeatmap(functions: any[], incidents: any[], dependencyRisks: any[]): RiskHeatmap[] {
  if (!Array.isArray(functions) || functions.length === 0) {
    return [];
  }

  return functions.map(func => {
    const functionIncidents = Array.isArray(incidents) ? incidents.filter(i => i.business_function_id === func.id) : [];
    const functionRisks = Array.isArray(dependencyRisks) ? dependencyRisks.filter(r => 
      r.dependencies?.business_function_id === func.id
    ) : [];

    // Calculate risk scores for each category
    const operational = Math.min(100, functionIncidents.length * 15 + functionRisks.length * 10);
    const cyber = Math.min(100, functionIncidents.filter(i => i.category === 'cyber').length * 25);
    const vendor = Math.min(100, functionRisks.filter(r => r.dependencies?.dependency_type === 'vendor').length * 20);
    const compliance = Math.min(100, functionIncidents.filter(i => i.category === 'compliance').length * 30);
    const financial = Math.min(100, functionIncidents.filter(i => i.impact_rating >= 4).length * 20);

    return {
      department: func.name,
      risk_categories: {
        operational,
        cyber,
        vendor,
        compliance,
        financial
      },
      overall_score: Math.round((operational + cyber + vendor + compliance + financial) / 5)
    };
  });
}

function calculateComplianceScores(policies: any[], findings: any[], incidents: any[], vendors: any[], continuityPlans: any[]): ComplianceScorecard {
  const activePolicies = Array.isArray(policies) ? policies.filter(p => p.status === 'active').length : 0;
  const totalPolicies = Array.isArray(policies) ? policies.length : 0;
  const governanceScore = totalPolicies > 0 ? Math.round((activePolicies / totalPolicies) * 100) : 0;

  const openFindings = Array.isArray(findings) ? findings.filter(f => f.status === 'open').length : 0;
  const totalFindings = Array.isArray(findings) ? findings.length : 0;
  const riskScore = totalFindings > 0 ? Math.round(((totalFindings - openFindings) / totalFindings) * 100) : 100;

  const resolvedIncidents = Array.isArray(incidents) ? incidents.filter(i => i.status === 'resolved').length : 0;
  const totalIncidents = Array.isArray(incidents) ? incidents.length : 0;
  const incidentScore = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 100;

  const assessedVendors = Array.isArray(vendors) ? vendors.filter(v => v.last_assessment_date).length : 0;
  const totalVendors = Array.isArray(vendors) ? vendors.length : 0;
  const vendorScore = totalVendors > 0 ? Math.round((assessedVendors / totalVendors) * 100) : 0;

  const activePlans = Array.isArray(continuityPlans) ? continuityPlans.filter(p => p.status === 'active').length : 0;
  const totalPlans = Array.isArray(continuityPlans) ? continuityPlans.length : 0;
  const continuityScore = totalPlans > 0 ? Math.round((activePlans / totalPlans) * 100) : 0;

  const overall = Math.round((governanceScore + riskScore + incidentScore + vendorScore + continuityScore) / 5);

  return {
    overall_score: overall,
    categories: {
      governance: { score: governanceScore, status: governanceScore >= 80 ? 'good' : governanceScore >= 60 ? 'fair' : 'poor', last_updated: new Date().toISOString().split('T')[0] },
      risk_management: { score: riskScore, status: riskScore >= 80 ? 'good' : riskScore >= 60 ? 'fair' : 'poor', last_updated: new Date().toISOString().split('T')[0] },
      incident_response: { score: incidentScore, status: incidentScore >= 80 ? 'good' : incidentScore >= 60 ? 'fair' : 'poor', last_updated: new Date().toISOString().split('T')[0] },
      vendor_management: { score: vendorScore, status: vendorScore >= 80 ? 'good' : vendorScore >= 60 ? 'fair' : 'poor', last_updated: new Date().toISOString().split('T')[0] },
      business_continuity: { score: continuityScore, status: continuityScore >= 80 ? 'good' : continuityScore >= 60 ? 'fair' : 'poor', last_updated: new Date().toISOString().split('T')[0] }
    },
    trending: overall >= 75 ? 'up' : overall >= 50 ? 'stable' : 'down'
  };
}

function getDefaultScorecard(): ComplianceScorecard {
  return {
    overall_score: 0,
    categories: {
      governance: { score: 0, status: 'poor', last_updated: new Date().toISOString().split('T')[0] },
      risk_management: { score: 0, status: 'poor', last_updated: new Date().toISOString().split('T')[0] },
      incident_response: { score: 0, status: 'poor', last_updated: new Date().toISOString().split('T')[0] },
      vendor_management: { score: 0, status: 'poor', last_updated: new Date().toISOString().split('T')[0] },
      business_continuity: { score: 0, status: 'poor', last_updated: new Date().toISOString().split('T')[0] }
    },
    trending: 'stable'
  };
}

function getDefaultWidgetsByRole(role: string): DashboardWidget[] {
  const adminWidgets: DashboardWidget[] = [
    {
      id: 'risk-overview',
      type: 'chart',
      title: 'Risk Overview',
      data_source: 'predictive_analytics',
      config: { chart_type: 'line', metrics: ['risk_score'] },
      position: { x: 0, y: 0, w: 6, h: 4 },
      role_visibility: ['admin', 'manager']
    },
    {
      id: 'compliance-scorecard',
      type: 'metric',
      title: 'Compliance Score',
      data_source: 'compliance_scorecard',
      config: { display_type: 'gauge' },
      position: { x: 6, y: 0, w: 3, h: 4 },
      role_visibility: ['admin', 'manager']
    },
    {
      id: 'risk-heatmap',
      type: 'heatmap',
      title: 'Department Risk Heatmap',
      data_source: 'risk_heatmap',
      config: { color_scheme: 'red_yellow_green' },
      position: { x: 9, y: 0, w: 3, h: 4 },
      role_visibility: ['admin', 'manager']
    }
  ];

  const analystWidgets: DashboardWidget[] = [
    {
      id: 'incident-trends',
      type: 'chart',
      title: 'Incident Trends',
      data_source: 'incident_forecast',
      config: { chart_type: 'bar', time_period: '30d' },
      position: { x: 0, y: 0, w: 6, h: 4 },
      role_visibility: ['admin', 'manager', 'analyst']
    },
    {
      id: 'kri-status',
      type: 'table',
      title: 'KRI Status',
      data_source: 'kri_forecast',
      config: { columns: ['metric', 'current_value', 'trend'] },
      position: { x: 6, y: 0, w: 6, h: 4 },
      role_visibility: ['admin', 'manager', 'analyst']
    }
  ];

  return role === 'admin' ? adminWidgets : analystWidgets;
}
