import { supabase } from "@/integrations/supabase/client";
import { cachedFetch } from "@/lib/performance-utils";

export interface ExecutiveKPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  status: 'good' | 'improving' | 'attention' | 'critical';
  iconName: string;
}

export interface RiskTrendData {
  month: string;
  score: number;
  incidents: number;
  controls: number;
}

export interface RiskDistribution {
  name: string;
  value: number;
  color: string;
}

export interface BusinessImpact {
  department: string;
  high: number;
  medium: number;
  low: number;
}

export async function getExecutiveKPIs(): Promise<ExecutiveKPI[]> {
  return cachedFetch('executive_kpis', async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.organization_id) {
        return getDefaultKPIs();
      }

      // Get incident data
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', profile.organization_id);

      // Get control data
      const { data: controls } = await supabase
        .from('controls')
        .select('*')
        .eq('org_id', profile.organization_id);

      // Get vendor data
      const { data: vendors } = await supabase
        .from('third_party_profiles')
        .select('*')
        .eq('org_id', profile.organization_id);

      // Calculate metrics
      const criticalIncidents = incidents?.filter(i => 
        i.severity === 'critical' && i.status !== 'resolved'
      ).length || 0;

      const activeControls = controls?.filter(c => c.status === 'active').length || 0;
      const totalControls = controls?.length || 1;
      const controlEffectiveness = Math.round((activeControls / totalControls) * 100);

      const highRiskVendors = vendors?.filter(v => v.risk_rating === 'high').length || 0;
      const vendorRiskExposure = highRiskVendors * 0.8; // Simplified calculation

      // Calculate overall risk score based on incidents, controls, and vendors
      const riskScore = calculateOverallRiskScore(criticalIncidents, controlEffectiveness, highRiskVendors);

      return [
        {
          title: 'Overall Risk Score',
          value: riskScore.toFixed(1),
          change: riskScore < 7.5 ? '-0.3' : '+0.2',
          trend: riskScore < 7.5 ? 'down' : 'up',
          status: riskScore < 6 ? 'good' : riskScore < 8 ? 'improving' : 'attention',
          iconName: 'Shield'
        },
        {
          title: 'Operational Resilience',
          value: `${controlEffectiveness}%`,
          change: controlEffectiveness > 85 ? '+2%' : '-1%',
          trend: controlEffectiveness > 85 ? 'up' : 'down',
          status: controlEffectiveness > 90 ? 'good' : controlEffectiveness > 80 ? 'improving' : 'attention',
          iconName: 'Activity'
        },
        {
          title: 'Critical Incidents',
          value: criticalIncidents.toString(),
          change: criticalIncidents < 3 ? '-2' : '+1',
          trend: criticalIncidents < 3 ? 'down' : 'up',
          status: criticalIncidents < 3 ? 'improving' : 'attention',
          iconName: 'AlertTriangle'
        },
        {
          title: 'Vendor Risk Exposure',
          value: `$${vendorRiskExposure.toFixed(1)}M`,
          change: vendorRiskExposure < 2 ? '-$0.1M' : '+$0.1M',
          trend: vendorRiskExposure < 2 ? 'down' : 'up',
          status: vendorRiskExposure < 2 ? 'good' : vendorRiskExposure < 3 ? 'attention' : 'critical',
          iconName: 'DollarSign'
        }
      ];
    } catch (error) {
      console.error('Error fetching executive KPIs:', error);
      return getDefaultKPIs();
    }
  }, 2 * 60 * 1000); // Cache for 2 minutes
}

export async function getRiskTrendData(): Promise<RiskTrendData[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultRiskTrend();
    }

    // Get data for the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        date: date,
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year: date.getFullYear()
      });
    }

    const trendData = await Promise.all(
      months.map(async (month) => {
        const startOfMonth = new Date(month.year, month.date.getMonth(), 1);
        const endOfMonth = new Date(month.year, month.date.getMonth() + 1, 0);

        // Get incidents for this month
        const { data: monthIncidents } = await supabase
          .from('incident_logs')
          .select('*')
          .eq('org_id', profile.organization_id)
          .gte('reported_at', startOfMonth.toISOString())
          .lte('reported_at', endOfMonth.toISOString());

        // Get control tests for this month
        const { data: controlTests } = await supabase
          .from('control_tests')
          .select('*')
          .eq('org_id', profile.organization_id)
          .gte('test_date', startOfMonth.toISOString().split('T')[0])
          .lte('test_date', endOfMonth.toISOString().split('T')[0]);

        const incidents = monthIncidents?.filter(i => i.severity === 'critical').length || 0;
        const avgControlScore = controlTests?.reduce((sum, test) => sum + (test.effectiveness_rating || 0), 0) / 
                               Math.max(controlTests?.length || 1, 1);
        
        // Calculate risk score based on incidents and control effectiveness
        const riskScore = Math.max(1, Math.min(10, 10 - (avgControlScore / 10) + (incidents * 0.5)));

        return {
          month: month.month,
          score: Number(riskScore.toFixed(1)),
          incidents: incidents,
          controls: Math.round(avgControlScore || 85)
        };
      })
    );

    return trendData;
  } catch (error) {
    console.error('Error fetching risk trend data:', error);
    return getDefaultRiskTrend();
  }
}

