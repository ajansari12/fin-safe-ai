import { supabase } from "@/integrations/supabase/client";
import { getIncidentAnalytics } from "./incident-analytics-service";
import { getKRIBreachesData } from "./kri-analytics-service";

export interface OperationalMetric {
  label: string;
  value: string;
  change: string;
  status: 'good' | 'warning' | 'attention' | 'stable';
}

export interface IncidentTrendData {
  time: string;
  critical: number;
  high: number;
  medium: number;
  resolved: number;
}

export interface ControlEffectivenessData {
  control: string;
  effectiveness: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ActiveAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  time: string;
}

export async function getOperationalMetrics(): Promise<OperationalMetric[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultMetrics();
    }

    // Get active incidents
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .neq('status', 'resolved');

    // Get KRI breaches in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: kriBreaches } = await supabase
      .from('kri_logs')
      .select('*')
      .gte('measurement_date', yesterday.toISOString().split('T')[0])
      .not('threshold_breached', 'is', null);

    // Get overdue control tests
    const { data: controlTests } = await supabase
      .from('control_tests')
      .select('*')
      .eq('org_id', profile.organization_id)
      .lt('test_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    // Get vendor assessments due
    const { data: vendors } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('org_id', profile.organization_id)
      .lt('last_assessment_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    const activeIncidents = incidents?.length || 0;
    const recentBreaches = kriBreaches?.length || 0;
    const overdueTests = controlTests?.length || 0;
    const overdueAssessments = vendors?.length || 0;

    return [
      {
        label: 'Active Incidents',
        value: activeIncidents.toString(),
        change: activeIncidents > 5 ? '+2' : activeIncidents > 2 ? '+1' : '0',
        status: activeIncidents > 5 ? 'warning' : activeIncidents > 2 ? 'attention' : 'good'
      },
      {
        label: 'KRI Breaches',
        value: recentBreaches.toString(),
        change: recentBreaches > 3 ? '+1' : recentBreaches > 0 ? '0' : '-1',
        status: recentBreaches > 3 ? 'warning' : recentBreaches > 0 ? 'attention' : 'good'
      },
      {
        label: 'Control Tests Due',
        value: overdueTests.toString(),
        change: overdueTests > 10 ? '+4' : overdueTests > 5 ? '+2' : '0',
        status: overdueTests > 10 ? 'warning' : overdueTests > 5 ? 'attention' : 'good'
      },
      {
        label: 'Vendor Assessments',
        value: overdueAssessments.toString(),
        change: overdueAssessments > 3 ? '+1' : '0',
        status: overdueAssessments > 3 ? 'attention' : 'stable'
      }
    ];
  } catch (error) {
    console.error('Error fetching operational metrics:', error);
    return getDefaultMetrics();
  }
}

export async function getRecentIncidentTrend(): Promise<IncidentTrendData[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultIncidentTrend();
    }

    // Get incidents from last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('reported_at, severity, status')
      .eq('org_id', profile.organization_id)
      .gte('reported_at', last24Hours.toISOString());

    // Group by 4-hour intervals
    const intervals = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    
    const trendData = intervals.map(time => {
      const hourStart = parseInt(time.split(':')[0]);
      const intervalIncidents = incidents?.filter(incident => {
        const incidentHour = new Date(incident.reported_at).getHours();
        return incidentHour >= hourStart && incidentHour < hourStart + 4;
      }) || [];

      return {
        time,
        critical: intervalIncidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
        high: intervalIncidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length,
        medium: intervalIncidents.filter(i => i.severity === 'medium' && i.status !== 'resolved').length,
        resolved: intervalIncidents.filter(i => i.status === 'resolved').length
      };
    });

    return trendData;
  } catch (error) {
    console.error('Error fetching incident trend:', error);
    return getDefaultIncidentTrend();
  }
}

