import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';

export interface EscalationPolicy {
  id: string;
  org_id: string;
  policy_name: string;
  description?: string;
  levels: EscalationLevel[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationLevel {
  level: number;
  delay: number; // minutes
  recipients: string[];
  notification_template_id?: string;
}

export interface EscalationExecution {
  id: string;
  org_id: string;
  alert_id: string;
  alert_title: string;
  escalation_policy_id: string;
  escalation_level: number;
  escalation_reason: string;
  status: 'active' | 'resolved' | 'cancelled';
  escalated_at: string;
  resolved_at?: string;
  assigned_to?: string;
  assigned_to_name?: string;
}

class EscalationService {
  async getEscalationMetrics(orgId: string): Promise<any> {
    const { data: escalations } = await supabase
      .from('escalation_executions')
      .select('*')
      .eq('org_id', orgId);

    if (!escalations) return this.getEmptyMetrics();

    const totalEscalations = escalations.length;
    const activeEscalations = escalations.filter(e => e.status === 'active').length;
    const resolvedEscalations = escalations.filter(e => e.status === 'resolved').length;
    const avgResolutionTime = this.calculateAverageResolutionTime(escalations);

    return {
      totalEscalations,
      activeEscalations,
      resolvedEscalations,
      avgResolutionTime,
      escalationsByLevel: this.groupByLevel(escalations),
      escalationTrends: this.generateTrends(escalations)
    };
  }

  async getActiveEscalations(orgId: string): Promise<EscalationExecution[]> {
    const { data, error } = await supabase
      .from('escalation_executions')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('escalated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRecentEscalations(orgId: string, limit: number = 50): Promise<EscalationExecution[]> {
    const { data, error } = await supabase
      .from('escalation_executions')
      .select('*')
      .eq('org_id', orgId)
      .order('escalated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  private calculateAverageResolutionTime(escalations: EscalationExecution[]): number {
    const resolved = escalations.filter(e => e.resolved_at);
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, e) => {
      const escalatedAt = new Date(e.escalated_at).getTime();
      const resolvedAt = new Date(e.resolved_at!).getTime();
      return sum + (resolvedAt - escalatedAt);
    }, 0);

    return totalTime / resolved.length / (1000 * 60 * 60); // Convert to hours
  }

  private groupByLevel(escalations: EscalationExecution[]): Record<string, number> {
    return escalations.reduce((acc, e) => {
      const level = e.escalation_level.toString();
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateTrends(escalations: EscalationExecution[]): Array<{ date: string; count: number }> {
    const trends: Record<string, number> = {};

    escalations.forEach(e => {
      const date = new Date(e.escalated_at).toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private getEmptyMetrics() {
    return {
      totalEscalations: 0,
      activeEscalations: 0,
      resolvedEscalations: 0,
      avgResolutionTime: 0,
      escalationsByLevel: {},
      escalationTrends: []
    };
  }
}

export const escalationService = new EscalationService();