export async function getRiskDistribution(): Promise<RiskDistribution[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultRiskDistribution();
    }

    // Get incidents by category/type
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('category')
      .eq('org_id', profile.organization_id);

    // Count incidents by category
    const categoryCount = incidents?.reduce((acc, incident) => {
      const category = incident.category || 'operational';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0) || 1;

    const distribution = [
      { name: 'Operational', value: Math.round(((categoryCount.operational || 0) / total) * 100), color: '#8884d8' },
      { name: 'Cyber', value: Math.round(((categoryCount.cyber || 0) / total) * 100), color: '#82ca9d' },
      { name: 'Third Party', value: Math.round(((categoryCount.third_party || 0) / total) * 100), color: '#ffc658' },
      { name: 'Compliance', value: Math.round(((categoryCount.compliance || 0) / total) * 100), color: '#ff7300' },
      { name: 'Strategic', value: Math.round(((categoryCount.strategic || 0) / total) * 100), color: '#00ff88' }
    ];

    // Ensure total adds up to 100
    const currentTotal = distribution.reduce((sum, item) => sum + item.value, 0);
    if (currentTotal === 0) {
      return getDefaultRiskDistribution();
    }

    // Adjust largest category to make total 100
    const largest = distribution.reduce((max, item) => item.value > max.value ? item : max);
    largest.value += 100 - currentTotal;

    return distribution;
  } catch (error) {
    console.error('Error fetching risk distribution:', error);
    return getDefaultRiskDistribution();
  }
}

export async function getBusinessImpact(): Promise<BusinessImpact[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultBusinessImpact();
    }

    // Get business functions and their risk assessments
    const { data: businessFunctions } = await supabase
      .from('business_functions')
      .select('function_name, criticality')
      .eq('org_id', profile.organization_id);

    if (!businessFunctions || businessFunctions.length === 0) {
      return getDefaultBusinessImpact();
    }

    // Group by department-like categories
    const departmentMap: Record<string, { high: number; medium: number; low: number }> = {};

    businessFunctions.forEach(func => {
      const department = categorizeFunctionToDepartment(func.function_name);
      if (!departmentMap[department]) {
        departmentMap[department] = { high: 0, medium: 0, low: 0 };
      }

      switch (func.criticality) {
        case 'critical':
        case 'high':
          departmentMap[department].high++;
          break;
        case 'medium':
          departmentMap[department].medium++;
          break;
        default:
          departmentMap[department].low++;
          break;
      }
    });

    return Object.entries(departmentMap).map(([department, impact]) => ({
      department,
      ...impact
    }));
  } catch (error) {
    console.error('Error fetching business impact:', error);
    return getDefaultBusinessImpact();
  }
}

// Helper functions
function calculateOverallRiskScore(incidents: number, controlEffectiveness: number, highRiskVendors: number): number {
  const incidentScore = Math.min(incidents * 0.5, 3);
  const controlScore = Math.max(0, (100 - controlEffectiveness) / 20);
  const vendorScore = Math.min(highRiskVendors * 0.3, 2);
  
  return Math.min(10, Math.max(1, 5 + incidentScore + controlScore + vendorScore));
}

function categorizeFunctionToDepartment(functionName: string): string {
  const lowerName = functionName.toLowerCase();
  
  if (lowerName.includes('trading') || lowerName.includes('market')) return 'Trading';
  if (lowerName.includes('lending') || lowerName.includes('credit') || lowerName.includes('loan')) return 'Lending';
  if (lowerName.includes('technology') || lowerName.includes('it') || lowerName.includes('system')) return 'Technology';
  if (lowerName.includes('compliance') || lowerName.includes('regulatory') || lowerName.includes('audit')) return 'Compliance';
  
  return 'Operations';
}

// Default data fallbacks
function getDefaultKPIs(): ExecutiveKPI[] {
  return [
    {
      title: 'Overall Risk Score',
      value: '7.2',
      change: '-0.3',
      trend: 'down',
      status: 'improving',
      iconName: 'Shield'
    },
    {
      title: 'Operational Resilience',
      value: '92%',
      change: '+2%',
      trend: 'up',
      status: 'good',
      iconName: 'Activity'
    },
    {
      title: 'Critical Incidents',
      value: '3',
      change: '-2',
      trend: 'down',
      status: 'improving',
      iconName: 'AlertTriangle'
    },
    {
      title: 'Vendor Risk Exposure',
      value: '$2.4M',
      change: '+$0.1M',
      trend: 'up',
      status: 'attention',
      iconName: 'DollarSign'
    }
  ];
}

function getDefaultRiskTrend(): RiskTrendData[] {
  return [
    { month: 'Jan', score: 8.1, incidents: 5, controls: 85 },
    { month: 'Feb', score: 7.8, incidents: 4, controls: 87 },
    { month: 'Mar', score: 7.5, incidents: 6, controls: 89 },
    { month: 'Apr', score: 7.3, incidents: 3, controls: 91 },
    { month: 'May', score: 7.0, incidents: 4, controls: 93 },
    { month: 'Jun', score: 7.2, incidents: 3, controls: 92 }
  ];
}

function getDefaultRiskDistribution(): RiskDistribution[] {
  return [
    { name: 'Operational', value: 35, color: '#8884d8' },
    { name: 'Cyber', value: 25, color: '#82ca9d' },
    { name: 'Third Party', value: 20, color: '#ffc658' },
    { name: 'Compliance', value: 15, color: '#ff7300' },
    { name: 'Strategic', value: 5, color: '#00ff88' }
  ];
}

function getDefaultBusinessImpact(): BusinessImpact[] {
  return [
    { department: 'Trading', high: 2, medium: 5, low: 8 },
    { department: 'Lending', high: 1, medium: 3, low: 12 },
    { department: 'Operations', high: 3, medium: 7, low: 6 },
    { department: 'Technology', high: 4, medium: 8, low: 4 },
    { department: 'Compliance', high: 1, medium: 2, low: 9 }
  ];
}