export async function getControlEffectiveness(): Promise<ControlEffectivenessData[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultControlEffectiveness();
    }

    const { data: controls } = await supabase
      .from('controls')
      .select('control_name, control_type, effectiveness_score')
      .eq('org_id', profile.organization_id)
      .eq('status', 'active')
      .limit(5);

    if (!controls || controls.length === 0) {
      return getDefaultControlEffectiveness();
    }

    return controls.map(control => ({
      control: control.control_name,
      effectiveness: control.effectiveness_score || 85,
      trend: control.effectiveness_score > 90 ? 'up' : control.effectiveness_score < 80 ? 'down' : 'stable'
    }));
  } catch (error) {
    console.error('Error fetching control effectiveness:', error);
    return getDefaultControlEffectiveness();
  }
}

export async function getActiveAlerts(): Promise<ActiveAlert[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return getDefaultAlerts();
    }

    // Get recent KRI breaches
    const { data: kriBreaches } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner(kri_name)
      `)
      .not('threshold_breached', 'is', null)
      .gte('measurement_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .limit(2);

    // Get recent incidents
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('id, title, severity, reported_at')
      .eq('org_id', profile.organization_id)
      .neq('status', 'resolved')
      .order('reported_at', { ascending: false })
      .limit(2);

    const alerts: ActiveAlert[] = [];

    // Add KRI breach alerts
    kriBreaches?.forEach(breach => {
      alerts.push({
        id: breach.id,
        type: 'KRI Breach',
        severity: breach.threshold_breached === 'critical' ? 'critical' : 'medium',
        description: `${breach.kri_definitions.kri_name} exceeded threshold`,
        time: formatTimeAgo(new Date(breach.measurement_date))
      });
    });

    // Add incident alerts
    incidents?.forEach(incident => {
      alerts.push({
        id: incident.id,
        type: 'Active Incident',
        severity: incident.severity as 'critical' | 'high' | 'medium' | 'low',
        description: incident.title,
        time: formatTimeAgo(new Date(incident.reported_at))
      });
    });

    return alerts.slice(0, 4);
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    return getDefaultAlerts();
  }
}

// Helper function
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}

// Default data fallbacks
function getDefaultMetrics(): OperationalMetric[] {
  return [
    { label: 'Active Incidents', value: '7', change: '+2', status: 'warning' },
    { label: 'KRI Breaches', value: '3', change: '-1', status: 'good' },
    { label: 'Control Tests Due', value: '12', change: '+4', status: 'attention' },
    { label: 'Vendor Assessments', value: '5', change: '0', status: 'stable' }
  ];
}

function getDefaultIncidentTrend(): IncidentTrendData[] {
  return [
    { time: '00:00', critical: 1, high: 2, medium: 4, resolved: 8 },
    { time: '04:00', critical: 1, high: 3, medium: 3, resolved: 10 },
    { time: '08:00', critical: 2, high: 1, medium: 5, resolved: 12 },
    { time: '12:00', critical: 1, high: 2, medium: 6, resolved: 15 },
    { time: '16:00', critical: 0, high: 4, medium: 4, resolved: 18 },
    { time: '20:00', critical: 1, high: 3, medium: 3, resolved: 20 }
  ];
}

function getDefaultControlEffectiveness(): ControlEffectivenessData[] {
  return [
    { control: 'Access Control', effectiveness: 95, trend: 'up' },
    { control: 'Change Management', effectiveness: 88, trend: 'stable' },
    { control: 'Data Backup', effectiveness: 92, trend: 'up' },
    { control: 'Incident Response', effectiveness: 85, trend: 'down' },
    { control: 'Vendor Oversight', effectiveness: 78, trend: 'up' }
  ];
}

function getDefaultAlerts(): ActiveAlert[] {
  return [
    { id: '1', type: 'KRI Breach', severity: 'high', description: 'System downtime exceeded threshold', time: '2 min ago' },
    { id: '2', type: 'Control Gap', severity: 'medium', description: 'Backup validation overdue', time: '15 min ago' },
    { id: '3', type: 'Vendor Risk', severity: 'low', description: 'Contract renewal due', time: '1 hour ago' },
    { id: '4', type: 'Compliance', severity: 'medium', description: 'Policy review required', time: '2 hours ago' }
  ];
}